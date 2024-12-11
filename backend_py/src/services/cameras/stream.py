from dataclasses import dataclass
from typing import List
import subprocess
from multiprocessing import Process
import time
import shlex
import threading
import event_emitter as events

from .camera_types import *

import logging

@dataclass
class Stream(events.EventEmitter):
    device_path: str = ''
    encode_type: StreamEncodeTypeEnum = None
    stream_type: StreamTypeEnum = StreamTypeEnum.UDP
    endpoints: List[StreamEndpoint] = field(default_factory=list)
    width: int = None
    height: int = None
    interval: Interval = field(default_factory=Interval)
    configured: bool = False

    def _construct_pipeline(self):
        return f'{self._build_source()} ! {self._construct_caps()} ! {self._build_payload()} ! {self._build_sink()}'

    def _get_format(self):
        match self.encode_type:
            case StreamEncodeTypeEnum.H264:
                return 'video/x-h264'
            case StreamEncodeTypeEnum.MJPG:
                return 'image/jpeg'
            case _:
                return ''

    def _build_source(self):
        return f'v4l2src device={self.device_path}'

    def _construct_caps(self):
        return f'{self._get_format()},width={self.width},height={self.height},framerate={self.interval.denominator}/{self.interval.numerator}'

    def _build_payload(self):
        match self.encode_type:
            case StreamEncodeTypeEnum.H264:
                return 'h264parse ! queue ! rtph264pay config-interval=10 pt=96'
            case StreamEncodeTypeEnum.MJPG:
                return 'rtpjpegpay'
            case _:
                return ''

    def _build_sink(self):
        match self.stream_type:
            case StreamTypeEnum.UDP:
                if len(self.endpoints) == 0:
                    return 'fakesink'
                sink = 'multiudpsink sync=true clients='
                for endpoint, i in zip(self.endpoints, range(len(self.endpoints))):
                    sink += f'{endpoint.host}:{endpoint.port}'
                    if i < len(self.endpoints)-1:
                        sink += ','

                return sink
            case _:
                return ''

    def start(*args):
        pass

    def stop(*args):
        pass

class StreamRunner(events.EventEmitter):

    def __init__(self, *streams: Stream) -> None:
        super().__init__()
        self.streams = [*streams]
        self.pipeline = None
        self.loop = None
        self.started = False
        self.composited = False
        self.error_thread = None

    def start(self):
        if self.started:
            logging.info('Joining thread')
            self.stop()
            self.error_thread.join()
        self.started = True
        self._run_pipeline()

    def stop(self):
        if not self.started:
            return
        self.started = False
        self._process.kill()
        self._process.wait()
        del self._process

    def _run_pipeline(self):
        pipeline_str = self._construct_pipeline()
        logging.info(pipeline_str)
        self._process = subprocess.Popen(
            f'gst-launch-1.0 {pipeline_str}'.split(' '), stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
        self.error_thread = threading.Thread(target=self._log_errors)
        self.error_thread.start()

    def _construct_pipeline(self):
        # If not compositing, use the original behavior
        if not self.composited:
            pipeline_strs = []
            for stream in self.streams:
                if stream.configured:
                    pipeline_strs.append(stream._construct_pipeline())
            return ' '.join(pipeline_strs)
        
        # Compositing logic
        configured_streams = [stream for stream in self.streams if stream.configured]
        
        # If no streams or only one stream, fall back to original behavior
        if len(configured_streams) <= 1:
            return ' '.join(stream._construct_pipeline() for stream in configured_streams)
        
        # Use the first stream's endpoints for the final output
        final_endpoints = configured_streams[0].endpoints
        
        # Manually construct pipeline components
        stream_sources = []
        for i, stream in enumerate(configured_streams):
            # Manually construct source pipeline without using stream's method
            source_pipeline = (
                f'v4l2src device={stream.device_path} ! '
                f'{stream._get_format()},'
                f'width={stream.width},'
                f'height={stream.height},'
                f'framerate={stream.interval.denominator}/{stream.interval.numerator} ! '
                f'videoconvert ! videoscale'
            )
            stream_sources.append(source_pipeline)
        
        # Construct videomixer pipeline
        mixer_inputs = ' '.join([
            f'input-{i}::{f"xpos={i * configured_streams[0].width}"} ' 
            for i in range(len(configured_streams))
        ])
        
        # Construct sink based on endpoints
        if len(final_endpoints) == 0:
            sink = 'fakesink'
        else:
            # Construct multiudpsink
            sink = 'multiudpsink sync=true clients='
            for endpoint, i in zip(final_endpoints, range(len(final_endpoints))):
                sink += f'{endpoint.host}:{endpoint.port}'
                if i < len(final_endpoints)-1:
                    sink += ','
        
        # Final composited pipeline
        composited_pipeline = f'''
        {' ! '.join(stream_sources)} ! 
        videomixer name=mix {mixer_inputs} ! 
        videoconvert ! 
        {configured_streams[0]._build_payload()} ! 
        {sink}
        '''
        
        return composited_pipeline.replace('\n', ' ').strip()

    def _log_errors(self):
        error_block = []
        try:
            for stderr_line in iter(self._process.stderr.readline, ''):
                stderr_line = self._process.stderr.readline()
                if stderr_line:
                    error_block.append(stderr_line)
                    logging.error(stderr_line)
                    self.stop()
                else:
                    break
        except:
            pass
        if len(error_block) > 0:
            self.stop()
            self.emit('gst_error', error_block)
