#include "httplib.h"
#include "camera/v4l2-camera.hpp"
#include "ehd/ehd-device.hpp"
#include "gstreamer/gst-pipeline.hpp"
#include "nlohmann/json.hpp"
using json = nlohmann::json;

// HTTP

class DeviceList {
public:
    DeviceList() { }

    void enumerate() {
        std::vector<v4l2::devices::DEVICE_INFO> devices_info;
        v4l2::devices::list(devices_info);

        v4l2_devices.clear();
        ehd_devices.clear();

        for (const auto &device_info : devices_info) {
            v4l2::Device device(device_info);

            /* Check if device is an exploreHD */
            if (device.get_device_attr("idVendor") == "0c45" && device.get_device_attr("idProduct") == "6366") {
                ehd_devices.push_back(libehd::Device::construct_device(device));
            }

            v4l2_devices.push_back(&device);
        }
    }

public:
    std::vector<v4l2::Device*> v4l2_devices;
    std::vector<libehd::Device*> ehd_devices;
};

httplib::Server svr;

int main(int argc, char** argv) {
    gst_init(&argc, &argv);

    DeviceList devices;
    devices.enumerate();

    std::cout << "Running server.\n";

    /* Test code to show the devices in plain text in the browser */
    svr.Get("/devices", [&devices](const httplib::Request &, httplib::Response &res) {
        /* re-enumerate */
        devices.enumerate();
        json devices_array = json::array();
        for (libehd::Device *ehd : devices.ehd_devices) {
            v4l2::Device v4l2_device = ehd->get_v4l2_device();
            json device_object = json::object();

            device_object["path"] = v4l2_device.get_device_file_path();
            device_object["info"] = json::object();
            device_object["info"]["vid"] = v4l2_device.get_device_attr("idVendor");
            device_object["info"]["pid"] = v4l2_device.get_device_attr("idProduct");
            device_object["options"] = {
                {"bitrate", ehd->get_bitrate()},
                {"mode", (ehd->get_h264_mode() == libehd::MODE_CONSTANT_BITRATE ? "CBR" : "VBR")},
                {"gop", ehd->get_gop()},
            };
            
            device_object["cameras"] = json::array();

            for (v4l2::Camera *camera : v4l2_device.get_cameras()) {
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

            devices_array.push_back(device_object);
        }
        res.set_content(devices_array.dump(), "application/json");
    });

    /* Leave the pipeline threads running */
    svr.listen("localhost", 8080);
}

