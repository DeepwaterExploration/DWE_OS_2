# dweOS

[![Backend CI](https://github.com/DeepWaterExploration/dweOS/actions/workflows/backend.yml/badge.svg)](https://github.com/DeepWaterExploration/dweOS/actions/workflows/backend.yml) [![Frontend CI](https://github.com/DeepWaterExploration/dweOS/actions/workflows/frontend.yml/badge.svg)](https://github.com/DeepWaterExploration/dweOS/actions/workflows/frontend.yml) [![Build Release](https://github.com/DeepWaterExploration/dweOS/actions/workflows/release.yml/badge.svg)](https://github.com/DeepWaterExploration/dweOS/actions/workflows/release.yml)
[![BlueOS Plugin: Version](https://img.shields.io/docker/v/deepwaterexploration/dwe_os_2?color=blue&labelColor=white&label=BlueOS%20Plugin&sort=semver&arch=arm64&logo=data:image/svg%2Bxml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTkuMDkgMjU5LjA5Ij4KICA8dGl0bGU+Qmx1ZVJvYm90aWNzLUxvZ288L3RpdGxlPgogIDxwYXRoIGZpbGw9IiMyYzk5Y2UiIGQ9Ik0xNDcuMjMsMjU3Ljg5QTEyOS41NywxMjkuNTcsMCwwLDEsNzQuODEsMTIuMWM2Ljg2LDEwLjMyLDE4LjY5LDI5LjgyLDIwLDUyLjJhNzMuOTIsNzMuOTIsMCwwLDAsMTYuODEsMTM3QzExNi4xNywyMTYuMjYsMTIwLjEzLDIyNS4yNiwxNDcuMjMsMjU3Ljg5Wk0xMjkuNTQsMGExMjkuNTYsMTI5LjU2LDAsMCwxLDU0Ljc0LDI0N2MtNi44Ni0xMC4zMi0xOC42OS0yOS44Mi0yMC01Mi4yQTczLjkyLDczLjkyLDAsMCwwLDE0Ny40Niw1Ny44NGMtNC41NC0xNS04LjUtMjQtMzUuNi01Ni42NEExMzAuNDgsMTMwLjQ4LDAsMCwxLDEyOS41NCwwWiI+PC9wYXRoPgo8L3N2Zz4K)](https://hub.docker.com/r/deepwaterexploration/dwe_os_2/tags)

Web interface driver for DWE.ai cameras.

## Installation

To install for any *supported* Linux system, run the following command: 

`curl -s https://raw.githubusercontent.com/DeepwaterExploration/DWE_OS_2/main/install.sh | sudo bash -s`

### Raspberry Pi Hardware PWM

In order to enable hardware PWM on your Raspberry Pi, you need to edit `/boot/firmware/config.txt`. See [Raspberry Pi documentation](https://www.raspberrypi.com/documentation/computers/config_txt.html) for more information.

Add the following lines to the end of the file, and reboot.

```
[all]
dtoverlay=pwm-2chan
```

## Building for development

1. Clone the repository

```sh
git clone https://github.com/DeepwaterExploration/DWE_OS_2.git
cd DWE_OS_2
```

3. Build the project

```sh
cd frontend
npm install
cd ..
sudo chmod -R 777 ./
./create_release.sh
```

## Building the RPi Image

```
git clone https://github.com/DeepwaterExploration/pi-gen
cd pi-gen
sudo ./build.sh -c config
```

The image will be found in the deploy folder. The latest release from github will be used for building the image.

## Creating a Release

Releases are versioned from `frontend/package.json` and use [conventional commits](https://www.conventionalcommits.org) to generate `CHANGELOG.md`. You need [git-cliff](https://git-cliff.org), `npm`, and the [GitHub CLI](https://cli.github.com) (`gh`).

1. Run `./bump_version.sh X.Y.Z` from a clean working tree. The script:
    - creates `release/vX.Y.Z` from the latest `origin/main`
    - sets the version in `frontend/package.json` and `package-lock.json`
    - regenerates `CHANGELOG.md` with git-cliff, which adds the new release
    - commits `chore(release): vX.Y.Z`, then pushes the branch and opens a PR after you confirm

   Use `--no-push` to stop after the local commit, or `-y` to skip the confirmation.
2. Wait for Backend CI and Frontend CI to pass on the PR, then merge it.
3. The [Tag Release](.github/workflows/tag-release.yml) workflow tags the merge commit as `vX.Y.Z` and starts [Build Release](.github/workflows/release.yml). That workflow creates a draft GitHub release.
4. Publish the draft release in the GitHub UI.

The changelog starts at v0.7.4. Commits up to and including v0.7.3 predate conventional commits, so v0.7.3 is the baseline. To regenerate the changelog by hand, start from that tag:

```sh
git cliff v0.7.3..HEAD -o CHANGELOG.md
```

A plain `git cliff` without the range also picks up older commits whose messages happen to look like `word: text`, such as `TODO: fix wifi`.
