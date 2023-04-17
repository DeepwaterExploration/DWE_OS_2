#include <linux/uvcvideo.h>
#include <linux/usb/video.h>
#include "v4l2-camera.hpp"

using namespace v4l2;

std::string v4l2::fourcc2s(uint32_t fourcc) {
    std::string str;
    str += fourcc & 0x7f;
    str += (fourcc >> 8) & 0x7f;
    str += (fourcc >> 16) & 0x7f;
    str += (fourcc >> 24) & 0x7f;
    if (fourcc & (1 << 31)) {
        str += '-';
        str += 'B';
        str += 'E';
    }
    return str;
}

/* v4l2::Camera definitions */

int Camera::uvc_set_ctrl(uint32_t unit, uint32_t ctrl, uint8_t *data, uint8_t size) {
    struct uvc_xu_control_query xctrlq;
    xctrlq.unit = unit;
    xctrlq.selector = ctrl;
    /* UVC query type is a SET CURRENT request */
    xctrlq.query = UVC_SET_CUR;
    xctrlq.size = size;
    xctrlq.data = data;
    /* Interface with the hardware of the H.264 enabled camera */
    return ioctl(_fd, UVCIOC_CTRL_QUERY, &xctrlq);
}

int Camera::uvc_get_ctrl(uint32_t unit, uint32_t ctrl, uint8_t *data, uint8_t size) {
    struct uvc_xu_control_query xctrlq;
    xctrlq.unit = unit;
    xctrlq.selector = ctrl;
    /* UVC query type is a GET CURRENT request */
    xctrlq.query = UVC_GET_CUR;
    xctrlq.size = size;
    xctrlq.data = data;
    /* Interface with the hardware of the H.264 enabled camera */
    return ioctl(_fd, UVCIOC_CTRL_QUERY, &xctrlq);
}

ErrorType Camera::camera_open() {
    _fd = open(_path.c_str(), O_RDWR, 0);
    if (_fd == -1) {
        return V4L2_OPEN_FAILURE;
    }
    for (uint32_t i = 0; ; i++) {
        v4l2_fmtdesc fmt = {0};
        fmt.index = i;
        fmt.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
        if (ioctl(_fd, VIDIOC_ENUM_FMT, &fmt) == -1) break;
        Format format;
        format.pixelformat = fmt.pixelformat;
        for (uint32_t j = 0; ; j++) {
            v4l2_frmsizeenum frmsize = {0};
            frmsize.index = j;
            frmsize.pixel_format = fmt.pixelformat;
            if (ioctl(_fd, VIDIOC_ENUM_FRAMESIZES, &frmsize) == -1) break;
            if (frmsize.type == V4L2_FRMSIZE_TYPE_DISCRETE) {
                FormatSize format_size;
                format_size.width = frmsize.discrete.width;
                format_size.height = frmsize.discrete.height;
                for (uint32_t k = 0; ; k++) {
                    v4l2_frmivalenum frmival = {0};
                    frmival.index = k;
                    frmival.pixel_format = fmt.pixelformat;
                    frmival.width = frmsize.discrete.width;
                    frmival.height = frmsize.discrete.height;
                    if (ioctl(_fd, VIDIOC_ENUM_FRAMEINTERVALS, &frmival) == -1)
                        break;
                    if (frmival.type = V4L2_FRMIVAL_TYPE_DISCRETE) {
                        format_size.invervals.push_back({
                            frmival.discrete.numerator, frmival.discrete.denominator
                        });
                    }
                }
                format.sizes.push_back(format_size);
            }
        }
        _formats.push_back(format);
    }
    if (_formats.size() == 0) return V4L2_INCOMPATIBLE;
    return V4L2_SUCCESS;
}

bool Camera::has_format(uint32_t pixel_format) {
    for (Format format : _formats) {
        if (pixel_format == format.pixelformat) {
            return true;
        }
    }
    return false;
}

Format Camera::get_format(uint32_t pixel_format) {
    for (Format format : _formats) {
        if (pixel_format == format.pixelformat) {
            return format;
        }
    }
    throw std::runtime_error("Format not found!");
}

/* v4l2::Device definitions */

Device::Device(v4l2::devices::DEVICE_INFO info) : _info(info) {
    for (std::string path : info.device_paths) {
        Camera *camera = new Camera(path);
        if (camera->camera_open() == V4L2_INCOMPATIBLE) {
            delete camera;
        } else {
            _cameras.push_back(camera);
        }
    }

    if (info.device_paths.size() > 0) {
        std::string cam_name = std::filesystem::path(_info.device_paths.at(0)).filename();
        char result[FILENAME_MAX];
        cwk_path_join("/sys/class/video4linux/", cam_name.c_str(), result, sizeof(result));
        std::string link = std::filesystem::read_symlink(result);
        cwk_path_get_absolute("/sys/class/video4linux/", link.c_str(), result, sizeof(result));
        cwk_path_join(result, "../../../", result, sizeof(result));
        _device_path = std::string(result);
    }
}

std::string Device::get_device_attr(std::string attr) {
    if (_cached_attrs.count(attr) > 0) {
        return _cached_attrs.at(attr);
    }
    std::filesystem::path attr_path = _device_path;
    attr_path += attr;
    std::ifstream in(_device_path + "/" + attr);
    if (in.good()) {
        std::string contents((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>());
        contents.erase(std::remove(contents.begin(), contents.end(), '\n'), contents.cend());
        _cached_attrs.insert(std::make_pair(attr, contents));
        return contents;
    }
    throw std::invalid_argument("Invalid attribute name '" + attr + "'");
}

Camera *Device::find_camera_with_format(uint32_t pixel_format) {
    for (Camera *camera : _cameras) {
        if (camera->has_format(pixel_format)) return camera;
    }
    return NULL;
}
