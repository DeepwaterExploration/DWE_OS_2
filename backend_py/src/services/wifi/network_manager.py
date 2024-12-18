import dbus
from typing import List, Callable
import time
from .wifi_types import Connection, AccessPoint
import logging
class NMException(Exception):
    '''Exception raised when there is a network manager issue'''
    pass

class NMNotSupportedError(NMException):
    '''Exception raised when NetworkManager is not supported'''
    pass

def handle_dbus_exceptions(func: Callable):
    '''
    Decorator to handle dbus exceptions, raising NMExceptions for more verbosity
    '''

    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except dbus.DBusException as e:
            raise NMException(f'DBusException occurred: {str(e)}') from e
        
    return wrapper

class NetworkManager:
    '''
    Class for interfacing with NetworkManager over dbus
    '''

    @handle_dbus_exceptions
    def __init__(self) -> None:
        # Get the system bus
        self.bus = dbus.SystemBus()
        # Get a local proxy to the NetworkManager object
        self.proxy = self.bus.get_object('org.freedesktop.NetworkManager', '/org/freedesktop/NetworkManager')

        # The proxy does not exist, since NetworkManager does not exist
        if not self.proxy:
            raise NMNotSupportedError('NetworkManager is not installed on this system.')

        # Get an interface to the NetworkManager object from the proxy
        self.interface = dbus.Interface(self.proxy, 'org.freedesktop.NetworkManager')
        # Get an interface to the properties object
        self.props = dbus.Interface(self.proxy, 'org.freedesktop.DBus.Properties')

    @handle_dbus_exceptions
    def connect(self, ssid: str, password=''):
        (wifi_dev, dev_proxy) = self._get_wifi_device()
        if wifi_dev is None:
            raise NMException('No WiFi device found')

        wifi_interface = dbus.Interface(dev_proxy, 'org.freedesktop.NetworkManager.Device.Wireless')
        # Do not need to request a scan since the scan must have happened for the user to know this network exists
        access_points = wifi_interface.GetAllAccessPoints()

        ap_path = None
        ap_requires_password = False
        for ap in access_points:
            ap_proxy = self.bus.get_object('org.freedesktop.NetworkManager', ap)
            ap_props = dbus.Interface(ap_proxy, 'org.freedesktop.DBus.Properties')
            ap_ssid = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'Ssid')
            ssid_str = ''.join([chr(byte) for byte in ap_ssid])

            if ssid_str == ssid:
                ap_path = ap

                # Check the security of the AP
                flags = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'Flags')
                wpa_flags = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'WpaFlags')
                rsn_flags = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'RsnFlags')
                ap_requires_password = self._ap_requires_password(flags, wpa_flags, rsn_flags)
                break

        if ap_path is None:
            raise NMException(f'Access point with SSID {ssid} not found')

        # Create the settings object assuming no password is needed
        connection_settings = {
            '802-11-wireless': {
                'ssid': dbus.ByteArray(ssid.encode('utf-8')),
                'mode': 'infrastructure'
            },
            'connection': {
                'id': ssid,
                'type': '802-11-wireless'
            },
            'ipv4': {
                'method': 'auto'
            },
            'ipv6': {
                'method': 'ignore'
            }
        }

        # Add security settings if the network requires a password
        if ap_requires_password:
            connection_settings['802-11-wireless-security'] = {
                'key-mgmt': 'wpa-psk',
                'psk': password
            }

        settings_proxy = self.bus.get_object('org.freedesktop.NetworkManager', '/org/freedesktop/NetworkManager/Settings')
        settings_interface = dbus.Interface(settings_proxy, 'org.freedesktop.NetworkManager.Settings')

        connection_path = settings_interface.AddConnection(connection_settings)
        self.interface.ActivateConnection(connection_path, dev_proxy, ap_path)

    @handle_dbus_exceptions
    def disconnect(self):
        '''
        Disconnect from any connected network
        '''
        (wifi_dev, dev_proxy) = self._get_wifi_device()

        if not wifi_dev:
            raise Exception('No WiFi device found')

        dev_props = dbus.Interface(dev_proxy, 'org.freedesktop.DBus.Properties')
        active_connection = dev_props.Get('org.freedesktop.NetworkManager.Device', 'ActiveConnection')
        self.interface.DeactivateConnection(active_connection)

    @handle_dbus_exceptions
    def list_wireless_connections(self) -> List[Connection]:
        '''
        Get a list of the active wireless connections
        '''
        return self.list_connections()

    @handle_dbus_exceptions
    def get_active_wireless_connection(self) -> Connection | None:
        '''
        Get the first active wireless connection
        '''
        active_wireless_conections = list(self.get_active_connections())
        return None if len(active_wireless_conections) == 0 else active_wireless_conections[0]

    @handle_dbus_exceptions
    def list_connections(self, only_wireless=True) -> List[Connection]:
        '''
        Get a list of all the connections saved
        '''
        connections = []
        for connection in self._list_connections():
            config = connection.GetSettings()
            new_connection = Connection(config['connection']['id'], config['connection']['type'])
            # Filter
            if not only_wireless or 'wireless' in config['connection']['type'] and not new_connection in connections:
                connections.append(new_connection)
        return connections

    @handle_dbus_exceptions
    def get_active_connections(self, wireless_only=True) -> List[Connection]:
        '''
        Get a list of active connections, including wired
        '''
        active_connections = self.props.Get('org.freedesktop.NetworkManager', 'ActiveConnections')
        connections = []
        for connection_path in active_connections:
            active_conn_proxy = self.bus.get_object('org.freedesktop.NetworkManager', connection_path)
            active_conn = dbus.Interface(active_conn_proxy, 'org.freedesktop.DBus.Properties')

            settings_path = active_conn.Get('org.freedesktop.NetworkManager.Connection.Active', 'Connection')
            conn_proxy = self.bus.get_object('org.freedesktop.NetworkManager', settings_path)
            connection = dbus.Interface(conn_proxy, 'org.freedesktop.NetworkManager.Settings.Connection')
            config = connection.GetSettings()

            if not wireless_only or 'wireless' in config['connection']['type']:
                connections.append(Connection(config['connection']['id'], config['connection']['type']))

        return connections

    @handle_dbus_exceptions
    def get_access_points(self) -> List[AccessPoint]:
        '''
        Get wifi networks without a scan
        '''
        (wifi_dev,_) = self._get_wifi_device()
        if not wifi_dev:
            raise NMException('No WiFi device found')
        return self._get_access_points(wifi_dev)


    @handle_dbus_exceptions
    def scan_wifi(self, is_scanning_func: Callable[[], bool], timeout=30) -> List[AccessPoint]:
        '''
        Scan wifi networks
        '''
        (wifi_dev, dev_proxy) = self._get_wifi_device()

        if not wifi_dev:
            raise NMException('No WiFi device found')

        wifi_props = dbus.Interface(dev_proxy, 'org.freedesktop.DBus.Properties')

        # get the timestamp of the last scan
        last_scan = wifi_props.Get('org.freedesktop.NetworkManager.Device.Wireless', 'LastScan')

        # request a scan
        wifi_dev.RequestScan({})

        # wait for scan to finish
        start_time = time.time()
        # Check if it is still allowed to complete the scan, is_scanning_func should return false when the program is killed
        while is_scanning_func() and time.time() - start_time < timeout:
            current_scan = wifi_props.Get('org.freedesktop.NetworkManager.Device.Wireless', 'LastScan')

            if current_scan != last_scan:
                # scan 'd, return the access points
                return self._get_access_points(wifi_dev)

            # wait before checking
            time.sleep(0.1)

        # Took too long to complete scan
        raise NMException('Request timed out')

    @handle_dbus_exceptions
    def forget(self, ssid: str):
        '''
        Forget a network
        '''
        for connection in self._list_connections():
            config = connection.GetSettings()
            # ensure config being None cannot cause issues
            if config == None:
                logging.warning('Failed to get config from connection')
                continue
            try:
                if config['connection']['id'] == ssid:
                    connection.Delete()
            except KeyError as e:
                raise NMException(f'Error occurred when attempting to forget network: {str(e)}')

    '''
    NOTE: All private functions should not have DBusException error handling
    '''

    def _get_wifi_device(self):
        devices = self.interface.GetDevices()
        if devices == None:
            logging.warning('Failed to retrieve device list')
            devices = []
        for dev_path in devices:
            dev_proxy = self.bus.get_object('org.freedesktop.NetworkManager', dev_path)
            dev_props = dbus.Interface(dev_proxy, 'org.freedesktop.DBus.Properties')
            dev_type = dev_props.Get('org.freedesktop.NetworkManager.Device', 'DeviceType')

            # is wifi device
            if dev_type == 2:
                wifi_dev = dbus.Interface(dev_proxy, 'org.freedesktop.NetworkManager.Device.Wireless')
                return (wifi_dev, dev_proxy)
        return (None, None)

    def _get_access_points(self, wifi_dev) -> List[AccessPoint]:
        '''
        Get a list of access points. Should only be called after scanning for networks
        '''
        access_points: List[AccessPoint] = []
        wifi_access_points = wifi_dev.GetAccessPoints()
        if wifi_access_points == None:
            return []
        for ap_path in wifi_access_points:
            ap_proxy = self.bus.get_object('org.freedesktop.NetworkManager', ap_path)
            ap_props = dbus.Interface(ap_proxy, 'org.freedesktop.DBus.Properties')

            ssid = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'Ssid')
            strength = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'Strength')
            flags = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'Flags')
            wpa_flags = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'WpaFlags')
            rsn_flags = ap_props.Get('org.freedesktop.NetworkManager.AccessPoint', 'RsnFlags')

            requires_password = self._ap_requires_password(flags, wpa_flags, rsn_flags)

            access_points.append(AccessPoint(''.join([chr(byte) for byte in ssid]), int(strength), requires_password))

        return sorted(access_points, key=lambda ap: ap.strength, reverse=True)

    def _ap_requires_password(self, flags: int, wpa_flags: int, rsn_flags: int):
        '''
        Check if a given access point requires password
        '''
        NM_802_11_AP_FLAGS_PRIVACY = 0x1

        # check the overall flags and additionally check if there are any security flags which would indicate a password is needed
        return flags & NM_802_11_AP_FLAGS_PRIVACY == 1 or wpa_flags != 0 or rsn_flags != 0

    def _get_connection_proxy(self, active_connection):
        # Get the connection details from the active connection
        connection_proxy = dbus.Interface(self.bus.get_object('org.freedesktop.NetworkManager', active_connection),
                                        'org.freedesktop.DBus.Properties')

        # Get the connection path (this will give us the object path for the connection)
        connection_path = connection_proxy.Get('org.freedesktop.NetworkManager.Connection.Active', 'Connection')

        # Return the connection proxy object based on the connection path
        return self.bus.get_object('org.freedesktop.NetworkManager', connection_path)

    def _list_connections(self) -> List[dbus.Interface]:
        connections = []

        settings_proxy = self.bus.get_object('org.freedesktop.NetworkManager', '/org/freedesktop/NetworkManager/Settings')
        settings = dbus.Interface(settings_proxy, 'org.freedesktop.NetworkManager.Settings')

        # List all the connections saved
        # This might have repeats for some reason, so this needs to be filtered
        connections_list = settings.ListConnections()
        if connections_list == None:
            return []
        for connection_path in connections_list:
            proxy = self.bus.get_object('org.freedesktop.NetworkManager', connection_path)
            connection = dbus.Interface(proxy, 'org.freedesktop.NetworkManager.Settings.Connection')
            connections.append(connection)

        return connections
