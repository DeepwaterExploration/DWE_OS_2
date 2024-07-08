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
		cmd, _ := p.Cmdline()
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

		processList = append(processList, ProcessInfo{
			Name:    name,
			Pid:     pid,
			CPU:     cpu,
			MemInfo: meminfo,
			Cmd:     cmd,
		})
	}

	return processList, nil
}
