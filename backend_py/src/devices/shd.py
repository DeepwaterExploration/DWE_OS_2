import logging

from ..saved_types import SavedDevice

from ..enumeration import DeviceInfo
from ..device import Device

class SHDDevice(Device):
    '''
    Class for stellarHD devices
    '''

    def __init__(self, device_info: DeviceInfo, is_leader=True) -> None:
        super().__init__(device_info)
        self.is_leader = is_leader
        self.leader: str = None
        self.leader_device: 'SHDDevice' = None

    def set_leader(self, leader: 'SHDDevice'):
        # We love forward references
        if not leader.is_leader:
            logging.warn('Attempting to add follower SHD as a leader. This is undefined behavior and will not be permitted.')
            return
        self.leader_device = leader
        self.leader = leader.bus_info
        # remember to stop the stream because it is no longer managed by this device
        self.stream_runner.stop()
        if len(leader.stream_runner.streams) < 2:
            leader.stream_runner.streams.append(self.stream)
        else:
            leader.stream_runner.streams[1] = self.stream
        
        # restart leader's stream to now include this device
        leader.start_stream()

    def load_settings(self, saved_device: SavedDevice):
        if not saved_device.is_leader:
            # self.set_leader()
            print(saved_device.leader)
        return super().load_settings(saved_device)

    def remove_leader(self):
        if not self.leader_device:
            logging.warn('Attempting to remove leader from a device with no leader. This is undefined behavior and will not be permitted.')
            return
        self.leader_device.stream_runner.streams.remove(self.stream)
        # restart the leader device stream to take this device out of it
        if self.leader_device.stream_runner.started:
            self.leader_device.start_stream()
        self.leader_device = None
        self.leader = None
        # start the stream if configured
        if self.stream.configured:
            self.stream_runner.start()

    def start_stream(self):
        if not self.is_leader:
            if self.leader:
                logging.info('Starting stream as a follower. This will start the leader\'s stream')
                self.leader_device.start_stream()
                return
        super().start_stream()
