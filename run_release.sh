#!/bin/bash

# expects create_venv.sh to have been run

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

cd ${SCRIPT_DIR}
if command -v go >/dev/null 2>&1 && command -v python >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    echo "All required commands are available."; exit 0
else
    sh ./build_project.sh
fi


sudo -E /opt/DWE_OS_2/.env/bin/python3 run_release.py

# needs sudo perms for the go backend
