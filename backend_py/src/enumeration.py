"""
This module provides functions for retrieving information about video devices 
from the Linux Video4Linux2 (V4L2) subsystem.

It defines a data class `DeviceInfo` to represent information about a video device,
and functions to list available video devices and retrieve their attributes.

Dependencies:
- Linux Video4Linux2 (V4L2) subsystem
- natsort: A third-party library for natural sorting of strings

Usage:
- Call `list_devices()` function to retrieve a list of `DeviceInfo` objects representing
  available video devices.
"""

import os
from dataclasses import dataclass
import fcntl
from typing import List, Tuple

from natsort import natsorted

from . import v4l2


@dataclass
class DeviceInfo:
    """
    Represents information about a video device.

    Attributes:
        device_name (str): The name of the video device.
        bus_info (str): Information about the bus to which the device is connected.
        device_paths (List[str]): List of paths to the video device.
        vid (int): Vendor ID of the device.
        pid (int): Product ID of the device.
    """

    device_name: str
    bus_info: str
    device_paths: list[str]
    vid: int
    pid: int


def _get_device_attr(device_path: str, attr: str) -> str:
    """
    TODO confirm that this works.
    Reads the contents of an attribute file of a device.

    Args:
        device_path (str): The path to the device directory.
        attr (str): The name of the attribute file to read.

    Returns:
        str: The contents of the attribute file.
    """
     
    file_path = os.path.join(device_path, attr)
    attr_content = None

    with open(file_path) as file_object:
        # Read the contents of the file and strip any leading or trailing whitespace
        attr_content = file_object.read().strip()

    assert attr_content is not None, "attribute content is None for some reason. Check _get_device_attr function."

    return attr_content

def _get_vid_pid(devname: str) -> Tuple[int, int]:
    """
    Retrieves the Vendor ID (VID) and Product ID (PID) of a video device.

    Args:
        devname (str): The name of the video device.

    Returns:
        Tuple[int, int]: A tuple containing the VID and PID of the device.
    """

    # Construct the path to the directory containing device attributes
    syspath = f'/sys/class/video4linux/{devname}'
    # Read the symbolic link to get the full path to the device directory
    link = os.readlink(syspath) + '../../../../'
    device_path = os.path.abspath('/sys/class/video4linux/' + link)

     # Get the contents of the idVendor and idProduct attribute files
    id_vendor = _get_device_attr(device_path, 'idVendor')
    id_product = _get_device_attr(device_path, 'idProduct')

    try:
        # Convert the VID and PID from hexadecimal strings to integers
        vid = int(id_vendor, base=16)
        pid = int(id_product, base=16)
    except ValueError as e:
        # Raise an error if conversion fails
        raise ValueError(f"Failed to convert VID or PID: {e}")

    # Return a tuple containing the VID and PID
    return vid, pid


def list_devices() -> List[DeviceInfo]:
    """
    Lists available video devices and their information.

    Returns:
        List[DeviceInfo]: A list of DeviceInfo objects representing available video devices.
    """

    devices_info: list[DeviceInfo] = []  # Initialize an empty list to store device information
    devices_map: dict[str, DeviceInfo] = {}  # Initialize an empty dictionary to store device information mapped by bus info

    # traverse the directory that has the list of all devices
    devnames = os.listdir('/sys/class/video4linux/')

    for devname in devnames:
        devpath = f'/dev/{devname}' # Get the device path
        try:
            fd = open(devpath) # Open the device file
        except:
            # Device was not initialized yet, just wait a bit
            continue

        cap = v4l2.v4l2_capability()
        fcntl.ioctl(fd, v4l2.VIDIOC_QUERYCAP, cap)
        fd.close()

        bus_info: str = bytes.decode(cap.bus_info)  # Convert bus info bytes to string
        
        # Correct type of bus info
        if bus_info.startswith('usb'):
            if bus_info in devices_map:
                devices_map[bus_info].device_paths.append(devpath)
            else:
                device_name = cap.card.decode()
                (vid, pid) = _get_vid_pid(devname)
                devices_map[bus_info] = DeviceInfo(
                    device_name, bus_info, [devpath], vid, pid)

    # flatten the dict
    for bus_info in devices_map:
        device_info = devices_map[bus_info]
        # sort the device paths in ascending order
        device_info.device_paths = natsorted(device_info.device_paths)
        devices_info.append(device_info)

    return devices_info
