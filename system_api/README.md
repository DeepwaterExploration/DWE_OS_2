go build && clear && ./system_api

## Usage
The system api is responsible for:
- connecting to, disconecting from, and searching for wifi networks
- Shutting down/restarting the device
- Get cpu usage and temperature
- Get running processes

All requests are done to a http server running on port 5050
#### Available Commands

Here is a list of all the available commands:

| Script      | Description                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------- |
| go mod tidy | Installs all the dependencies listed in `go.mod`.                                             |
| go run .    | Runs the application without building it.                                                     |
| go build .  | Builds the application into an executable file for different platforms using the Go compiler. |
