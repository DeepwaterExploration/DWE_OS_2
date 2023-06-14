#include "httplib.h"
#include "camera/v4l2-camera.hpp"
#include "ehd/ehd-device.hpp"
#include "gstreamer/gst-pipeline.hpp"
#include "nlohmann/json.hpp"
using json = nlohmann::json;

class DeviceList {
public:
    DeviceList() { }

    libehd::Device *get_ehd(int index) {
        return ehd_devices.at(index);
    }

    json serialize_pipeline(gst::Pipeline *pipeline) {
        gst::StreamInformation streamInfo = pipeline->getStreamInfo();
        json pipeline_object = json::object();

        if (!pipeline->getIsConfigured()) {
            return pipeline_object;
        }

        pipeline_object["device_path"] = streamInfo.device_path;

        pipeline_object["endpoints"] = json::array();
        for (gst::StreamEndpoint endpoint : streamInfo.endpoints) {
            json endpoint_object = json::object();
            endpoint_object["host"] = endpoint.host;
            endpoint_object["port"] = endpoint.port;
            pipeline_object["endpoints"].push_back(endpoint_object);
        }

        switch (streamInfo.encode_type) {
            case gst::ENCODE_TYPE_H264:
                pipeline_object["encode_type"] = "H264";
                break;
            case gst::ENCODE_TYPE_MJPG:
                pipeline_object["encode_type"] = "MJPG";
                break;
            case gst::ENCODE_TYPE_NONE:
                pipeline_object["encode_type"] = "NONE";
                break;
        }

        switch (streamInfo.stream_type) {
            /* Only option currently */
            case gst::STREAM_TYPE_UDP:
                pipeline_object["stream_type"] = "UDP";
                break;
            case gst::STREAM_TYPE_NONE:
                pipeline_object["stream_type"] = "NONE";
        }

        pipeline_object["format"] = json::object();
        pipeline_object["format"]["width"] = streamInfo.width;
        pipeline_object["format"]["height"] = streamInfo.height;
        pipeline_object["format"]["interval"] = json::object();
        pipeline_object["format"]["interval"]["numerator"] = streamInfo.interval.numerator;
        pipeline_object["format"]["interval"]["denominator"] = streamInfo.interval.denominator;

        return pipeline_object;
    }

    json serialize_ehd(libehd::Device *ehd) {
        v4l2::Device *v4l2_device = ehd->get_v4l2_device();
        json device_object = json::object();
        device_object["info"] = json::object();
        device_object["info"]["path"] = v4l2_device->get_device_file_path();
        device_object["info"]["name"] = v4l2_device->get_info().device_name;
        device_object["info"]["vid"] = v4l2_device->get_device_attr("idVendor");
        device_object["info"]["pid"] = v4l2_device->get_device_attr("idProduct");
        device_object["options"] = {
            {"bitrate", ehd->get_bitrate()},
            {"mode", (ehd->get_h264_mode() == libehd::MODE_CONSTANT_BITRATE ? "CBR" : "VBR")},
            {"gop", ehd->get_gop()},
        };
                
        device_object["cameras"] = json::array();

        device_object["controls"] = json::array();
        device_object["stream"] = serialize_pipeline(v4l2_device->get_pipeline());

        v4l2_device->query_uvc_controls();
        for (v4l2::Control control : v4l2_device->get_uvc_controls()) {
            json control_object = json::object();
            control_object["id"] = control.id;
            control_object["name"] = control.name;

            json flags = json::object();
            flags["disabled"] = (int)control.flags.disabled;
            flags["grabbed"] = (int)control.flags.grabbed;
            flags["read_only"] = (int)control.flags.read_only;
            flags["update"] = (int)control.flags.update;
            flags["slider"] = (int)control.flags.slider;
            flags["write_only"] = (int)control.flags.write_only;
            flags["volatility"] = (int)control.flags.volatility;
            flags["type"] = control.type;
            flags["max"] = control.max;
            flags["min"] = control.min;
            flags["step"] = control.step;
            flags["default_value"] = control.default_value;

            if (control.menuItems.size() > 0) flags["menu"] = json::array();
            for (v4l2::MenuItem menuItem : control.menuItems) {
                json menu_object = json::object();
                switch (control.type) {
                    case v4l2_ctrl_type::V4L2_CTRL_TYPE_MENU:
                        flags["menu"].push_back(menuItem.name);
                        break;
                    case v4l2_ctrl_type::V4L2_CTRL_TYPE_INTEGER_MENU:
                        flags["menu"].push_back(menuItem.value);
                        break;
                }
            }
                    
            control_object["flags"] = flags;
            device_object["controls"].push_back(control_object);
        }

        for (v4l2::Camera *camera : v4l2_device->get_cameras()) {
            json camera_object = json::object();
            camera_object["device_path"] = camera->get_path();
            camera_object["formats"] = json::array();

            // serialize formats into json data
            std::vector<v4l2::Format> formats = camera->get_formats();
            for (v4l2::Format format : formats) {
                json format_object = json::object();
                format_object["format"] = v4l2::fourcc2s(format.pixelformat);
                format_object["sizes"] = json::array();
                for (v4l2::FormatSize size : format.sizes) {
                    json format_size = json::object();
                    format_size["width"] = size.width;
                    format_size["height"] = size.height;
                    format_size["intervals"] = json::array();
                    for (v4l2::Interval interval : size.intervals) {
                        json interval_object = json::object();
                        interval_object["numerator"] = interval.numerator;
                        interval_object["denominator"] = interval.denominator;
                        format_size["intervals"].push_back(interval_object);
                    }
                    format_object["sizes"].push_back(format_size);
                }
                camera_object["formats"].push_back(format_object);
            }

            device_object["cameras"].push_back(camera_object);
        }
        return device_object;
    }

    void enumerate() {
        _devices_array = json::array();
        std::vector<v4l2::devices::DEVICE_INFO> devices_info;
        v4l2::devices::list(devices_info);

        v4l2_devices.clear();
        ehd_devices.clear();

        for (const auto &device_info : devices_info) {
            v4l2::Device *v4l2_device = new v4l2::Device(device_info);

            /* Check if device is an exploreHD */
            if (v4l2_device->get_device_attr("idVendor") == "0c45" && v4l2_device->get_device_attr("idProduct") == "6366") {
                libehd::Device *ehd = libehd::Device::construct_device(v4l2_device);
                ehd_devices.push_back(ehd);

                json device_object = serialize_ehd(ehd);

                _devices_array.push_back(device_object);
            }
        }
    }

    json serialize() {
        json devices_array = json::array();
        for (libehd::Device *ehd : ehd_devices) {
            devices_array.push_back(serialize_ehd(ehd));
        }
        return devices_array;
    }

public:
    std::vector<v4l2::Device*> v4l2_devices;
    std::vector<libehd::Device*> ehd_devices;

    json _devices_array;
};

httplib::Server svr;

int main(int argc, char** argv) {
    gst_init(&argc, &argv);

    DeviceList devices;
    devices.enumerate();

    std::cout << "Running server.\n";
    
    v4l2::Device *device = devices.get_ehd(1)->get_v4l2_device();
    device->configure_stream(V4L2_PIX_FMT_MJPEG, 1920, 1080, v4l2::Interval(1, 30), gst::STREAM_TYPE_UDP);
    device->add_stream_endpoint("127.0.0.1", 5600);
    // device->start_stream();
    
    /* Test code to show the devices in plain text in the browser */
    svr.Get("/devices", [&devices](const httplib::Request &, httplib::Response &res) {
        /* re-enumerate */
        json devices_array = devices.serialize();
        res.set_content(devices_array.dump(), "application/json");
    });

    svr.Get("/device", [&devices](const httplib::Request &req, httplib::Response &res) {
        auto itr = req.params.find("index");
        libehd::Device *ehd = devices.get_ehd(std::stoi(itr->second));
        json resbody = devices.serialize_ehd(ehd);
        res.set_content(resbody.dump(), "application/json");
    });

    svr.Post("/configureStream", [&devices](const httplib::Request &req, httplib::Response &res) {
        json requestBody = json::parse(req.body);
        int index = requestBody["index"];
        json format = requestBody["format"];
        libehd::Device *ehd = devices.get_ehd(index);
        v4l2::Device *device = ehd->get_v4l2_device();

        uint32_t pixel_format;
        if (format["format"] == "MJPG") {
            pixel_format = V4L2_PIX_FMT_MJPEG;
        } else if (format["format"] == "H264") {
            pixel_format = V4L2_PIX_FMT_H264;
        }

        int width = format["width"];
        int height = format["height"];
        json interval_object = format["interval"];
        int numerator = interval_object["numerator"];
        int denominator = interval_object["denominator"];

        device->configure_stream(pixel_format, width, height, v4l2::Interval(numerator, denominator), gst::STREAM_TYPE_UDP);
    });

    svr.Post("/addStreamEndpoint", [&devices](const httplib::Request &req, httplib::Response &res) {
        json requestBody = json::parse(req.body);
        int index = requestBody["index"];
        json endpoint = requestBody["endpoint"];
        std::string host = endpoint["host"];
        int port = endpoint["port"];
        libehd::Device *ehd = devices.get_ehd(index);
        v4l2::Device *device = ehd->get_v4l2_device();
        device->add_stream_endpoint(host, port);
    });

    svr.Post("/startStream", [&devices](const httplib::Request &req, httplib::Response &res) {
        json requestBody = json::parse(req.body);
        int index = requestBody["index"];
        libehd::Device *ehd = devices.get_ehd(index);
        v4l2::Device *device = ehd->get_v4l2_device();
        if (device->is_stream_configured()) {
            std::cout << "Starting stream for device at index: " << index << "\n";
            device->start_stream();
        }
    });

    /* Leave the pipeline threads running */
    svr.listen("localhost", 8080);
}

