#include "httplib.h"
#include "camera/v4l2-camera.hpp"
#include "ehd/ehd-device.hpp"
#include "gstreamer/gst-pipeline.hpp"

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

    std::cout << devices.ehd_devices.size() << "\n";

    /* Test code to show the devices in plain text in the browser */
    svr.Get("/devices", [&devices](const httplib::Request &, httplib::Response &res) {
        /* re-enumerate */
        devices.enumerate();
        std::ostringstream str;
        for (libehd::Device *ehd : devices.ehd_devices) {
            v4l2::Device v4l2_device = ehd->get_v4l2_device();
            str << v4l2_device.get_device_file_path() << "\n";
            for (v4l2::Camera *camera : v4l2_device.get_cameras()) {
                str << "\t" << camera->get_path() << "\n";
                str << "\t\t" << "Bitrate: "    << ehd->get_bitrate() << "\n";
                str << "\t\t" << "H.264 Mode: " << (ehd->get_h264_mode() == libehd::MODE_CONSTANT_BITRATE ? "CBR" : "VBR") << "\n";
                str << "\t\t" << "GOP: "        << ehd->get_gop() << "\n";
            }
        }
        res.set_content(str.str(), "text/plain");
    });

    /* Leave the pipeline threads running */
    svr.listen("localhost", 8080);
}

