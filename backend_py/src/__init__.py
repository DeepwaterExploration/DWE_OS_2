from ctypes import *
import sys
import signal

from flask import Flask, jsonify, request
from flask_cors import CORS
from gevent.pywsgi import WSGIServer

from .enumeration import *
from .camera_helper_loader import *
from .schemas import *
from .device import *
from .stream import *
from .settings import SettingsManager, PrefrencesManager
from .broadcast_server import BroadcastServer
from .device_manager import DeviceManager
from .recording import Saving
import logging


def main():
    app = Flask(__name__)
    CORS(app)
    app.json.sort_keys = False

    settings_manager = SettingsManager()
    prefrences_manager = PrefrencesManager()
    broadcast_server = BroadcastServer()
    device_manager = DeviceManager(
        settings_manager=settings_manager, broadcast_server=broadcast_server)

    @app.route('/devices', methods=['GET'])
    def get_devices():
        return jsonify(device_manager.get_devices())

    @app.route('/devices/set_option', methods=['POST'])
    def set_option():
        option_value = OptionValueSchema().load(request.get_json())

        device_manager.set_device_option(
            option_value['bus_info'], option_value['option'], option_value['value'])

        return jsonify({})

    @app.route('/devices/get_next_port', methods=['GET'])
    def get_next_port():
        return jsonify({'port': device_manager.get_next_port(request.args.get('host'))})

    @app.route('/devices/configure_stream', methods=['POST'])
    def configure_stream():
        stream_info = StreamInfoSchema().load(request.get_json())

        device_manager.configure_device_stream(
            stream_info['bus_info'], stream_info)

        return jsonify({})
    
    @app.route('/devices/unconfigure_stream', methods=['POST'])
    def unconfigure_stream():
        bus_info = StreamInfoSchema(only=['bus_info']).load(
            request.get_json())['bus_info']

        device_manager.uncofigure_device_stream(bus_info)

        return jsonify({})
    @app.route('/devices/start_recording', methods=['POST'])
    def configure_video():
        stream_info = SaveInfoSchema().load(request.get_json())
        
        stream_time = device_manager.start_file_saving(
            stream_info['bus_info'], stream_info)

        return jsonify({"startTime": stream_time})
    @app.route('/devices/recording_state', methods=['POST'])
    def get_video_state():
        stream_info = SaveInfoSchema(only=['bus_info']).load(request.get_json())

        recording = device_manager.get_is_recording(stream_info['bus_info'])

        return jsonify(recording)
    @app.route('/devices/all_recording', methods=["GET"])
    def get_video_states():
        devices = device_manager.devices
        def mapper(device):
            return device_manager.get_is_recording(device.bus_info)
        recordings = map(mapper, devices)
        active = filter(lambda r: r['recording'], recordings)
        return jsonify(list(active))
    @app.route('/devices/stop_recording', methods=['POST'])
    def unconfigure_video():
        stream_info = SaveInfoSchema(only=['bus_info']).load(request.get_json())

        filePath = device_manager.stop_file_saving(
            stream_info['bus_info'])

        return jsonify({"path":filePath})
    
    @app.route('/devices/set_nickname', methods=['POST'])
    def set_nickname():
        device_nickname = DeviceNicknameSchema().load(request.get_json())

        device_manager.set_device_nickname(
            device_nickname['bus_info'], device_nickname['nickname'])

        return jsonify({})

    @app.route('/devices/set_uvc_control', methods=['POST'])
    def set_uvc_control():
        uvc_control = UVCControlSchema().load(request.get_json())

        device_manager.set_device_uvc_control(
            uvc_control['bus_info'], uvc_control['control_id'], uvc_control['value'])

        return jsonify({})


    @app.route('/prefrences', methods=['GET'])
    def get_prefrences():
        return jsonify(prefrences_manager.getSettings())
    @app.route('/setprefrences',methods=['POST'])
    def set_prefrences():
        prefrences_manager.saveValue(
            type=request.get_json().get('type'),
            key=request.get_json().get('key'),
            value=request.get_json().get('value')
        )
        return jsonify({})
    http_server = WSGIServer(('0.0.0.0', 8080), app, log=None)
    device_manager.start_monitoring()

    def exit_clean(sig, frame):
        logging.info('Shutting down')

        http_server.stop()
        device_manager.stop_monitoring()
        broadcast_server.kill()

        sys.exit(0)

    broadcast_server.run_in_background()
    signal.signal(signal.SIGINT, exit_clean)

    logging.info('Starting backend server on http://0.0.0.0:8080')
    http_server.serve_forever()


if __name__ == '__main__':
    main()
