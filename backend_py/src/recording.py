from dataclasses import dataclass
import json
import signal
import subprocess
import os
import time

from .schemas import StreamSchema
from .camera_types import *
from datetime import datetime
import grp
@dataclass
class Saving:
    h264_streamer: str = ""
    mjpeg_streamer: str = ""
    encode_type: StreamEncodeTypeEnum = StreamEncodeTypeEnum.H264
    path: str = os.path.join(os.environ.get("HOME"),".DWE","videos")
    strftime: str = "%F-%T"
    width: int = 1920
    height: int = 1080
    interval: Interval = field(default_factory=Interval)
    configured: bool = False
    cameraData: cameraName = cameraName("","","")

    started: bool = False

    _process: subprocess.Popen = None

    _time = 0

    final_path = ""

    def _start(self):
        self._time = datetime.now().timestamp()
        pipeline = self._construct_pipeline()
        self._process = subprocess.Popen(pipeline.split(" "), stdout=subprocess.DEVNULL)

        
    def start(self):
        if self.started:
            self.stop()
        if not os.path.exists(path=self.path):
            self.stop()
            return
        self.started = True
        self._start()
    def stop(self):
        if not self.started:
            return
        self.started = False
        file = open(os.path.join(self.path, "videos.json"), "r")
        try:
            json_data = json.load(file)
        except:
            json_data = []
        file.close()
        file = open(os.path.join(self.path, "videos.json"), "w")
        json_data.append({
            "path": self.final_path,
            "camera": {
                "model": self.cameraData.model,
                "nickname": self.cameraData.nickname,
                "id": self.cameraData.id
            },
            "dateCreated": self._time,
            "humanReadableDate": datetime.fromtimestamp(self._time).strftime("%A, %B %e, %Y %r")
        })
        json.dump(json_data, file)
        stat_info = os.stat(self.path)
        uid = stat_info.st_uid
        gid = stat_info.st_gid

        if self._process and self._process.poll() is None:
            self._process.send_signal(signal.SIGINT)
        try:
            self._process.communicate(timeout=10)  # Wait for the process to end cleanly
        except subprocess.TimeoutExpired:
            self._process.kill()
            self._process.communicate()
        del self._process
        self._time = 0
        time.sleep(0.01)
        os.chown(self.final_path, uid, gid) # Don't make our file sudo


    def __str__(self):
        return self._construct_pipeline()
    def _construct_pipeline(self):
        return (f'gst-launch-1.0 -e {self._build_source()} ! {self._build_payload()} ! {self._build_sink()}')
    def _build_source(self):
        '''Set the video4linux device'''
        return f'v4l2src device={self._get_path()}'
    def _get_format(self):
        '''Convert an enum to the corresponding encode type'''
        match self.encode_type:
            case StreamEncodeTypeEnum.H264:
                return 'video/x-h264'
            case StreamEncodeTypeEnum.MJPEG:
                return 'image/jpeg'
            case _:
                return ''
    def _get_extension(self):
        '''Create the file extension based on the format'''
        match self.encode_type:
            case StreamEncodeTypeEnum.H264:
                return 'mp4'
            case StreamEncodeTypeEnum.MJPEG:
                return 'avi'
            case _:
                return 'unknown' 
    def _get_path(self):
        '''dictates weather to use a mjeg or h264 device'''
        match self.encode_type:
            case StreamEncodeTypeEnum.H264:
                return self.h264_streamer
            case StreamEncodeTypeEnum.MJPEG:
                return self.mjpeg_streamer
            case _:
                return ''
    def _build_payload(self):
        '''Add values like format, width, height, and FPS to the pipeline as well as the conversion parameters'''
        base = f"{self._get_format()},width={self.width},height={self.height},framerate={self.interval.denominator}/{self.interval.numerator}"
        if self.encode_type == StreamEncodeTypeEnum.H264:
            return f"{base} ! h264parse ! queue ! mp4mux"
        elif self.encode_type == StreamEncodeTypeEnum.MJPEG:
            return f"{base} ! queue ! avimux"
    def _build_sink(self):
        '''Create final file location'''
        self.final_path = os.path.join(self.path, f'{datetime.fromtimestamp(self._time).strftime(self.strftime)}.{self._get_extension()}'.replace(" ",""))
        return f"filesink location={self.final_path}"
    def set_customization(self, schema: StreamSchema):
        '''Change parameters about the recording'''
        try:
            schema = StreamSchema().load(data=schema)
        except:
            return # invalid data
        if "width" in schema:
            self.width = schema['width']
        if "height" in schema:
            self.height = schema['height']
        if "interval" in schema:
            temp_int = schema['interval']
            if "numerator" in schema["interval"] and "denominator" in schema['interval']:
                self.interval.numerator = temp_int['numerator']
                self.interval.denominator = temp_int['denominator']
