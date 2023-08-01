import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";

import {
  getAvailableWifi,
  getConnectedNetwork,
  // getWifiStatus,
  toggleWifiStatus,
} from "./api";
// import NetworkDetailsCard from "./NetworkDetails";
// import NetworkHistoryCard from "./NetworkHistory";
import NetworkSettingsCard from "./NetworkSettings";
import { WiFiNetwork } from "./types";

const Wifi: React.FC = () => {
  const [wifiStatus, setWifiStatus] = useState<boolean | null>(null);
  const [connectedNetwork, setConnectedNetwork] = useState<WiFiNetwork | null>(
    null
  );
  const [availableNetworks, setAvailableNetworks] = useState<WiFiNetwork[]>([]);
  const [savedNetworks, setSavedNetworks] = useState<WiFiNetwork[]>([]);

  useEffect(() => {
    const turnOnWifi = async () => {
      console.log("turning on wifi", wifiStatus);
      const newWifiStatus = await toggleWifiStatus(true);
      setWifiStatus(newWifiStatus); // Update state using the temporary variable
      console.log("wifi: ", newWifiStatus);
    };

    // const updateWifiStatus = async () => {
    //   const newWifiStatus = await toggleWifiStatus(true);
    //   setWifiStatus(newWifiStatus);
    // };

    const updateNetworks = async () => {
      if (wifiStatus) {
        const networks = await getAvailableWifi();
        setAvailableNetworks(networks);
        // console.log("available networks: ", networks);
        const connectedNetwork = await getConnectedNetwork(networks);
        setConnectedNetwork(connectedNetwork);
        // console.log("connected network: ", connectedNetwork);
      } else {
        setConnectedNetwork(null);
        setAvailableNetworks([]);
      }
    };

    const interval = setInterval(() => {
      updateNetworks();
    }, 5000);

    // Initial updates
    turnOnWifi();
    // updateWifiStatus();
    updateNetworks();

    // Clean up the interval on component unmount to avoid memory leaks
    return () => {
      clearInterval(interval);
    };
  }, [wifiStatus]);

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
      {wifiStatus !== null && (
        <NetworkSettingsCard
          wifiStatus={wifiStatus}
          setWifiStatus={setWifiStatus}
          connectedNetwork={connectedNetwork}
          setConnectedNetwork={setConnectedNetwork}
          networks={availableNetworks}
          setNetworks={setAvailableNetworks}
        />
        // <NetworkHistoryCard networks={savedNetworks} setNetworks={setSavedNetworks} />
        // <NetworkDetailsCard />
      )}
    </Grid>
  );
};

export default Wifi;
