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

#include "../gstreamer/gst-pipeline.hpp"

#include "list_devices.hpp"
#include "v4l2-types.hpp"

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

    class Camera {
    public:
        Camera(std::string path) : _path(path) {
            _pipeline = new gst::Pipeline();
        }

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

        void configure_pipeline(gst::EncodeType encodeType, uint32_t width, uint32_t height, Interval interval);
        void configure_pipeline();
        void start_pipeline();
        void stop_pipeline();
        void add_stream_endpoint(const gst::StreamEndpoint &endpoint);

        inline gst::Pipeline *get_pipeline() {
            return _pipeline;
        }

        // void configure_format(uint32_t format, uint32_t width, uint32_t height);

    private:
        RealFormat _format;
        std::string _path;
        int _fd;
        std::vector<Format> _formats;
        std::vector<Control> _controls;
        gst::Pipeline *_pipeline;
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
