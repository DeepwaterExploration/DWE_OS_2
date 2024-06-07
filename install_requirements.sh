#!/bin/bash

# install python
sudo apt-get install python3

# install golang from offical source
ommand -v go >/dev/null 2>&1 || {
    VERSION="1.22.4"
    if hash dpkg &> /dev/null;
    then
        ARCH=$(dpkg --print-architecture)
    else
        ARCH="amd64"
    fi
    curl -O -L "https://golang.org/dl/go${VERSION}.linux-${ARCH}.tar.gz"

    tar -C /usr/local -xzf go${VERSION}.linux-${ARCH}.tar.gz
}


# install gstreamer
sudo apt-get install libglib2.0-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-libav
