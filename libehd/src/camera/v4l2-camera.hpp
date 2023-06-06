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

    struct RealFormat {
        uint32_t pixelformat;
        uint32_t width;
        uint32_t height;
        uint32_t buffer_size;
    };

    struct MenuItem {
        uint32_t index;
        int64_t value; // integer menu
        std::string name; // normal menu
    };

    struct Control {
        uint32_t id;
        std::string name;
        struct {
            unsigned disabled: 1;
            unsigned grabbed: 1;
            unsigned read_only: 1;
            unsigned update: 1;
            unsigned slider: 1;
            unsigned write_only: 1;
            unsigned volatility: 1;
        } flags;
        v4l2_ctrl_type type;
        int32_t max, min, step, default_value;
        std::vector<MenuItem> menuItems;
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

        void configure_format(uint32_t format, uint32_t width, uint32_t height);

    private:
        RealFormat _format;
        std::string _path;
        int _fd;
        std::vector<Format> _formats;
        std::vector<Control> _controls;
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

        void query_uvc_controls();

        std::vector<Control> get_uvc_controls();

        inline v4l2::devices::DEVICE_INFO get_info() {
            return _info;
        }

    private:
        std::string _device_path;
        std::vector<Camera*> _cameras;
        std::map<std::string, std::string> _cached_attrs;
        v4l2::devices::DEVICE_INFO _info;
        std::vector<Control> _controls;
    };

}

#endif
