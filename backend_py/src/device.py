from ctypes import *
import struct
from dataclasses import dataclass

from v4l2py.device import Device

from . import v4l2
from . import ehd_controls as xu

from . import utils
from .enumeration import *
from .camera_helper_loader import *
from .camera_types import *
from .stream import *
from .saved_types import *


class Camera:
    '''
    Camera base class
    '''

    def __init__(self, path: str) -> None:
        self.path = path
        self._file_object = open(path)
        self._fd = self._file_object.fileno()  # get the file descriptor
        self._get_formats()

    # uvc_set_ctrl function defined in uvc_functions.c
    def uvc_set_ctrl(self, unit: xu.Unit, ctrl: xu.Selector, data: bytes, size: int) -> int:
        return camera_helper.uvc_set_ctrl(self._fd, unit, ctrl, data, size)

    # uvc_get_ctrl function defined in uvc_functions.c
    def uvc_get_ctrl(self, unit: xu.Unit, ctrl: xu.Selector, data: bytes, size: int) -> int:
        return camera_helper.uvc_get_ctrl(self._fd, unit, ctrl, data, size)

    def _get_formats(self):
        self.formats = {}
        for i in range(1000):
            v4l2_fmt = v4l2.v4l2_fmtdesc()
            v4l2_fmt.index = i
            v4l2_fmt.type = v4l2.V4L2_BUF_TYPE_VIDEO_CAPTURE
            try:
                fcntl.ioctl(self._fd, v4l2.VIDIOC_ENUM_FMT, v4l2_fmt)
            except:
                break

            format_sizes = []
            for j in range(1000):
                frmsize = v4l2.v4l2_frmsizeenum()
                frmsize.index = j
                frmsize.pixel_format = v4l2_fmt.pixelformat
                try:
                    fcntl.ioctl(self._fd, v4l2.VIDIOC_ENUM_FRAMESIZES, frmsize)
                except:
                    break
                if frmsize.type == v4l2.V4L2_FRMSIZE_TYPE_DISCRETE:
                    format_size = FormatSize(
                        frmsize.discrete.width, frmsize.discrete.height, [])
                    for k in range(1000):
                        frmival = v4l2.v4l2_frmivalenum()
                        frmival.index = k
                        frmival.pixel_format = v4l2_fmt.pixelformat
                        frmival.width = frmsize.discrete.width
                        frmival.height = frmsize.discrete.height
                        try:
                            fcntl.ioctl(
                                self._fd, v4l2.VIDIOC_ENUM_FRAMEINTERVALS, frmival)
                        except:
                            break
                        if frmival.type == v4l2.V4L2_FRMIVAL_TYPE_DISCRETE:
                            format_size.intervals.append(
                                Interval(frmival.discrete.numerator, frmival.discrete.denominator))
                    format_sizes.append(format_size)
            self.formats[utils.fourcc2s(v4l2_fmt.pixelformat)] = format_sizes


class Option:
    '''
    EHD Option Class
    '''

    def __init__(self, camera: Camera, fmt: str, unit: xu.Unit, ctrl: xu.Selector, command: xu.Command, size=11) -> None:
        self._camera = camera
        self._fmt = fmt

        self._unit = unit
        self._ctrl = ctrl
        self._command = command
        self._size = size
        self._data = b'\x00' * size

    # get the control value(s)
    def get_value(self):
        self._get_ctrl()
        values = self._unpack(self._fmt)
        self._clear()
        # all cases will basically be this, but otherwise this will still work
        if len(values) == 1:
            return values[0]
        return values

    # set the control value
    def set_value(self, *arg: list):
        self._pack(self._fmt, *arg)
        self._set_ctrl()
        self._clear()

    # pack data to internal buffer
    def _pack(self, fmt: str, *arg: list) -> None:
        data = struct.pack(fmt, *arg)
        # make sure the data is of the right length
        self._data = data + bytearray(self._size - len(data))

    # unpack data from internal buffer
    def _unpack(self, fmt: str) -> list:
        return struct.unpack_from(fmt, self._data)

    def _set_ctrl(self):
        data = bytearray(self._size)
        data[0] = xu.EHD_DEVICE_TAG
        data[1] = self._command.value

        # Switch command
        self._camera.uvc_set_ctrl(
            self._unit.value, self._ctrl.value, bytes(data), self._size)

        self._camera.uvc_set_ctrl(
            self._unit.value, self._ctrl.value, self._data, self._size)

    def _get_ctrl(self):
        data = bytearray(self._size)
        data[0] = xu.EHD_DEVICE_TAG
        data[1] = self._command.value
        self._data = bytes(self._size)
        # Switch command
        self._camera.uvc_set_ctrl(
            self._unit.value, self._ctrl.value, bytes(data), self._size)

        self._camera.uvc_get_ctrl(
            self._unit.value, self._ctrl.value, self._data, self._size)

    def _clear(self):
        self._data = b'\x00' * self._size


def is_ehd(device_info: DeviceInfo):
    return (
        device_info.vid == 0xc45 and
        device_info.pid == 0x6366 and
        len(device_info.device_paths) == 4
    )


@dataclass
class OptionValues:
    bitrate: int
    gop: int
    mode: H264Mode


class EHDDevice:

    name: str = 'exploreHD'
    manufacturer: str = 'DeepWater Exploration Inc.'

    def __init__(self, device_info: DeviceInfo) -> None:
        # make sure this is an exploreHD
        assert (is_ehd(device_info))

        self._options: dict[str, Option] = {}

        self.cameras: List[Camera] = []
        for device_path in device_info.device_paths:
            self.cameras.append(Camera(device_path))

        self.device_info = device_info
        self.vid = device_info.vid
        self.pid = device_info.pid
        self.bus_info = device_info.bus_info
        self.nickname = ''
        self.controls = []
        self.stream = Stream()
        self.v4l2_device = Device(self.cameras[0].path)
        self.v4l2_device.open()

        # UVC xu bitrate control
        self._options['bitrate'] = Option(
            self.cameras[2], '>I', xu.Unit.USR_ID, xu.Selector.USR_H264_CTRL, xu.Command.H264_BITRATE_CTRL)

        # UVC xu gop control
        self._options['gop'] = Option(
            self.cameras[2], 'H', xu.Unit.USR_ID, xu.Selector.USR_H264_CTRL, xu.Command.GOP_CTRL)

        # UVC xu H264 mode control
        self._options['mode'] = Option(
            self.cameras[2], 'B', xu.Unit.USR_ID, xu.Selector.USR_H264_CTRL, xu.Command.H264_MODE_CTRL)

        self.options = OptionValues(
            self.get_bitrate(),
            self.get_gop(),
            self.get_mode()
        )

        self._get_controls()

    def configure_stream(self, encode_type: StreamEncodeTypeEnum, width: int, height: int, interval: Interval, stream_type: StreamTypeEnum, stream_endpoints: List[StreamEndpoint] = []):
        camera: Camera = None
        match encode_type:
            case StreamEncodeTypeEnum.H264:
                camera = self.cameras[2]
            case StreamEncodeTypeEnum.MJPEG:
                camera = self.cameras[0]
            case _:
                raise Exception()

        self.stream.device_path = camera.path
        self.stream.width = width
        self.stream.height = height
        self.stream.interval = interval
        self.stream.endpoints = stream_endpoints
        self.stream.encode_type = encode_type
        self.stream.stream_type = stream_type
        self.stream.configured = True

    def unconfigure_stream(self):
        self.stream.configured = False
        self.stream.stop()

    def get_bitrate(self):
        return self._get_option('bitrate')

    def set_bitrate(self, bitrate: int):
        self.options.bitrate = bitrate
        self._set_option('bitrate', bitrate)

    def get_gop(self):
        return self._get_option('gop')

    def set_gop(self, gop: int):
        self.options.gop = gop
        self._set_option('gop', gop)

    def get_mode(self):
        return H264Mode(self._get_option('mode'))

    def set_mode(self, mode: H264Mode):
        self.options.mode = mode
        self._set_option('mode', mode.value)

    def get_pu(self, control_id: int):
        control = self.v4l2_device.controls[control_id]
        return control.value

    def set_pu(self, control_id: int, value: int):
        control = self.v4l2_device.controls[control_id]
        try:
            control.value = value
        except AttributeError:
            pass
        for ctrl in self.controls:
            if ctrl.control_id == control_id:
                ctrl.value = value

    def load_settings(self, saved_device: SavedDevice):
        for control in saved_device.controls:
            try:
                self.set_pu(control.control_id, control.value)
            except:
                continue
        self.set_bitrate(saved_device.options.bitrate)
        self.set_gop(saved_device.options.gop)
        self.set_mode(saved_device.options.mode)
        self.configure_stream(saved_device.stream.encode_type,
                              saved_device.stream.width,
                              saved_device.stream.height,
                              saved_device.stream.interval,
                              saved_device.stream.stream_type,
                              saved_device.stream.endpoints)
        self.stream.configured = saved_device.stream.configured
        self.nickname = saved_device.nickname
        if self.stream.configured:
            self.stream.start()

    # get an option
    def _get_option(self, opt: str):
        if opt in self._options:
            return self._options[opt].get_value()
        return None

    # set an option
    def _set_option(self, opt: str, *arg: list):
        if opt in self._options:
            return self._options[opt].set_value(*arg)
        return None

    def _get_controls(self):
        fd = self.cameras[0]._fd
        self.controls = []

        for ctrl in self.v4l2_device.controls.values():
            control = Control(ctrl.id, ctrl.name, ctrl.value)

            control.flags.control_type = ControlTypeEnum(ctrl.type)
            try:
                control.flags.max_value = ctrl.maximum
            except:
                control.flags.max_value = 0
            try:
                control.flags.min_value = ctrl.minimum
            except:
                control.flags.min_value = 0
            try:
                control.flags.step = ctrl.step
            except:
                control.flags.step = 0
            control.flags.default_value = ctrl._info.default_value
            control.value = self.get_pu(ctrl.id)

            match control.flags.control_type:
                case ControlTypeEnum.MENU:
                    for i in ctrl.data:
                        menu_item = ctrl.data[i]
                        control.flags.menu.append(
                            MenuItem(i, menu_item))

            self.controls.append(control)
