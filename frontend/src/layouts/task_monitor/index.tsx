import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";

import { getCPUInfo, getProcesses, getTemperatureInfo } from "./api";
import CPUCard from "./CPUCard";
import TemperatureCard from "./TemperatureCard";
// import MemoryCard from "./MemoryCard";
import { CPUInfo, processInfo, TemperatureInfo } from "./types";
import ProcessesCard from "./processesCard";
import { getSettings } from "../../utils/api";
import { SavedPrefrences } from "../../types/types";

const TaskMonitor: React.FC = () => {
    const [cpuInfo, setCPUInfo] = useState<CPUInfo | null>(null);
    const [temperatureInfo, setTemperatureInfo] = useState<TemperatureInfo | null>(null);
    const [processInfo, setProcessInfo] = useState<processInfo[]>([]);
    const [minTemp, setMinTemp] = useState<number | null>(null);
    const [maxTemp, setMaxTemp] = useState<number | null>(null);

    const [numProc, setNumProc] = useState(10);

    const fetchSettings = async () => {
        const settings: SavedPrefrences = await getSettings();
        setNumProc(settings.defaultProcesses.defaultNumber)
    }
    useEffect(() => {
        fetchSettings();
    }, [])
    useEffect(() => {
        // Track the maximum temperature using a local variable
        let localMaxTemp = maxTemp;
        let localMinTemp = minTemp;
        // Fetch CPU info immediately when the component mounts
        const fetchMachineInfo = async () => {
            const cpuInfo = await getCPUInfo();
            setCPUInfo(cpuInfo);
            // const diskInfo = await get
            // setDiskInfo(diskInfo);
            // const memoryInfo = await getCPUInfo();
            // setMemoryInfo(memoryInfo);
            const temperatureInfo = await getTemperatureInfo();
            setTemperatureInfo(temperatureInfo);

            const processInfo = (await getProcesses());

            setProcessInfo(processInfo);
            // Update the localMaxTemp if the fetched temperature is greater than the current localMaxTemp
            if (
                localMinTemp === null ||
                temperatureInfo.processor_temp < localMinTemp
            ) {
                localMinTemp = temperatureInfo.processor_temp;
            }
            if (
                localMaxTemp === null ||
                temperatureInfo.processor_temp > localMaxTemp
            ) {
                localMaxTemp = temperatureInfo.processor_temp;
            }

            // Update the state with the new temperatureInfo and the final localMaxTemp
            setTemperatureInfo(temperatureInfo);
            setMinTemp(localMinTemp);
            setMaxTemp(localMaxTemp);
        };
        fetchMachineInfo();

        // Fetch CPU info every 30 seconds using setInterval
        const interval = setInterval(async () => {
            fetchMachineInfo();
        }, 1000);

        // Clean up the interval on component unmount to avoid memory leaks
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <Grid
            container
            spacing={4}
            alignItems='baseline'
            flexWrap='wrap'
            style={{
                justifyContent: "left",
                padding: "0 3em",
            }}
        >
            {cpuInfo !== null &&
                temperatureInfo !== null &&
                maxTemp !== null && (
                    <>
                        <CPUCard
                            totalUsagePercent={cpuInfo.total_usage}
                            deviceName={cpuInfo.processor_name || "Unknown"}
                            deviceStats={cpuInfo ? cpuInfo.core_usage : []}
                        />
                        {/* <DiskCard
            currentDiskUsagePercent={diskInfo.disk_usage}
           /> */}
                        {/* <MemoryCard
            totalMemory={memoryInfo.total_memory}
            memoryUsagePercent={memoryInfo.memory_usage}
            />

           */}
                        <TemperatureCard
                            cpuTemp={temperatureInfo.processor_temp}
                            minTemp={minTemp || 0}
                            maxTemp={maxTemp}
                        />
                        <ProcessesCard
                            processes={processInfo}
                            rowLimit={numProc}
                        />
                    </>
                )}
        </Grid>
    );
};

export default TaskMonitor;
