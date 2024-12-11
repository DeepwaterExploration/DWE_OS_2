from marshmallow import Schema, fields, exceptions, post_load
import typing

from .camera_types import *
from .saved_types import *
from .device import DeviceType


class CameraIntervalSchema(Schema):
    numerator = fields.Int()
    denominator = fields.Int()


class CameraFormatSizeSchema(Schema):
    width = fields.Int()
    height = fields.Int()
    intervals = fields.List(fields.Nested(CameraIntervalSchema))


class CameraSchema(Schema):
    path = fields.Str()
    formats = fields.Dict(fields.Str(),
                          fields.Nested(CameraFormatSizeSchema, many=True))


class MenuItem(Schema):
    index = fields.Int()
    name = fields.Str()


class ControlFlagsSchema(Schema):
    default_value = fields.Number()
    max_value = fields.Number()
    min_value = fields.Number()
    step = fields.Number()
    control_type = fields.Enum(ControlTypeEnum)
    menu = fields.Nested(MenuItem, many=True)


class ControlSchema(Schema):
    flags = fields.Nested(ControlFlagsSchema)
    control_id = fields.Int()
    name = fields.Str()
    value = fields.Number()


class DeviceInfoSchema(Schema):
    device_name = fields.Str()
    bus_info = fields.Str()
    device_paths = fields.List(fields.Str())
    vid = fields.Int()
    pid = fields.Int()


class DeviceOptionsSchema(Schema):
    bitrate = fields.Int()
    gop = fields.Int()
    mode = fields.Enum(H264Mode, by_value=True)


class StreamEndpointSchema(Schema):
    host = fields.Str()
    port = fields.Int()

    @post_load()
    def make_endpoint(self, data: typing.Dict, **kwargs):
        return StreamEndpoint(data['host'], data['port'])


class StreamSchema(Schema):
    device_path = fields.Str(required=True)
    encode_type = fields.Enum(StreamEncodeTypeEnum, required=True)
    stream_type = fields.Enum(StreamTypeEnum, required=True)
    endpoints = fields.Nested(StreamEndpointSchema, many=True, required=True)
    width = fields.Int(required=True)
    height = fields.Int(required=True)
    interval = fields.Nested(CameraIntervalSchema, required=True)
    started = fields.Bool(required=True)
    configured = fields.Bool(required=True)


class DeviceSchema(Schema):
    cameras = fields.Nested(CameraSchema, many=True, required=False)
    controls = fields.Nested(ControlSchema, many=True, required=True)
    stream = fields.Nested(StreamSchema, required=True)
    name = fields.Str(required=False)
    vid = fields.Int(required=True)
    pid = fields.Int(required=True)
    bus_info = fields.Str(required=True)
    manufacturer = fields.Str(required=False)
    nickname = fields.Str(required=True)
    device_info = fields.Nested(DeviceInfoSchema, required=False)
    device_type = fields.Enum(DeviceType, required=True)
    is_leader = fields.Bool(required=False, allow_none=True)
    leader = fields.Str(required=False, allow_none=True)
    follower = fields.Str(required=False, allow_none=True)
    composited = fields.Str(required=False, allow_none=True)


class SavedDeviceSchema(DeviceSchema):
    controls = fields.Nested(ControlSchema, exclude=['flags'], many=True, required=True)
    stream = fields.Nested(StreamSchema, exclude=['device_path', 'started'], required=True)
    device_type = fields.Enum(DeviceType, required=True)

    @post_load()
    def make_saved_device(self, data: typing.Dict, **kwargs):
        interval = Interval(**data['stream']['interval'])
        saved_stream = SavedStream(data['stream']['encode_type'], data['stream']['stream_type'], data['stream']
                                   ['endpoints'], data['stream']['width'], data['stream']['height'], interval, data['stream']['configured'])
        saved_controls = []
        for control in data['controls']:
            saved_controls.append(SavedControl(
                control['control_id'], control['name'], control['value']))
            
        leader = None
        is_leader = None
        if 'leader' in data:
            is_leader = data['is_leader']
            leader = data['leader']

        return SavedDevice(data['bus_info'], data['vid'], data['pid'], data['nickname'], controls=saved_controls, stream=saved_stream, device_type=data['device_type'], leader=leader, is_leader=is_leader)


# API SCHEMAS

class StreamInfoSchema(Schema):
    bus_info = fields.Str(required=True)
    stream_format = fields.Nested(
        StreamSchema, only=['width', 'height', 'interval'], required=True)
    encode_type = fields.Enum(StreamEncodeTypeEnum, required=True)
    endpoints = fields.Nested(StreamEndpointSchema, many=True, required=True)


class DeviceNicknameSchema(Schema):
    bus_info = fields.Str(required=True)
    nickname = fields.Str(required=True)


class UVCControlSchema(Schema):
    bus_info = fields.Str(required=True)
    control_id = fields.Int(required=True)
    value = fields.Int(required=True)

class DeviceLeaderSchema(Schema):
    follower = fields.Str(required=True)
    # not required in case of removing leader
    leader = fields.Str(required=False, allow_none=True)
