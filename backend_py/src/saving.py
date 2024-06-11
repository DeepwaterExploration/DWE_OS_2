from dataclasses import dataclass
import json
import signal
import subprocess
import os
from .camera_types import *
from datetime import datetime

@dataclass
class Saving:
    device_path: str = ''
    encode_type: StreamEncodeTypeEnum = StreamEncodeTypeEnum.H264 # Only support mjpeg right now
    path: str = os.environ.get("HOME") + "/.DWE/videos"
    strftime: str = "%F-%T"
    width: int = 1920
    height: int = 1080
    interval: Interval = field(default_factory=Interval)
    configured: bool = False

    started: bool = False

    _process: subprocess.Popen = None

    _time = 0

    final_path = ""

    def _start(self):
        self._time = datetime.now().timestamp()
        pipeline = self._construct_pipeline()
        self._process = subprocess.Popen(pipeline.split(" "))


    def start(self):
        if self.started:
            self.stop()
        if not os.path.exists(path=self.path):
            print("Path doesn't exist")
            self.stop()
            return
        self.started = True
        self._start()

    def stop(self):
        if not self.started:
            return
        self.started = False
        file = open(os.path.join(self.path, "videos.json"), "r")
        json_data = json.load(file)
        file.close()
        file = open(os.path.join(self.path, "videos.json"), "w")
        json_data.append({
            "path": self.final_path,
            "camera": {
                "model": "Test",
                "nickname": "Tester",
                "id": "14xxxxx"
            },
            "dateCreated": self._time,
            "humanReadableDate": datetime.fromtimestamp(self._time).strftime("%A, %B %e, %Y %r")
        })
        json.dump(json_data, file)
        if self._process and self._process.poll() is None:
            self._process.send_signal(signal.SIGINT)
        try:
            self._process.communicate(timeout=10)  # Wait for the process to end cleanly
        except subprocess.TimeoutExpired:
            self._process.kill()
            self._process.communicate()
        del self._process
    def __str__(self):
        return self._construct_pipeline()
    def _construct_pipeline(self):
        self.final_path = os.path.join(self.path, f'{datetime.fromtimestamp(self._time).strftime(self.strftime)}.mp4')
        return (
            f"gst-launch-1.0 -e v4l2src device={self.device_path} ! videoconvert ! "
            f"x264enc ! mp4mux ! filesink location={self.final_path}"
        )
    

