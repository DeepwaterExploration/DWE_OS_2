package main

import (
	"github.com/shirou/gopsutil/process"
)

type ProcessInfo struct {
	Name    string  `json:"name"`
	Pid     int32   `json:"pid"`
	CPU     float64 `json:"cpu"`
	MemInfo float32 `json:"memory"`
	Cmd     string  `json:"cmd"`
	Status  string  `json:"status"`
}

func processes() ([]ProcessInfo, error) {
	processes, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var processList []ProcessInfo

	for _, p := range processes {
		name, err := p.Name()
		if err != nil {
			name = "Unknown"
		}
		cmd, _ := p.Exe()
		if err != nil {
			cmd = "Unknown"
		}

		pid := p.Pid

		cpu, err := p.CPUPercent()
		if err != nil {
			cpu = -1
		}

		meminfo, err := p.MemoryPercent()
		if err != nil {
			meminfo = -1
		}
		status, err := p.Status()
		if err != nil {
			status = ""
		} else {
			status = convertStatusChar(status)
		}

		processList = append(processList, ProcessInfo{
			Name:    name,
			Pid:     pid,
			CPU:     cpu,
			MemInfo: meminfo,
			Cmd:     cmd,
			Status:  status,
		})
	}

	return processList, nil
}

const (
	Running = "running"
	Blocked = "blocked"
	Idle    = "idle"
	Lock    = "lock"
	Sleep   = "sleep"
	Stop    = "stop"
	Wait    = "wait"
	Zombie  = "zombie"

	Daemon   = "daemon"
	Detached = "detached"
	System   = "system"
	Orphan   = "orphan"

	UnknownState = ""
)

func convertStatusChar(letter string) string {
	switch letter {
	case "A":
		return Daemon
	case "D", "U":
		return Blocked
	case "E":
		return Detached
	case "I":
		return Idle
	case "L":
		return Lock
	case "O":
		return Orphan
	case "R":
		return Running
	case "S":
		return Sleep
	case "T", "t":
		// "t" is used by Linux to signal stopped by the debugger during tracing
		return Stop
	case "W":
		return Wait
	case "Y":
		return System
	case "Z":
		return Zombie
	default:
		return UnknownState
	}
}
