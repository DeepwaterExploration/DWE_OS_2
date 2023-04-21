#include "camera/v4l2-camera.hpp"
#include "ehd/ehd-device.hpp"
#include "gstreamer/gst-pipeline.hpp"

class DeviceList {
public:
    void enumerate() {
        std::vector<v4l2::devices::DEVICE_INFO> devices_info;
    }

private:
    std::vector<v4l2::Device*> _v4l2_devices;
    std::vector<libehd::Device*> _ehd_devices;
};

int main(int argc, char** argv) {
    gst_init(&argc, &argv);

    std::vector<v4l2::devices::DEVICE_INFO> devices_info;
    v4l2::devices::list(devices_info);
    std::vector<gst::Pipeline> pipelines;
    uint32_t port = 5600;
    for (const auto &device_info : devices_info) {
        v4l2::Device device(device_info);
        std::cout << device_info.device_description << " at " << device_info.bus_info << " - " << device.get_device_file_path();
        std::cout << " - (" << device.get_device_attr("idVendor") << "/" << device.get_device_attr("idProduct") << ")" << "\n";

        /* Check if device is an exploreHD */
        if (device.get_device_attr("idVendor") == "0c45" && device.get_device_attr("idProduct") == "6366") {
            libehd::Device *ehd = libehd::Device::construct_device(device);
            std::cout << "\t" << "Bitrate: "    << ehd->get_bitrate() << "\n";
            std::cout << "\t" << "H.264 Mode: " << (ehd->get_h264_mode() == libehd::MODE_CONSTANT_BITRATE ? "CBR" : "VBR") << "\n";
            std::cout << "\t" << "GOP: "        << ehd->get_gop() << "\n";

            /* Construct the stream information */
            gst::StreamInformation streamInfo;
            streamInfo.device = &device;
            streamInfo.width = 1920;
            streamInfo.height = 1080;
            streamInfo.interval.numerator = 1;
            streamInfo.interval.denominator = 30;
            streamInfo.encode_type = gst::ENCODE_TYPE_MJPG;
            streamInfo.stream_type = gst::STREAM_TYPE_UDP;
            streamInfo.endpoints.push_back({
                "127.0.0.1", port++
            });
            pipelines.push_back(gst::Pipeline(streamInfo));
        }
    }

    /* Start the pipelines */
    for (gst::Pipeline &pipeline : pipelines) {
        pipeline.start();
    }

    /* Leave the pipeline threads running */
    while (1);
}
