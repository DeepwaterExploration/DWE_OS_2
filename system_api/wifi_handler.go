package main

import (
	"fmt"
	"os/exec"
	"strings"
	"time"

	"github.com/theojulienne/go-wireless"
)

type WifiHandler struct {
	WPASupplicant   *wireless.Client
	TimeoutDuration time.Duration
	InterfaceName   string
	ScanResults     []wireless.AP
	SavedResults    []SavedWifiNetwork
}

func NewWifiHandler() (*WifiHandler, error) {
	wifiHandler := &WifiHandler{}
	err := wifiHandler.init()
	if err != nil {
		return nil, err
	}
	return wifiHandler, nil
}

func (wh *WifiHandler) init() error {
	// Establish a socket connection with the wifi manager
	interfaces := wireless.Interfaces()

	if len(interfaces) == 0 {
		return fmt.Errorf("No valid wifi interfaces found")
	}

	// wh.WPASupplicant, err = wpasupplicant.Unixgram(interfaces[0])
	Log.Printf("Connecting to wifi manager on interface %s", interfaces[0])

	if err != nil {
		return fmt.Errorf("Error connecting to wifi manager: %v", err)
	}

	// Set the timeout duration
	wh.TimeoutDuration = time.Duration(3) * time.Second
	// wh.WPASupplicant.SetTimeout(wh.TimeoutDuration)

	// Set the interface name
	wh.InterfaceName = interfaces[0]

	wh.ScanResults = []wireless.AP{}
	wh.SavedResults = []SavedWifiNetwork{}

	wh.WPASupplicant, err = wireless.NewClient(wh.InterfaceName)

	return nil
}

func (wh *WifiHandler) findValidInterfaces() ([]string, error) {
	output, err := exec.Command("bash", "-c", "iwconfig 2>/dev/null | grep -o '^[[:alnum:]]*'").Output()
	if err != nil {
		return nil, err
	}
	interfaces := strings.Fields(string(output))
	if len(interfaces) == 0 {
		return nil, fmt.Errorf("No valid wifi interfaces found")
	}
	return interfaces, nil
}

func (wh *WifiHandler) connect(socket string) error {
	// Implement the logic for connecting to the wifi manager
	// You may need to replace this with the Go equivalent code
	return nil
}

func (wh *WifiHandler) NetworkScan() ([]wireless.AP, error) {
	aps, err := wh.WPASupplicant.Scan()
	if err != nil {
		return nil, err
	}
	return aps, nil
}

func (wh *WifiHandler) NetworkStatus() (*NetworkStatus, error) {
	return nil, nil
}

func (wh *WifiHandler) NetworkSaved() ([]SavedWifiNetwork, error) {
	return nil, nil
}

func (wh *WifiHandler) NetworkConnected() ([]SavedWifiNetwork, error) {
	return nil, nil
}

func NetworkToggle(wifiOn bool) (bool, error) {
	var cmdArgs []string
	if wifiOn {
		cmdArgs = []string{"sudo", "nmcli", "radio", "wifi", "on"}
	} else {
		cmdArgs = []string{"sudo", "nmcli", "radio", "wifi", "off"}
	}
	output, err := exec.Command(cmdArgs[0], cmdArgs[1:]...).Output()

	if err != nil || strings.Contains(string(output), "Error") {
		return !wifiOn, err
	}

	output, err = exec.Command("sudo", "apt", "install", "network-manager", "-y").Output()

	if err != nil || strings.Contains(string(output), "Error") {
		return !wifiOn, err
	}

	// Sleep for 3 seconds (3000 milliseconds)
	time.Sleep(3 * time.Second)

	return wifiOn, nil
}

func (wh *WifiHandler) NetworkConnect(WifiSSID string, WifiPassword string) (bool, error) {
	_, err := exec.Command(fmt.Sprintf("nmcli device wifi con \"%s\" password \"%s\"", WifiSSID, WifiPassword)).Output()
	if err != nil {
		return false, err
	}
	return true, nil
}

func (wh *WifiHandler) NetworkDisconnect(WifiSSID string) (bool, error) {
	_, err := exec.Command(fmt.Sprintf("nmcli con down \"%s\"", WifiSSID)).Output()
	if err != nil {
		return false, err
	}
	_, err = exec.Command(fmt.Sprintf("f'nmcli connection modify \"%s\" connection.autoconnect no", WifiSSID)).Output()
	if err != nil {
		return false, err
	}
	return true, nil
}

func (wh *WifiHandler) NetworkForget(WifiSSID string) (bool, error) {
	_, err := exec.Command(fmt.Sprintf("nmcli connection delete \"%s\"", WifiSSID)).Output()
	if err != nil {
		return false, err
	}
	return true, nil
}
