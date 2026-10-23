"""
device_utils.py

Utility functions for device_manager.py, specifically for finding added devices /
 removed devices
"""

from .drivers.device import Device


def find_device_with_bus_info(
    devices: dict[str, Device], bus_info: str
) -> Device | None:
    return devices.get(bus_info)


def is_process_alive(pid: int) -> bool:
    try:
        with open(f"/proc/{pid}/stat") as f:
            stat = f.read()
    except (FileNotFoundError, ProcessLookupError):
        return False
    # Treat zombie processes as dead
    # This is the correct solution unfortunately (https://unix.stackexchange.com/questions/558239/way-to-unambiguously-parse-proc-pid-stat-given-arbitrary-contents-of-name-fi)
    return stat[stat.rindex(")") + 2] != "Z"


def list_diff(listA: list, listB: list) -> list:
    # find the difference between lists
    diff = []
    for element in listA:
        if element not in listB:
            diff.append(element)
    return diff
