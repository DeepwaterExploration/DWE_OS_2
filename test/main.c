#include <linux/videodev2.h>
#include <linux/usb/video.h>
#include <linux/uvcvideo.h>

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <string.h>

#include "explorehd_ctrls.h"

int video_open(const char *devname) {
    struct v4l2_capability cap;
    int dev, ret;

    dev = open(devname, O_RDWR);
    if (dev < 0) {
        printf("E: Error opening device %s\n", devname);
        return dev;
    }

    memset(&cap, 0, sizeof cap);
    if ((ret = ioctl(dev, VIDIOC_QUERYCAP, &cap)) < 0) {
        printf("E: Error opening device, unable to query device %s\n", devname);
        close(dev);
        return ret;
    }

    printf("I: Device %s opened: %s.\n", devname, cap.card);
    return dev;
}

int XU_Ctrl_Query(int fd, __u8 xu_query, __u8 xu_unit, __u8 xu_selector, __u8 xu_size, __u8 *xu_data) {
    struct uvc_xu_control_query xctrlq;
    xctrlq.unit = xu_unit;
    xctrlq.selector = xu_selector;
    xctrlq.query = xu_query;
    xctrlq.size = xu_size;
    xctrlq.data = xu_data;
    return ioctl(fd, UVCIOC_CTRL_QUERY, &xctrlq);
}

int XU_Set_Cur(int fd, __u8 xu_unit, __u8 xu_selector, __u8 xu_size, __u8 *xu_data) {
    return XU_Ctrl_Query(fd, UVC_SET_CUR, xu_unit, xu_selector, xu_size, xu_data);
}

int XU_Get_Cur(int fd, __u8 xu_unit, __u8 xu_selector, __u16 xu_size, __u8 *xu_data) {
    return XU_Ctrl_Query(fd, UVC_GET_CUR, xu_unit, xu_selector, xu_size, xu_data);
}

int main(int argc, char* argv[]) {
    int dev, err;
    if (!(dev = video_open(argv[1]))) return 1;

    __u8 unit = XU_EXPLOREHD_USR_ID;
    __u8 selector = XU_EXPLOREHD_USR_H264_CTRL;
    __u8 size = 11;
    __u8 ctrldata[11]={0};
    ctrldata[0] = XU_EXPLOREHD_TAG;
    ctrldata[1] = XU_EXPLOREHD_BITRATE_CTRL;

    if ((err = XU_Set_Cur(dev, unit, selector, size, ctrldata)) < 0) {
        printf("E: Switch CMD : ioctl FAILED (%i)\n", errno);
        return 1;
    }

    if ((err = XU_Get_Cur(dev, unit, selector, size, ctrldata)) < 0) {
        printf("E: XU_Get_Cur : ioctl FAILED (%i)\n", errno);
        return 1;
    }

    int bitrate = (ctrldata[0] << 24) | (ctrldata[1] << 16) | (ctrldata[2] << 8) | (ctrldata[3]);
    printf("%d\n", bitrate);
}
