from dataclasses import dataclass
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

    def _start(self):
        pipeline = self._construct_pipeline()
        self._process = subprocess.Popen(pipeline, stdout=subprocess.DEVNULL)

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
        self._process.kill()
        del self._process
    def __str__(self):
        return " ".join(self._construct_pipeline())
    def _construct_pipeline(self):
        return ["gst-launch-1.0", "v4l2src", "device="+self.device_path, "!", "videoconvert", "!", "x264enc", "!", "mp4mux", "!", "filesink", "location="+self.path+"/"+datetime.now().strftime(self.strftime)+".mp4"]

