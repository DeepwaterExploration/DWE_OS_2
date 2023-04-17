#ifndef EXPLOREHD_CTRLS_H
#define EXPLOREHD_CTRLS_H

// XU Control Units
#define XU_EXPLOREHD_SYS_ID                         0x02
#define XU_EXPLOREHD_USR_ID                         0x04

// System XU Control Selectors
#define XU_EXPLOREHD_SYS_ASIC_RW                    0x01
#define XU_EXPLOREHD_SYS_FLASH_CTRL                 0x03
#define XU_EXPLOREHD_SYS_FRAME_INFO                 0x06
#define XU_EXPLOREHD_SYS_H264_CTRL                  0x07
#define XU_EXPLOREHD_SYS_MJPG_CTRL                  0x08
#define XU_EXPLOREHD_SYS_OSD_CTRL                   0x09
#define XU_EXPLOREHD_SYS_MOTION_DETECTION           0x0A
#define XU_EXPLOREHD_SYS_IMG_SETTING                0x0B

// User XU Control Selectors
#define XU_EXPLOREHD_USR_FRAME_INFO                 0x01
#define XU_EXPLOREHD_USR_H264_CTRL                  0x02
#define XU_EXPLOREHD_USR_MJPG_CTRL                  0x03
#define XU_EXPLOREHD_USR_OSD_CTRL                   0x04
#define XU_EXPLOREHD_USR_MOTION_DETECTION           0x05
#define XU_EXPLOREHD_USR_IMG_SETTING                0x06
#define XU_EXPLOREHD_USR_MULTI_STREAM_CTRL          0x07
#define XU_EXPLOREHD_USR_GPIO_CTRL                  0x08
#define XU_EXPLOREHD_USR_DYNAMIC_FPS_CTRL           0x09

// XU Control Tag
#define XU_EXPLOREHD_TAG                            0x9A

// XU Commands
#define XU_EXPLOREHD_BITRATE_CTRL                   0x02
#define XU_EXPLOREHD_GOP_CTRL                       0x03
#define XU_EXPLOREHD_H264_MODE_CTRL                 0x06

#endif
