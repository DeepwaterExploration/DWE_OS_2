from typing import *
import threading
import time
import json

from .saved_types import *
from .schemas import SavedDeviceSchema, SavedPrefrencesSchema
from .device import EHDDevice


class SettingsManager:

    def __init__(self) -> None:
        try:
            self.file_object = open('./device_settings.json', 'r+')
        except FileNotFoundError:
            open('./device_settings.json', 'w').close()
            self.file_object = open('./device_settings.json', 'r+')
        self.to_save: List[SavedDevice] = []
        self.thread = threading.Thread(target=self._run_settings_sync)
        self.thread.start()

        try:
            settings: list[Dict] = json.loads(self.file_object.read())
            self.settings: List[SavedDevice] = SavedDeviceSchema(
                many=True).load(settings)
        except json.JSONDecodeError:
            self.file_object.seek(0)
            self.file_object.write('[]')
            self.file_object.truncate()
            self.settings = []
            self.file_object.flush()

    def load_device(self, device: EHDDevice):
        for saved_device in self.settings:
            if saved_device.bus_info == device.bus_info:
                device.load_settings(saved_device)
                return

    def _save_device(self, saved_device: SavedDevice):
        for dev in self.settings:
            if dev.bus_info == saved_device.bus_info:
                self.settings.remove(dev)
                break
        self.settings.append(saved_device)
        self.file_object.seek(0)
        self.file_object.write(
            json.dumps(SavedDeviceSchema(many=True).dump(self.settings)))
        self.file_object.truncate()
        self.file_object.flush()

    def _run_settings_sync(self):
        while True:
            for saved_device in self.to_save:
                self._save_device(saved_device)
            self.to_save = []
            time.sleep(1)

    def save_device(self, device: EHDDevice):
        saved_device = SavedDeviceSchema().load(SavedDeviceSchema().dump(device))
        # schedule a save command
        self.to_save.append(saved_device)

class DefaultRecording(RecordingConfig):
    def __init__(self):
        self.defaultName = "$CAMERA-$EPOCH"
        self.defaultFormat = StreamEncodeTypeEnum.MJPEG
        self.defaultResolution = "1920x1080"
        self.defaultFPS = 30
class DefaultStream(StreamConfig):
    def __init__(self):
        self.defaultHost = "192.168.2.1"
        self.defaultPort = "5600"
class DefaultPrefrences(SavedPrefrences):
    def __init__(self):
        self.defaultRecording = DefaultRecording()
        self.defaultStream = DefaultStream()


class PrefrencesManager:

    def __init__(self) -> None:
        try:
            self.file_object = open('./server_prefrences.json', 'r+')
        except FileNotFoundError:
            open('./server_prefrences.json', 'w').close()
            self.file_object = open('./server_prefrences.json', 'r+')

        try:
            settings: Dict = json.loads(self.file_object.read())
            self.settings: SavedPrefrences = SavedPrefrencesSchema().load(settings)
        except json.JSONDecodeError:
            self.settings = DefaultPrefrences()
            self._saveSettings()

    def saveValue(self, type: Literal["defaultRecording", "defaultStream"], key: str, value):
        dict = SavedPrefrencesSchema().dump(self.settings)
        dict[type][key]=value
        self.settings=SavedPrefrencesSchema().load(dict)
        self._saveSettings()
    def _saveSettings(self):
        self.file_object.seek(0)
        self.file_object.write(
            json.dumps(SavedPrefrencesSchema().dump(self.settings)))
        self.file_object.truncate()
        self.file_object.flush()

    def getSettings(self):
        return SavedPrefrencesSchema().dump(self.settings)


