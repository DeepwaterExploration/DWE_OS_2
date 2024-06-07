#!/bin/sh

#install stuff from apt
sh ./install_requirements.sh
# create python enviroment
sh ./create_venv.sh
# build node frontend
cd ./frontend
sh ./build_frontend.sh
# build go backend
cd ../system_api
sh ./build_system_api.sh
cd ..