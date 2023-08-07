import subprocess
import platform
import importlib


def install_missing_packages():
    required_packages = [
        {
            "module_name": "psutil",
            "pip_name": "psutil",
        },
        {
            "module_name": "netifaces",
            "pip_name": "netifaces",
        },
        {
            "module_name": "cpuinfo",
            "pip_name": "py-cpuinfo",
        },
        {
            "module_name": "pywifi",
            "pip_name": "pywifi",
        },
    ]

    match platform.system():
        case "Windows":
            pip_command = ["runas /user:Administrator", "python", "-m", "pip" "install"]
            required_packages.append(
                {
                    "module_name": "wmi",
                    "pip_name": "wmi",
                },
            )
        case "Linux":
            pip_command = ["sudo", "python3", "-m", "pip", "install"]
        case "Darwin":
            pip_command = ["sudo", "python3", "-m", "pip", "install"]
            required_packages.append(
                {
                    "module_name": "plistlib",
                    "pip_name": "plistlib",
                },
            )

    missing_packages = []
    for package in required_packages:
        try:
            importlib.import_module(package["module_name"])
        except ImportError:
            missing_packages.append(package["pip_name"])
    if missing_packages:
        print("Installing missing packages:")
        for package in missing_packages:
            print(
                f"{package} - Installing missing packages using {' '.join(pip_command + [package])}:"
            )
            print(f" - {package}")
            if platform.system().lower() == "windows":
                subprocess.check_call(
                    [
                        pip_command,
                        package,
                        # "--trusted-host",
                    ]
                )
            else:
                subprocess.check_call(" ".join(pip_command + [package]))
        print("All missing packages have been installed.")
    else:
        print("All required packages are already installed.")
