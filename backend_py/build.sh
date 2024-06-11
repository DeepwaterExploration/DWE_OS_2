#!/bin/bash

mkdir build -p
sudo cc -fPIC -shared -o ${PWD}/build/camera_helper.so ${PWD}/src/camera_helper.c
