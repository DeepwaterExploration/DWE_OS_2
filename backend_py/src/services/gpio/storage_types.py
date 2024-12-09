from dataclasses import dataclass
from marshmallow import Schema, fields, post_load

@dataclass
class PinState:
    pin_info: str
    frequency: float
    duty_cycle: float

class PinStateSchema(Schema):
    pin_info = fields.Str(required=True)
    frequency = fields.Float(required=True)
    duty_cycle = fields.Float(required=True)

    @post_load
    def make_pin_state(self, data, **kwargs) -> PinState:
        return PinState(**data)
