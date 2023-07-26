from typing import List
import pywifi, platform, netifaces as ni, subprocess, time


class WiFiNetwork:
    def __init__(
        self, ssid: str, security: str, frequency: float, signal_strength: int
    ) -> None:
        """
        Represents a WiFi network.

        Parameters:
        - ssid (str): The network's SSID (Service Set Identifier).
        - security (str): The security protocol used by the network (e.g., WPA2, WPA3, Open).
        - frequency (float): The operating frequency of the network in GHz (e.g., 2.4, 5.0).
        - signal_strength (int): The signal strength of the network at the current location in dBm.
        """
        self.ssid = ssid
        self.security = security
        self.frequency = frequency
        self.signal_strength = signal_strength

    def __str__(self) -> str:
        """
        Returns a string representation of the WiFi network.
        """
        return f"SSID: {self.ssid}, Security: {self.security}, Frequency: {self.frequency} GHz, Signal Strength: {self.signal_strength} dBm"


def print_attrs(obj: object) -> None:
    """
    Prints all attributes of the given object.

    Parameters:

    - obj (object): The object whose attributes will be printed.
    """
    # print attributes of the network profile
    for attr in dir(obj):
        print(f"{obj.__class__.__name__}.{attr} = {getattr(obj, attr)}")
    print()


def get_all_interfaces(wifi_manager: pywifi.PyWiFi):
    """
    Returns a list of all network interfaces on the system.

    Parameters:
    - wifi_manager (pywifi.PyWiFi): A PyWiFi object used to manage Wi-Fi operations.

    Returns:
    - interfaces (list): A list of all network interfaces on the system.
    """
    return list(wifi_manager.interfaces())


def get_interface_mac_address(interface_name: str) -> str:
    """
    Returns the MAC address of the given network interface.

    Parameters:
    - interface_name (str): The name of the network interface whose MAC address will be returned.

    Returns:
    - mac_address (str): The MAC address of the given network interface.
    """
    try:
        # Get the MAC address of the specified Wi-Fi interface (if available)
        if interface_name in ni.interfaces():
            interface_details = ni.ifaddresses(interface_name)
            mac_address = interface_details[ni.AF_LINK][0]["addr"]
            return mac_address
    except Exception as e:
        print(f"Error: {e}")


def is_connected(interface: pywifi.iface.Interface, ssid):
    """
    Checks if the interface is connected to the given SSID.

    Parameters:
    - interface (pywifi.Interface): A PyWiFi network interface object.
    - ssid (str): The SSID of the network to check.

    Returns:
    - connected (bool): True if the interface is connected to the given SSID, False otherwise.
    """
    connected_ssid = interface.status().ssid
    return connected_ssid == ssid


def scan_wifi_networks(
    interface: pywifi.iface.Interface,
) -> List[pywifi.profile.Profile]:
    """
    Returns a list of WiFiNetwork objects representing the WiFi networks available on the given interface.

    Parameters:
    - interface (pywifi.Interface): A PyWiFi network interface object used to scan for WiFi networks.

    Returns:
    - wifi_networks (list): A list of WiFi networks available on the given interface.
    """
    interface.scan()
    scan_results = interface.scan_results()
    wifi_networks = []
    ssid_list = set()

    for network_profile in scan_results:
        if (
            network_profile.ssid == ""
            or network_profile.ssid is None
            or network_profile.ssid in ssid_list
        ):
            continue
        ssid_list.add(network_profile.ssid)
        wifi_networks.append(network_profile)
    return wifi_networks


def get_wifi_info():
    wifi_info = {
        "interfaces": [],
    }
    wifi = pywifi.PyWiFi()
    interfaces = get_all_interfaces(wifi)
    for interface in interfaces:
        if interface.name().startswith("p2p"):
            continue
        try:
            network_profiles = scan_wifi_networks(interface)
            wifi_info["interfaces"].append(
                {
                    interface.name(): {
                        "mac_address": get_interface_mac_address(interface.name()),
                        "status": interface.status(),
                        "wifi_networks": [],
                    }
                }
            )
            # network_profiles = interface.network_profiles()
            for network_profile in network_profiles:
                wifi_info["interfaces"][-1][interface.name()]["wifi_networks"].append(
                    {
                        "ssid": network_profile.ssid,  # Access the ssid directly
                        "bssid": network_profile.bssid,  # Access the bssid directly
                        "security": network_profile.auth,  # Access the auth (security) directly
                        "frequency": network_profile.freq,  # Access the frequency directly
                        "signal_strength": int(
                            network_profile.signal
                        ),  # Access the signal directly
                    }
                )
        except Exception as e:
            print(f"Exception: {e}")
            pass
    return wifi_info


def connect_to_wifi(ssid: str, password: str) -> int:
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmd = f'netsh wlan connect ssid="{ssid}" name="{ssid}" key="{password}"'
        case "Linux":
            cmd = f"nmcli dev wifi connect '{ssid}' password '{password}'"
        case "Darwin":  # macOS
            cmd = f"/usr/sbin/networksetup -setairportnetwork en0 '{ssid}' '{password}'"
        case _:
            return -1  # Unsupported platform
    try:
        # Run the command and capture the output and errors
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            return {
                "status": "success",
                "message": "Successfully connected to the network",
            }
        elif current_os == "Windows" and "is not in the range" in result.stderr:
            return {
                "status": "error",
                "message": "WiFi network not found",
            }
        elif current_os == "Windows" and "is not allowed" in result.stderr:
            return {
                "status": "error",
                "message": "Invalid password",
            }
        else:
            return {
                "status": "error",
                "message": "Failed to connect to WiFi network",
            }
    except Exception as e:
        print("Error: An unexpected error occurred.")
        print("Error message:", str(e))