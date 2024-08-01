# DWE OS 2.0

API and driver rewrite of DWE OS

## Installation

To install for any *supported* Linux system, run the following command: 

```sh
curl -s https://raw.githubusercontent.com/DeepwaterExploration/DWE_OS_2/main/install.sh | sudo bash -s
```

## Building for development

1. Clone the repository

```sh
git clone https://github.com/DeepwaterExploration/DWE_OS_2.git
cd DWE_OS_2
```

2. Build the project

```sh
./build_project.sh
```
3. Run the project
```sh
./run_release.sh
```


## Create raspberry pi ISO image
- use the raspberry pi imager to install a raspberry pi os lite to a SD Card / USB thumb drive
- Run ```create_rpi_image.sh``` **Note this assumes the mount point is ```/media/dwe/```**
- Use DWE_OS-raspbian.iso to install as many copies as possible