from typing import List
import pywifi, platform, netifaces as ni, subprocess, base64, os, plistlib, sys


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


def get_is_wifi_on():
    """
    Returns True if Wi-Fi is enabled, False otherwise.

    Returns:
    - wifi_on (bool): True if Wi-Fi is enabled, False otherwise.
    """
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmd = ["netsh", "interface", "show", "interface"]
        case "Linux":
            cmd = ["iwconfig"]
        case "Darwin":  # macOS
            cmd = ["iwconfig"]
        case _:
            return {"enabled": False}
    try:
        # Run the command and capture the output and errors
        result = subprocess.check_output(cmd, shell=True).decode("utf-8")
        if current_os == "Windows":
            return {"enabled": "Wireless" in result}
        elif current_os == "Linux" or current_os == "Darwin":
            return {"enabled": not ("ESSID:off/any" in result)}
    except Exception as e:
        print("Error: An unexpected error occurred.")
        print("Error message: ", str(e))
        return {"Enabled": False}


def is_network_secured(ssid):
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmdfolder = os.path.join(
                os.environ["ProgramData"],
                "Microsoft",
                "Wlansvc",
                "Profiles",
                "Interfaces",
            )
            for interface_file in os.listdir(folder):
                file_path = os.path.join(folder, interface_file)
                with open(file_path, "r") as file:
                    content = file.read()
                    if ssid in content and "authentication=" in content:
                        return True
            return False
        case "Linux":
            try:
                # Run the nmcli command and capture the output
                cmd = ["nmcli", "connection", "show", ssid]
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)

                # Check if the SSID is present in the output
                if ssid in result.stdout:
                    # Check if the key-mgmt field is present
                    if "802-11-wireless-security.key-mgmt" in result.stdout:
                        return True  # Network is secured
                    else:
                        return False  # Network is not secured
                else:
                    return None  # Network not found in saved connections

            except subprocess.CalledProcessError:
                print("Error: Unable to run the nmcli command.")
                return None

        case "Darwin":  # macOS
            folder = "/Library/Preferences/SystemConfiguration/"
            for filename in os.listdir(folder):
                if filename.startswith("com.apple.airport.preferences"):
                    file_path = os.path.join(folder, filename)
                    with open(file_path, "rb") as file:
                        content = plistlib.load(file)
                        networks = content.get("KnownNetworks", {})
                        for network in networks.values():
                            if (
                                "SSIDString" in network
                                and network["SSIDString"] == ssid
                            ):
                                if (
                                    "SecurityType" in network
                                    and network["SecurityType"] != "None"
                                ):
                                    return True
            return False
        case _:
            print("Unsupported operating system.")
            return False


def get_saved_wifi():
    """
    Returns a list of saved Wi-Fi networks.

    Returns:
    - saved_networks (List[str]): A list of saved Wi-Fi networks.
    """
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmd = ["netsh", "wlan", "show", "profiles"]
        case "Linux":
            cmd = "nmcli connection show | awk -F '[[:space:]][[:space:]]+' '/wifi/ && !/^UUID:/ {print $1}'"
        case "Darwin":  # macOS
            cmd = ["networksetup", "-listpreferredwirelessnetworks", "Wi-Fi"]
    try:
        # Run the command and capture the output and errors
        result = subprocess.check_output(cmd, shell=True, text=True)
        if current_os == "Windows":
            profiles = result.stdout.split("\n")[
                4:
            ]  # Skip the first 4 lines containing headers
            saved_networks = [
                profile.strip().split(":")[1].strip()
                for profile in profiles
                if "All User Profile" in profile
            ]
            return {"saved_networks": saved_networks}
        elif current_os == "Linux":
            networks = {"saved_networks": []}
            saved_networks = result.split("\n")
            for network_ssid in saved_networks:
                if network_ssid != "":
                    networks["saved_networks"].append(
                        {
                            "ssid": network_ssid,
                            "secure": is_network_secured(network_ssid),
                            "frequency": "unknown",
                            "signal_strength": "unknown",
                        }
                    )
            return networks
        elif current_os == "Darwin":
            saved_networks = result.stdout.strip().split("\n")[
                1:
            ]  # Skip the first line containing interface name
            return {"saved_networks": saved_networks}
    except Exception as e:
        print("Error: An unexpected error occurred.")
        print("Error message: ", str(e))
        return {"saved_networks": []}


def forget_wifi(ssid: str):
    """
    Forgets a saved Wi-Fi network.

    Parameters:
    - ssid (str): The SSID of the network to forget.

    Returns:
    - success (bool): True if the network was successfully forgotten, False otherwise.
    """
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmd = ["netsh", "wlan", "delete", "profile", f"name={ssid}"]
        case "Linux":
            cmd = ["nmcli", "connection", "delete", f"{ssid}"]
        case "Darwin":  # macOS
            cmd = [
                "networksetup",
                "-removepreferredwirelessnetwork",
                "en0",
                f"{ssid}",
            ]
        case _:
            return {"success": False}
    try:
        # Run the command and capture the output and errors
        subprocess.run(cmd, check=True)
        return {"success": True}
    except Exception as e:
        print("Error: An unexpected error occurred.")
        print("Error message: ", str(e))
        return {"success": False}


def toggle_wifi_status(
    wifi_on: bool,
):
    """
    Toggles WiFi based on current state.

    Parameters:
    - wifi_on (bool): True if Wi-Fi is enabled, False otherwise.

    Returns:
    - wifi_on (bool): True if Wi-Fi is enabled, False otherwise.
    """
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmd = (
                [
                    "netsh",
                    "interface",
                    "set",
                    "interface",
                    "Wi-Fi",
                    f"admin={'enable' if wifi_on else 'disable'}",
                ],
            )
        case "Linux":
            cmd = ["nmcli", "radio", "wifi", f"{'on' if wifi_on else 'off'}"]
        case "Darwin":  # macOS
            cmd = [
                "networksetup",
                "-setairportpower",
                "en0",
                f"{'on' if wifi_on else 'off'}",
            ]
        case _:
            return {"enabled": False}
    try:
        # Run the command and capture the output and errors
        subprocess.run(cmd, check=True)
        return {"enabled": wifi_on}
    except Exception as e:
        print("Error: An unexpected error occurred.")
        print("Error message: ", str(e))
        return {"Enabled": False}


def get_connected_network():
    """"""
    current_os = platform.system()
    match current_os:
        case "Windows":
            cmd = f'netsh wlan show interfaces | findstr /r "^....SSID"'
        case "Linux":
            cmd = f"iwgetid -r"
        case "Darwin":  # macOS
            cmd = f"/usr/sbin/networksetup -setairportnetwork en0 '{ssid}' '{password}'"
        case _:
            return -1  # Unsupported platform
    try:
        # Run the command and capture the output and errors
        result = subprocess.check_output(cmd, shell=True).decode("utf-8")
        if current_os == "Windows":
            ssid = result.split(":")[1].strip()
            return {"network": ssid}
        elif current_os == "Linux" or current_os == "Darwin":
            return {"network": result.strip()}
    except Exception as e:
        print("Error: An unexpected error occurred.")
        print("Error message: ", str(e))


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
                if (
                    network_profile.akm
                    and network_profile.akm[0] != pywifi.const.AKM_TYPE_NONE
                ):
                    wifi_info["interfaces"][-1][interface.name()][
                        "wifi_networks"
                    ].append(
                        {
                            "ssid": network_profile.ssid,  # Access the ssid directly
                            "bssid": network_profile.bssid,  # Access the bssid directly
                            "secure": True,  # Access the auth (security) directly
                            "security_type": network_profile.akm,  # Access the akm (security details) directly
                            "frequency": network_profile.freq,  # Access the frequency directly
                            "signal_strength": int(
                                network_profile.signal
                            ),  # Access the signal directly
                        }
                    )
                else:
                    wifi_info["interfaces"][-1][interface.name()][
                        "wifi_networks"
                    ].append(
                        {
                            "ssid": network_profile.ssid,  # Access the ssid directly
                            "bssid": network_profile.bssid,  # Access the bssid directly
                            "secure": False,  # Access the auth (security) directly
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


def base64Decode(encoded_string: str) -> int:
    """
    Returns the decoded string.

    Parameters:
    - encoded_string (str): The encoded string.

    Returns:
    - decoded_string (str): The decoded string.
    """
    # Convert the Base64 encoded string to bytes
    encoded_bytes = encoded_string.encode("utf-8")

    # Decode the bytes using Base64
    decoded_bytes = base64.b64decode(encoded_bytes)

    # Convert the decoded bytes back to a string
    decoded_string = decoded_bytes.decode("utf-8")

    return decoded_string


def connect_to_wifi(ssid: str, password: str) -> int:
    # Decode the ssid and password
    ssid = base64Decode(ssid)
    password = base64Decode(password)
    # Get the current operating system
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
        print("Error message: ", str(e))
