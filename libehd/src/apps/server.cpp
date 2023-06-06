#include "httplib.h"
#include "camera/v4l2-camera.hpp"
#include "ehd/ehd-device.hpp"
#include "gstreamer/gst-pipeline.hpp"
#include "nlohmann/json.hpp"
using json = nlohmann::json;

class DeviceList {
public:
    DeviceList() { }

    json enumerate() {
        json devices_array = json::array();
        std::vector<v4l2::devices::DEVICE_INFO> devices_info;
        v4l2::devices::list(devices_info);

        v4l2_devices.clear();
        ehd_devices.clear();

        for (const auto &device_info : devices_info) {
            v4l2::Device v4l2_device(device_info);
            v4l2_devices.push_back(&v4l2_device);

            /* Check if device is an exploreHD */
            if (v4l2_device.get_device_attr("idVendor") == "0c45" && v4l2_device.get_device_attr("idProduct") == "6366") {
                libehd::Device *ehd = libehd::Device::construct_device(v4l2_device);
                ehd_devices.push_back(ehd);

                json device_object = json::object();

                device_object["info"] = json::object();
                device_object["info"]["path"] = v4l2_device.get_device_file_path();
                device_object["info"]["name"] = v4l2_device.get_info().device_name;
                device_object["info"]["vid"] = v4l2_device.get_device_attr("idVendor");
                device_object["info"]["pid"] = v4l2_device.get_device_attr("idProduct");
                device_object["options"] = {
                    {"bitrate", ehd->get_bitrate()},
                    {"mode", (ehd->get_h264_mode() == libehd::MODE_CONSTANT_BITRATE ? "CBR" : "VBR")},
                    {"gop", ehd->get_gop()},
                };
                
                device_object["cameras"] = json::array();

                device_object["controls"] = json::array();

                v4l2_device.query_uvc_controls();
                for (v4l2::Control control : v4l2_device.get_uvc_controls()) {
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
        }

        return devices_array;
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
        json devices_array = devices.enumerate();
        res.set_content(devices_array.dump(), "application/json");
    });

    /* Leave the pipeline threads running */
    svr.listen("localhost", 8080);
}

