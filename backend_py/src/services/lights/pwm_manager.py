import os
from dataclasses import dataclass
from typing import List
import re

@dataclass
class PWMChannel:
    channel: int

@dataclass
class PWMChip:
    chip: int
    channels: List[PWMChannel]

class PWMManager:
    PWM_BASE_PATH = '/sys/class/pwm'
    CHIP_REGEX = re.compile(r"pwmchip(\d+)")
    CHANNEL_REGEX = re.compile(r"pwm(\d+)")

    def __init__(self) -> None:
        self.chips: List[PWMChip] = []

        self._enumerate()

    def _echo(self, file: str, value: int):
        with open(file, 'w') as export_file:
            export_file.write(str(value))
    
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
                    if not os.path.exists(pwm_channel_path):
                        # create the export
                        print(export_path)
                        try:
                            self._echo(export_path, channel_number)
                        except OSError:
                            continue
                    
                    channels.append(PWMChannel(channel=channel_number))

                self.chips.append(PWMChip(chip=chip_number, channels=channels))

for chip in PWMManager().chips:
    print(chip)
