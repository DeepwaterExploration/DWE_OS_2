from flask import Blueprint, request, jsonify, current_app
from ..services import GlobalPWMManager
from marshmallow import Schema, fields

gpio_bp = Blueprint('gpio', __name__)

class PinSetSchema(Schema):
    pin = fields.Str()
    frequency = fields.Float()
    duty_cycle = fields.Float()

@gpio_bp.route('/gpio/pwm_pin_mapping')
def get_pin_mapping():
    pwm_manager: GlobalPWMManager = current_app.config['pwm_manager']

    return jsonify(pwm_manager.get_mapping())

@gpio_bp.route('/gpio/pwm_pins')
def get_pins():
    pwm_manager: GlobalPWMManager = current_app.config['pwm_manager']
    
    return jsonify(pwm_manager.get_pins())

@gpio_bp.route('/gpio/set_pwm_pin', methods=['POST'])
def set_intensity():
    pwm_manager: GlobalPWMManager = current_app.config['pwm_manager']

    req = request.get_json()
    pin_set = PinSetSchema().load(req)
    pwm_manager.set_pin_frequency(pin_set['pin'], pin_set['frequency'])
    pwm_manager.set_pin_duty_cycle(pin_set['pin'], pin_set['duty_cycle'])

    return jsonify({})
