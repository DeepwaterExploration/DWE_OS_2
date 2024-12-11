import os
from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Union, Optional, Mapping, Any
import re
import logging
from marshmallow import Schema, fields, exceptions
from .pin_storage import PinStateStorage, PinState
import serial
from abc import ABC, abstractmethod

@dataclass
class PWMChannel:
    channel: int
    frequency: float = 0
    duty_cycle: float = 0

@dataclass
class PWMChip:
    chip: int
    channels: List[PWMChannel]

@dataclass
class PWMPin:
    chip_id: int
    channel_id: int

class DeviceFamily(Enum):
    RASPBERRY_PI = 0
    JETSON = 1
    UNKNOWN = 2

@dataclass
class DeviceMapping:
    device_family: DeviceFamily
    model: str
    pin_mappings: Dict[str, PWMPin]

    def get_pin_mapping(self, pin: str) -> PWMPin:
        return self.pin_mappings[pin]

class PWMPinSchema(Schema):
    chip_id = fields.Int()
    channel_id = fields.Int()

class DeviceMappingSchema(Schema):
    device_family = fields.Enum(DeviceFamily)
    model = fields.Str()
    pin_mappings = fields.Dict(keys=fields.Str(), values=fields.Nested(PWMPinSchema))

class DeviceRegistry:
    def __init__(self) -> None:
        self.device_mappings: List[DeviceMapping] = []
        
        self.register_device_mapping(DeviceMapping(
            DeviceFamily.RASPBERRY_PI, '4b', {
                '18': PWMPin(0, 0),
                '19': PWMPin(0, 1)
            }
        ))

        self.register_device_mapping(DeviceMapping(
            DeviceFamily.RASPBERRY_PI, '5', {
                '18': PWMPin(2, 2),
                '19': PWMPin(2, 3)
            }
        ))

        self.register_device_mapping(DeviceMapping(
            DeviceFamily.JETSON, 'CT-NGX024', {
                '12': PWMPin(2, 0),
                '13': PWMPin(3, 0)
            }
        ))


    def register_device_mapping(self, device_mapping: DeviceMapping):
        self.device_mappings.append(device_mapping)

    def get_device_mapping(self, device_family: DeviceFamily, model: str) -> Optional[DeviceMapping]:
        for mapping in self.device_mappings:
            if mapping.device_family == device_family and mapping.model == model:
                return mapping
        logging.warning('Unknown device, falling back to base pwm manager. (This should still work, but does not use recommended pin mappings)')
        return None

class PWMManager(ABC):
    @abstractmethod
    def get_pins(self) -> Dict[str, Dict]:
        pass

    @abstractmethod
    def enable_pin(self, pin_info: str):
        pass

    @abstractmethod
    def disable_pin(self, pin_info: str):
        pass

    @abstractmethod
    def set_pin_frequency(self, pin_info: str, frequency: float):
        pass

    @abstractmethod
    def set_pin_duty_cycle(self, pin_info: str, duty_cycle: float):
        pass

    @abstractmethod
    def cleanup(self):
        pass

class SystemPWMManager:
    PWM_BASE_PATH = '/sys/class/pwm'
    CHIP_REGEX = re.compile(r"pwmchip(\d+)")
    CHANNEL_REGEX = re.compile(r"pwm(\d+)")

    def __init__(self) -> None:
        self.chips: List[PWMChip] = []

        self._enumerate()

    def enable_channel(self, chip_id: int, channel_id: int):
        print('enabling')
        try:
            self._echo(os.path.join(self._get_channel_path(chip_id, channel_id), 'enable'), 1)
        except OSError:
            print('error enabling')
            pass

    def disable_channel(self, chip_id: int, channel_id: int):
        self._echo(os.path.join(self._get_channel_path(chip_id, channel_id), 'enable'), 0)

    def set_channel_frequency(self, chip_id: int, channel_id: int, frequency: float):
        channel = self._get_channel(chip_id, channel_id)
        channel.frequency = frequency

        # self.enable_channel(chip_id, channel_id)

        # Save the current duty cycle and zero it
        original_duty_cycle = channel.duty_cycle
        if original_duty_cycle:
            self._set_duty_cycle(chip_id, channel_id, 0, channel.frequency)

        # Update the frequency
        self._set_channel_frequency(chip_id, channel_id, frequency)

        # Restore the original duty cycle
        self._set_duty_cycle(chip_id, channel_id, original_duty_cycle, frequency)

    def set_channel_duty_cycle(self, chip_id: int, channel_id: int, duty_cycle: float):
        channel = self._get_channel(chip_id, channel_id)
        self._set_duty_cycle(chip_id, channel_id, duty_cycle, channel.frequency)
        channel.duty_cycle = duty_cycle

    def _set_channel_frequency(self, chip_id: int, channel_id: int, frequency: float):
        period_ns = int((1 / frequency) * 1_000_000_000)
        period_path = os.path.join(self._get_channel_path(chip_id, channel_id), 'period')

        self._echo(period_path, period_ns)
        self.enable_channel(chip_id, channel_id)

    def _set_duty_cycle(self, chip_id: int, channel_id: int, duty_cycle: float, frequency: float):
        if frequency == 0:
            return
        # Compute duty cycle in nanoseconds
        period_ns = int((1 / frequency) * 1_000_000_000)
        duty_cycle_ns = int((duty_cycle / 100) * period_ns)
        duty_cycle_path = os.path.join(self._get_channel_path(chip_id, channel_id), 'duty_cycle')

        # Write the duty cycle value
        self._echo(duty_cycle_path, duty_cycle_ns)
        self.enable_channel(chip_id, channel_id)

    def _get_chip_path(self, chip_id: int) -> str:
        return os.path.join(self.PWM_BASE_PATH, f'pwmchip{chip_id}')
    
    def _get_channel_path(self, chip_id: int, channel_id: int) -> str:
        return os.path.join(self._get_chip_path(chip_id), f'pwm{channel_id}')

    def _get_channel(self, chip_id: int, channel_id: int):
        chip = self._get_chip(chip_id)

        for channel in chip.channels:
            if channel.channel == channel_id:
                return channel
        
        return None

    def _get_chip(self, chip_id: int):
        for chip in self.chips:
            if chip.chip == chip_id:
                return chip
        return None

    def _echo(self, file: str, value: int):
        with open(file, 'w') as export_file:
            export_file.write(str(value))
    
    def cleanup(self):
        for chip in self.chips:
            for channel in chip.channels:
                try:
                    self.disable_channel(chip.chip, channel.channel)
                except OSError:
                    continue

    def _enumerate(self):
        for chip_entry in os.listdir(self.PWM_BASE_PATH):
            # Get the match of the chip
            chip_match = self.CHIP_REGEX.match(chip_entry)

            if chip_match:
                chip_number = int(chip_match.group(1))
                chip_path = os.path.join(self.PWM_BASE_PATH, chip_entry)

                npwm_path = os.path.join(chip_path, 'npwm')
                with open(npwm_path, 'r') as f:
                    npwm = int(f.read().strip())

                channels: List[PWMChannel] = []

                # Iterate over every channel
                export_path = os.path.join(chip_path, 'export')
                for channel_number in range(npwm):
                    pwm_channel_path = os.path.join(chip_path, f'pwm{channel_number}')
                    # self.enable_channel(chip_number, channel_number)
                    if not os.path.exists(pwm_channel_path):
                        # create the export
                        try:
                            self._echo(export_path, channel_number)
                        except OSError:
                            continue
                    
                    channels.append(PWMChannel(channel_number))

                self.chips.append(PWMChip(chip=chip_number, channels=channels))

        print(self.chips)

class GlobalPWMManager(SystemPWMManager, PWMManager):

    def __init__(self, pin_storage: PinStateStorage, device_family: DeviceFamily = DeviceFamily.UNKNOWN, model: str = '') -> None:
        super().__init__()

        self.registry = DeviceRegistry()
        self.current_mapping = self.registry.get_device_mapping(device_family, model)
        self.pin_storage = pin_storage

        # Device family is not known or model is not known
        if not self.current_mapping:
            # Dynamically generate fake pin mappings corresponding to chip:channel pin number
            # This is to keep things simpler code wise, but also make sense to the user
            pin_mappings = {}
            # Start default pin at 1
            for chip in self.chips:
                for channel in chip.channels:
                    pin_mappings[f'{chip.chip}:{channel.channel}'] = PWMPin(chip.chip, channel.channel)

            self.current_mapping = DeviceMapping(
                device_family, model, pin_mappings
            )

        initial_pin_states = self.pin_storage.get_pin_states()
        for pin in initial_pin_states:
            self.set_pin_frequency(pin, initial_pin_states[pin].frequency)
            self.set_pin_duty_cycle(pin, initial_pin_states[pin].duty_cycle)

    def get_pins(self) -> dict:
        out_dict = {}
        for pin_info in self.current_mapping.pin_mappings:
            channel = self._get_channel_from_pin(pin_info)
            pin_mapping = self.current_mapping.get_pin_mapping(pin_info)
            out_dict[pin_info] = {
                'frequency': channel.frequency,
                'duty_cycle': channel.duty_cycle,
                'chip_id': pin_mapping.chip_id,
                'channel_id': pin_mapping.channel_id,
            }
        return out_dict

    def get_pin_mapping(self):
        return DeviceMappingSchema().dump(self.current_mapping)

    def enable_pin(self, pin_info: Union[str, int]):
        self.enable_channel(
            **self._get_pwm_pin(pin_info).__dict__
        )

    def disable_pin(self, pin_info: str):
        self.disable_channel(
            **self._get_pwm_pin(pin_info).__dict__
        )

    def set_pin_frequency(self, pin_info: str, frequency: float):
        if frequency == 0:
            return
        pwm_pin = self._get_pwm_pin(pin_info)
        self.set_channel_frequency(**pwm_pin.__dict__, frequency=frequency)

        self.pin_storage.save_pin_frequency(pin_info, frequency)
    
    def set_pin_duty_cycle(self, pin_info: str, duty_cycle: float):
        self.set_channel_duty_cycle(**self._get_pwm_pin(pin_info).__dict__, duty_cycle=duty_cycle)

        self.pin_storage.save_pin_duty_cycle(pin_info, duty_cycle)

    def _get_channel_from_pin(self, pin_info: str):
        return self._get_channel(**self._get_pwm_pin(pin_info).__dict__)

    def _get_pwm_pin(self, pin_info: str) -> PWMPin:
        return self.current_mapping.get_pin_mapping(pin_info)


class SerialPWMManager(PWMManager):
    def __init__(self, interface: str, pin_storage: PinStateStorage):
        self.interface = interface
        self.baud_rate = 9600
        self.serial_conn = serial.Serial(self.interface, self.baud_rate, timeout=1)
        self.pin_storage = pin_storage
        
        self.duty_cycle = 0
        self.frequency = 0
        
        initial_pin_states = self.pin_storage.get_pin_states()
        for pin in list(initial_pin_states):
            self.set(initial_pin_states[pin].frequency, initial_pin_states[pin].duty_cycle)
            self.frequency = initial_pin_states[pin].frequency
            self.duty_cycle = initial_pin_states[pin].duty_cycle

    def get_pins(self):
        out_dict = {}
        out_dict['serial1'] = {
            'frequency': self.frequency,
            'duty_cycle': self.duty_cycle,
            'chip_id': 0,
            'channel_id': 0,
        }
        return out_dict

    def set_pin_frequency(self, pin_info: str, frequency: float):
        self.frequency = frequency
        self.set(self.frequency, self.duty_cycle)

    def set_pin_duty_cycle(self, pin_info: str, duty_cycle):
        self.duty_cycle = duty_cycle
        self.set(self.frequency, self.duty_cycle)

    def _send(self, command: str):
        if self.serial_conn.is_open:
            command_to_send = command + "\n"  # Append newline for command termination
            self.serial_conn.write(command_to_send.encode('utf-8'))
        else:
            raise ConnectionError("Serial connection is not open.")

    def set(self, frequency: float, duty_cycle: float):
        if not (0 <= duty_cycle <= 100):
            raise ValueError("Duty cycle must be between 0 and 100.")
        
        if frequency < 0:
            raise ValueError("Frequency must be non-negative.")
        
        command = f"{frequency},{duty_cycle}"
        self.pin_storage.save_pin(PinState('serial1', frequency, duty_cycle))
        self._send(command)

    def disable_pin(self, pin_info):
        pass

    def enable_pin(self, pin_info):
        pass

    def stop(self):
        self.set(0, 0)

    def cleanup(self):
        self.serial_conn.close()

    def close(self):
        if self.serial_conn.is_open:
            self.serial_conn.close()
