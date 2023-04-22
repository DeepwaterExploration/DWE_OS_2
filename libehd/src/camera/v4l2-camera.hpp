#ifndef CAMERA_HPP
#define CAMERA_HPP

#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

#include <iostream>
#include <filesystem>
#include <fstream>
#include <vector>

#include <linux/types.h>
#include <linux/videodev2.h>
#include <linux/media.h>
#include <sys/ioctl.h>
#include <cwalk.h>

#include "list_devices.hpp"

/**
 * @brief Linux camera utility namespace
 * 
 */
namespace v4l2 {
    
    /**
     * @brief Convert a pixel format to a string
     * 
     * @param fourcc V4L2 pixel format containing 4 bytes
     * @return std::string Converted format string
     */
    std::string fourcc2s(uint32_t fourcc);

    enum ErrorType {
        V4L2_SUCCESS, V4L2_OPEN_FAILURE, V4L2_INCOMPATIBLE
    };

    struct Interval {
        uint32_t numerator, denominator;
    };

    struct FormatSize {
        uint32_t width, height;
        std::vector<Interval> intervals;
    };

    struct Format {
        uint32_t pixelformat;
        std::vector<FormatSize> sizes;
    };

    class DeviceInfo {
    public:
        DeviceInfo(devices::DEVICE_INFO info);

        std::string get_device_attr(std::string attr);

    private:
        std::string _device_path;
        std::map<std::string, std::string> _cached_attrs;
        devices::DEVICE_INFO _info;
    };

    class Camera {
    public:
        Camera(std::string path) : _path(path) { }

        ~Camera() {
            close(_fd);
        }

        inline std::string get_path() {
            return _path;
        }

        inline int get_file_descriptor() {
            return _fd;
        }

        inline std::vector<Format> get_formats() {
            return _formats;
        }

        int uvc_set_ctrl(uint32_t unit, uint32_t ctrl, uint8_t *data, uint8_t size);

        int uvc_get_ctrl(uint32_t unit, uint32_t ctrl, uint8_t *data, uint8_t size);

        ErrorType camera_open();

        bool has_format(uint32_t pixel_format);

        Format get_format(uint32_t pixel_format);

    private:
        std::string _path;
        int _fd;
        std::vector<Format> _formats;
    };

    class Device {
    public:
        Device(v4l2::devices::DEVICE_INFO info);

        inline std::string get_device_file_path() {
            return _device_path;
        }

        inline std::vector<Camera*> get_cameras() {
            return _cameras;
        }

        std::string get_device_attr(std::string attr);

        Camera *find_camera_with_format(uint32_t pixel_format);

    private:
        std::string _device_path;
        std::vector<Camera*> _cameras;
        std::map<std::string, std::string> _cached_attrs;
        v4l2::devices::DEVICE_INFO _info;
    };

}

#endif
