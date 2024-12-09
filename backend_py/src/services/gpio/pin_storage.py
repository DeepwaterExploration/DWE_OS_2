import json
from typing import Dict
from .storage_types import PinState, PinStateSchema

class PinStateStorage:

    def __init__(self, settings_path: str = '.') -> None:
        path = f'{settings_path}/pin_storage.json'
        try:
            self.file_object = open(path, 'r+')
        except FileNotFoundError:
            open(path, 'w').close()
            self.file_object = open(path, 'r+')
        
        try:
            settings = json.loads(self.file_object.read())
            self.pin_states: Dict[str, PinState] = {state.pin_info: state for state in PinStateSchema(many=True).load(settings)}
        except json.JSONDecodeError:
            self.pin_states = {}

    def save_pin_frequency(self, pin_info: str, frequency: float):
        try:
            self.pin_states[pin_info].frequency = frequency
        except KeyError:
            self.pin_states[pin_info] = PinState(pin_info, frequency, 0)
        self._save_settings()

    def save_pin_duty_cycle(self, pin_info: str, duty_cycle: float):
        try:
            self.pin_states[pin_info].duty_cycle = duty_cycle
        except KeyError:
            self.pin_states[pin_info] = PinState(pin_info, 0, duty_cycle)
        self._save_settings()

    def save_pin(self, pin_state: PinState):
        self.pin_states[pin_state.pin_info] = pin_state
        self._save_settings()

    def get_pin_states(self):
        return self.pin_states

    def serialize_pin_states(self):
        return PinStateSchema(many=True).dump(self.pin_states)

    def _save_settings(self):
        self.file_object.seek(0)
        self.file_object.write(
            json.dumps(PinStateSchema(many=True).dump(self.pin_states.values())))
        self.file_object.truncate()
        self.file_object.flush()