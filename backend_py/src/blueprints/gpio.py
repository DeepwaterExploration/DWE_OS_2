from flask import Blueprint, request, jsonify, current_app
from ..services import LightManager

gpio_bp = Blueprint('gpio', __name__)

@gpio_bp.route('/gpio/pins')
def get_lights():
    light_manager: LightManager = current_app.config['light_manager']

    return jsonify(light_manager.get_lights())

@gpio_bp.route('/gpio/set_intensity', methods=['POST'])
def set_intensity():
    light_manager: LightManager = current_app.config['light_manager']

    req = request.get_json()
    light_manager.set_intensity(req['index'], req['intensity'])
    return jsonify({})

@gpio_bp.route('/gpio/disable_pin', methods=['POST'])
def disable_light():
    light_manager: LightManager = current_app.config['light_manager']

    req = request.get_json()
    light_manager.disable_light(req['controller_index'], req['pin'])
    return jsonify({})
