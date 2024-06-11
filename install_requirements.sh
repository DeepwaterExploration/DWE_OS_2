#!/bin/bash

# install python
sudo apt-get install python3
sudo apt install python3.10-venv

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

    sudo tar -C /usr/local -xzf go${VERSION}.linux-${ARCH}.tar.gz
    echo 'export PATH="/usr/local/go/bin:$PATH"' > $HOME/.bashrc 
    rm go${VERSION}.linux-${ARCH}.tar.gz
}


# install gstreamer
sudo apt-get install -y libglib2.0-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-libav gcc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# install npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc # reload with nvm
nvm install node