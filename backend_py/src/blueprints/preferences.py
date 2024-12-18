from flask import Blueprint, request, jsonify, current_app
from typing import cast
from ..services import PreferencesManager, SavedPrefrences, SavedPrefrencesSchema

preferences_bp = Blueprint('preferences', __name__)

@preferences_bp.route('/preferences')
def get_preferences():
    preferences_manager: PreferencesManager = current_app.config['preferences_manager']

    return jsonify(preferences_manager.serialize_preferences())

@preferences_bp.route('/preferences/save_preferences', methods=['POST'])
def set_preferences():
    preferences_manager: PreferencesManager = current_app.config['preferences_manager']

    req: SavedPrefrences = cast(SavedPrefrences, SavedPrefrencesSchema().load(request.get_json()))
    preferences_manager.save(req)
    return jsonify({})

@preferences_bp.route('/preferences/get_recommended_host', methods=['GET'])
def get_recommended_host():
    host = request.remote_addr
    return jsonify({'host': host})
