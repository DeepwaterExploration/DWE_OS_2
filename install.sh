#!/bin/bash

set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  exit 1
fi

INSTALL_DIR=/opt/dweOS
SCRIPT_RUN_DIR=$PWD

# Check if a tag name was provided as an argument
if [ -z "$1" ]; then
    VERSION="latest"
else
    VERSION=$1
fi

if [ "$VERSION" == "latest" ]; then
    echo "Installing dweOS (latest release)"
    DOWNLOAD_URL="https://github.com/DeepWaterExploration/dweOS/releases/latest/download/release.tar.gz"
else
    echo "Installing dweOS ($VERSION)"
    DOWNLOAD_URL="https://github.com/DeepWaterExploration/dweOS/releases/download/$VERSION/release.tar.gz"
fi

wget $DOWNLOAD_URL -O release.tar.gz

tar -xvzf release.tar.gz

if [ -d "$INSTALL_DIR" ]; then
    echo "$INSTALL_DIR does exist, deleting."
    rm -rf $INSTALL_DIR
fi

mkdir -p ${INSTALL_DIR}

cp -r release/* ${INSTALL_DIR}

cd ${INSTALL_DIR}

sh install_requirements.sh &&
sh create_venv.sh &&

# Remove any legacy DWE_OS 2 install (the project's previous name)
LEGACY_SERVICE=dwe_os_2
LEGACY_INSTALL_DIR=/opt/DWE_OS_2
LEGACY_DATA_DIR=/var/lib/dwe_os
DATA_DIR=/var/lib/dweos

if [ -f /etc/systemd/system/${LEGACY_SERVICE}.service ]; then
    echo "Removing legacy ${LEGACY_SERVICE} service..."
    systemctl stop ${LEGACY_SERVICE} || true
    systemctl disable ${LEGACY_SERVICE} || true
    rm -f /etc/systemd/system/${LEGACY_SERVICE}.service
    systemctl daemon-reload
fi

if [ -d "$LEGACY_INSTALL_DIR" ]; then
    echo "Deleting legacy install at $LEGACY_INSTALL_DIR"
    rm -rf $LEGACY_INSTALL_DIR
fi

# Keep existing recordings
if [ -d "$LEGACY_DATA_DIR" ] && [ ! -e "$DATA_DIR" ]; then
    echo "Moving $LEGACY_DATA_DIR to $DATA_DIR"
    mv $LEGACY_DATA_DIR $DATA_DIR
fi

# check if the service is already running, and stop it if necessary
if systemctl is-active --quiet dweos; then
    echo "Stopping currently running dweos service..."
    systemctl stop dweos
fi

# copy and enable service
cp ${INSTALL_DIR}/service/* /etc/systemd/system/
systemctl daemon-reload
systemctl enable dweos
systemctl start dweos

# cleanup
cd $SCRIPT_RUN_DIR

rm -rf release
rm release.tar.gz

if [ "$VERSION" == "latest" ]; then
    echo "Successfully installed dweOS (latest version)"
else
    echo "Successfully installed dweOS ($VERSION)"
fi
