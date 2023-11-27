import time
from ctypes import *
import pprint

import random

from enumeration import *
from camera_helper_loader import *
from schemas import *
from device import *
from stream import *

import threading

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.json.sort_keys = False
devices: list[EHDDevice] = []


def find_device_with_bus_info(bus_info: str) -> (EHDDevice | None):
    for device in devices:
        if device.bus_info == bus_info:
            return device
    return None


@app.route('/devices', methods=['GET'])
def get_devices():
    return jsonify(DeviceSchema().dump(devices, many=True))


@app.route('/devices/set_option', methods=['POST'])
def set_option():
    option_value = OptionValueSchema().load(request.get_json())
    device = find_device_with_bus_info(option_value['bus_info'])

    if not device:
        return jsonify({})
    value = option_value['value']
    match option_value['option']:
        case OptionTypeEnum.BITRATE:
            device.set_bitrate(value)
        case OptionTypeEnum.MODE:
            device.set_mode(value)
        case OptionTypeEnum.GOP:
            device.set_gop(value)
    return jsonify({})


@app.route('/devices/configure_stream', methods=['POST'])
def configure_stream():
    stream_info = StreamInfoSchema().load(request.get_json())
    device = find_device_with_bus_info(stream_info['bus_info'])

    if not device:
        return jsonify({})

    stream_format = stream_info['stream_format']
    width: int = stream_format['width']
    height: int = stream_format['height']
    interval: Interval = Interval(
        stream_format['interval']['numerator'], stream_format['interval']['denominator'])
    encode_type: StreamEncodeTypeEnum = stream_info['encode_type']
    endpoints = stream_info['endpoints']

    device.configure_stream(encode_type, width, height,
                            interval, StreamTypeEnum.UDP, endpoints)
    device.stream.start()
    return jsonify({})


@app.route('/devices/set_nickname', methods=['POST'])
def set_nickname():
    device_nickname = DeviceNicknameSchema().load(request.get_json())
    device = find_device_with_bus_info(device_nickname['bus_info'])
    if not device:
        return jsonify({})
    nickname = device_nickname['nickname']
    device.nickname = nickname
    return jsonify({})


def list_diff(listA, listB):
    # find the difference between lists
    diff = []
    for element in listA:
        if element not in listB:
            diff.append(element)
    return diff


def save_device(device: EHDDevice):
    pass


def monitor(devices):
    # monitor devices for changes
    old_device_list = []

    try:
        while True:
            devices_info = list_devices()

            # find the new devices
            new_devices = list_diff(devices_info, old_device_list)

            # find the removed devices
            removed_devices = list_diff(old_device_list, devices_info)

            # add the new devices
            for device_info in new_devices:
                if not is_ehd(device_info):
                    continue
                # if the device is not ready (essentially meaning the linux filesystem has not been populated yet),
                # this will error, resulting in the loop continuing
                # yes, this is a bit hacky, but there is no real cleaner way of doing this
                device = None
                try:
                    device = EHDDevice(device_info)
                except Exception as e:
                    print(e)
                    continue
                print(f'Device Added: {device_info.bus_info}')
                pprint.pprint(DeviceSchema(
                    only=['vid', 'pid', 'nickname', 'bus_info', 'stream', 'controls', 'options'], exclude=['stream.device_path', 'controls.flags']).dump(
                    device), depth=1, compact=True, sort_dicts=False)
                # append the device to the device list
                devices.append(device)
                # add the device info to the device list
                old_device_list.append(device_info)

            # remove the old devices
            for device_info in removed_devices:
                for device in devices:
                    if device.device_info == device_info:
                        devices.remove(device)
                        # remove the device info from the old device list
                        old_device_list.remove(device_info)
                        print(f'Device Removed: {device_info.bus_info}')

            # do not overload the bus
            time.sleep(0.1)
    except KeyboardInterrupt:
        for device in devices:
            device.stream.stop()


def main():
    monitor_process = threading.Thread(target=monitor, args=[devices])

    monitor_process.start()
    app.run(port=8080)

    # device1 = EHDDevice(DeviceInfo('exploreHD', 'asdf', [
    #                     '/dev/video2', '/dev/video3', '/dev/video4', '/dev/video5'], 0xc45, 0x6366))
    # device2 = EHDDevice(DeviceInfo('exploreHD', 'asdf', [
    #                     '/dev/video6', '/dev/video7', '/dev/video8', '/dev/video9'], 0xc45, 0x6366))
    # print(device1.get_bitrate())
    # print(device2.get_bitrate())
    # device1.set_bitrate(200000000)
    # device2.set_bitrate(100000000)
    # time.sleep(1)
    # print(device1.get_bitrate())
    # print(device2.get_bitrate())


if __name__ == '__main__':
    main()
