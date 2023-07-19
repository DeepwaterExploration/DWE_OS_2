import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedCameraIcon from "@mui/icons-material/LinkedCamera";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import React, { useEffect, useState } from "react";

import { styles } from "./style";
import {
  CameraFormatSize,
  Control,
  Device,
  StreamEndpoint,
  bitrateMode,
  controlType,
} from "../../utils/api";

// import { Padding } from "@mui/icons-material";

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;

interface SupportingTextProps {
  children: React.ReactNode;
}

const SupportingText: React.FC<SupportingTextProps> = (props) => {
  return (
    <Typography
      sx={{ fontSize: 14 }}
      color='text.secondary'
      gutterBottom
      marginBottom='14px'
    >
      {props.children}
    </Typography>
  );
};

interface DeviceSwitchProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  checked: boolean;
  text: string;
}

const DeviceSwitch: React.FC<DeviceSwitchProps> = (props) => {
  return (
    <FormControlLabel
      control={
        <Switch
          name={props.name}
          checked={props.checked}
          onChange={props.onChange}
        />
      }
      label={<Typography color='text.secondary'>{props.text}</Typography>}
    />
  );
};

interface ResolutionMenuProps {
  defaultResolution: string;
  resolutions: CameraFormatSize[];
  onResolutionChange: (res: string) => void;
}

const ResolutionMenu: React.FC<ResolutionMenuProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const open = Boolean(anchorEl);
  // const primaryText = props.resolutions[selectedIndex].width + "x" + props.resolutions[selectedIndex].height;
  const [currentResolution, setCurrentResolution] = useState<string>(
    props.defaultResolution
  );
  const primaryText = `Resolution: ${currentResolution}`;

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
    item: CameraFormatSize
  ) => {
    setCurrentResolution(`${item.height}x${item.width}`);
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    props.onResolutionChange(currentResolution);
  }, [currentResolution, props]);
  return (
    <div>
      <List
        component='nav'
        aria-label='Device settings'
        sx={{
          bgcolor: "background",
          display: "inline-block",
          width: "auto",
          boxShadow:
            "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
          padding: "0px",
          margin: "0px",
        }}
      >
        <ListItem
          id='lock-button'
          aria-haspopup='listbox'
          aria-controls='lock-menu'
          aria-label='when device is locked'
          aria-expanded={open ? "true" : undefined}
          onClick={handleClickListItem}
          sx={{
            margin: "0px",
            padding: "6px 16px",
          }}
        >
          <ListItemText primary={primaryText} />
        </ListItem>
      </List>
      <Menu
        id='lock-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
      >
        {props.resolutions.map((option, index) => (
          <MenuItem
            key={`${option.height}x${option.width}`}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index, option)}
          >
            {option.height}x{option.width}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

interface DeviceOptionsProps {
  device: Device;
}

const DeviceOptions: React.FC<DeviceOptionsProps> = (props) => {
  // const device = props.device.stream.device_path;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bitrate, setBitrate] = useState(props.device.options.bitrate);
  const [bitrateSlider, setBitrateSlider] = useState(
    props.device.options.bitrate / 1000000
  );
  const [h264, setH264] = useState(props.device.options.h264);
  const [mode, setMode] = useState(props.device.options.mode);

  return (
    <>
      <SupportingText>
        <span>Bitrate: {bitrateSlider} Mbps</span>
        <Slider
          name='bitrate'
          defaultValue={bitrateSlider}
          disabled={mode === bitrateMode.VBR}
          onChangeCommitted={(_, newValue) => {
            setBitrate(newValue as number);
          }}
          onChange={(_, newValue) => {
            setBitrateSlider(newValue as number);
          }}
          style={{ marginLeft: "20px", width: "calc(100% - 25px)" }}
          size='small'
          max={15}
          min={0.1}
          step={0.1}
        />
      </SupportingText>
      <FormGroup>
        <DeviceSwitch
          checked={h264}
          name='h264Switch'
          onChange={(e) => {
            setH264(e.target.checked);
            setMode(e.target.checked ? bitrateMode.CBR : mode);
          }}
          text='H.264'
        />
        <DeviceSwitch
          checked={mode === bitrateMode.VBR}
          name='vbrSwitch'
          onChange={(e) => {
            setMode(e.target.checked ? bitrateMode.VBR : bitrateMode.CBR);
            setH264(e.target.checked ? false : h264);
          }}
          text={
            mode === bitrateMode.VBR
              ? "VBR (Variable Bitrate)"
              : "CBR (Constant Bitrate)"
          }
        />
      </FormGroup>
    </>
  );
};

interface StreamOptionsProps {
  device: Device;
}

const StreamOptions: React.FC<StreamOptionsProps> = (props) => {
  const [stream, setStream] = useState(
    props.device.stream.device_path !== undefined
  );
  const [endpointsCollapsed, setEndpointsCollapsed] = useState(false);

  const [host, setHost] = useState("192.168.2.1");
  const [port, setPort] = useState(5600);
  const [ipError, setIpError] = useState("");
  const [portError, setPortError] = useState("");

  const [endpoints, setEndpoints] = useState<StreamEndpoint[]>(
    props.device.stream.endpoints ? props.device.stream.endpoints : []
  );

  const handleAddEndpoint = () => {
    // Check if the IP is valid
    const validIP: boolean = IP_REGEX.test(host);
    if (!validIP) {
      setIpError("Invalid IP address");
    } else {
      setIpError("");
    }
    // Check if the port is valid
    const validPort: boolean = port >= 1024 && port <= 65535;
    if (!validPort) {
      setPortError("Invalid port");
    } else {
      setPortError("");
    }
    // Perform necessary actions with the valid IP and port values
    if (validIP && validPort) {
      console.log("IP:", host);
      console.log("Port:", port);
      if (
        endpoints.find(
          (endpoint) => endpoint.host === host && endpoint.port === port
        )
      ) {
        setIpError(
          "An endpoint with the specified ip and port pair already exists"
        );
        setPortError(" ");
        return;
      } else {
        // makePostRequest("/addEndpoint", {
        setEndpoints((endpoints) => [
          ...endpoints,
          {
            host,
            port,
          },
        ]);
      }
    }
  };
  return (
    <FormGroup
      style={{
        display: "flex",
        width: "100%",
      }}
    >
      <DeviceSwitch
        onChange={(e) => {
          setStream(e.target.checked);
        }}
        checked={stream}
        name='streamSwitch'
        text='Stream'
      />
      {stream ? (
        <>
          <Accordion
            style={{
              width: "100%",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='panel2a-content'
              id='panel2a-header'
            >
              <Typography fontWeight='800'>Stream Endpoints</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {endpoints.length === 0 ? <Typography fontWeight='500'>No stream endpoint added.</Typography> : undefined}
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  visibility: endpoints.length > 0 ? "visible" : "hidden",
                }}
              >
                <List dense={true}>
                  {endpoints.map((endpoint) => {
                    return (
                      <ListItem
                        key={`${endpoint.host}:${endpoint.port}`}
                        secondaryAction={
                          <IconButton
                            edge='end'
                            aria-label='delete'
                            onClick={() =>
                              setEndpoints((prevEndpoints) =>
                                prevEndpoints.filter(
                                  (e) =>
                                    `${e.host}:${e.port}` !==
                                    `${endpoint.host}:${endpoint.port}`
                                )
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <LinkedCameraIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`IP Address: ${endpoint.host}`}
                          secondary={`Port: ${endpoint.port}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </AccordionDetails>
          </Accordion>
          {/* Container for User Input and Interaction */}
          <div style={styles.cardContent.div}>
            {/* IP Address input */}
            <TextField
              sx={styles.textField}
              label='IP Address'
              variant='outlined'
              size='small'
              value={host}
              onChange={(e) => setHost(e.target.value)}
              error={!!ipError}
              helperText={ipError}
            />
            {/* Port Input */}
            <TextField
              sx={styles.portField}
              label='Port'
              variant='outlined'
              size='small'
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
              error={!!portError}
              helperText={portError}
              type='number'
              inputProps={{ min: 1024, max: 65535 }} // Specify minimum and maximum values
            />
            {/* Add Stream Endpoint Button */}
            <IconButton
              sx={{
                width: "40px",
                height: "40px",
                color: "white",
                marginLeft: "-10px",
              }}
              onClick={() => {
                handleAddEndpoint();
              }}
            >
              <AddIcon />
            </IconButton>
          </div>
          <Button
            color='grey'
            variant='contained'
            style={{
              marginTop: "20px",
            }}
          >
            Restart Stream
          </Button>
        </>
      ) : undefined}
    </FormGroup>
  );
};

interface CameraControlsProps {
  controls: Control[];
  devicePath: string;
}

const CameraControls: React.FC<CameraControlsProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { controls, devicePath } = props;
  const [controlsCollapsed, setControlsCollapsed] = useState(true);

  return (
    <>
      <div style={{ marginTop: "25px" }}>
        <span>Camera Controls</span>
        <IconButton onClick={() => setControlsCollapsed(!controlsCollapsed)}>
          {controlsCollapsed ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
        </IconButton>
        <Divider />
        <Collapse in={!controlsCollapsed}>
          <FormGroup style={{ marginTop: "25px" }}>
            {controls.map((control) => {
              switch (control.flags.type) {
                case controlType.INTEGER: {
                  const { name, id } = control;
                  const { min, max, step } = control.flags;
                  const defaultValue = control.value;
                  const [controlValue, setControlValue] = useState<number>(
                    defaultValue as number
                  );

                  // useEffect(() => {
                  //   makePostRequest("/setControl", {
                  //     devicePath,
                  //     id,
                  //     value: controlValue,
                  //   });
                  // }, [controlValue]);

                  return (
                    <>
                      <span>{name}</span>
                      <Slider
                        onChangeCommitted={(_, newValue) => {
                          setControlValue(newValue as number);
                        }}
                        name={`control-${id}`}
                        min={min}
                        max={max}
                        step={step}
                        defaultValue={defaultValue as number}
                        style={{
                          marginLeft: "20px",
                          width: "calc(100% - 25px)",
                        }}
                      />
                    </>
                  );
                }
                case controlType.BOOLEAN: {
                  let { name, id } = control;
                  const defaultValue = control.value === 1 ? true : false;
                  if (name.includes("White Balance")) {
                    name = "AI TrueColor Technology™";
                  }
                  const [controlValue, setControlValue] = useState<boolean>(
                    defaultValue as boolean
                  );

                  // useEffect(() => {
                  //   makePostRequest("/setControl", {
                  //     devicePath,
                  //     id,
                  //     value: controlValue ? 1 : 0,
                  //   });
                  // }, [controlValue]);

                  return (
                    <>
                      <span>{name}</span>
                      <Switch
                        onChange={(_, checked) => {
                          setControlValue(checked);
                        }}
                        name={`setDeviceNamecontrol-${id}`}
                        defaultChecked={defaultValue}
                      />
                    </>
                  );
                }
                case controlType.MENU: {
                  let { name, id } = control;
                  const { menu } = control.flags;
                  if (!menu) break;
                  const defaultValue = menu[control.value as number];
                  const [controlValue, setControlValue] = useState<
                    string | number
                  >(defaultValue as string);

                  // useEffect(() => {
                  //   makePostRequest("/setControl", {
                  //     devicePath,
                  //     id,
                  //     value: controlValue,
                  //   });
                  // }, [controlValue]);

                  return (
                    <>
                      <PopupState variant='popover' popupId={"" + id}>
                        {(popupState) => (
                          <>
                            <div>
                              <span>
                                {name}: {controlValue}
                              </span>
                              <IconButton {...bindTrigger(popupState)}>
                                <ArrowDropDownIcon />
                              </IconButton>
                            </div>
                            <Menu {...bindMenu(popupState)}>
                              {menu.map((item, _) => {
                                return (
                                  <MenuItem
                                    onClick={() => {
                                      setControlValue(item);
                                      popupState.close();
                                    }}
                                  >
                                    {item}
                                  </MenuItem>
                                );
                              })}
                            </Menu>
                          </>
                        )}
                      </PopupState>
                    </>
                  );
                }
              }
            })}
          </FormGroup>
        </Collapse>
      </div>
    </>
  );
};

const LineBreak: React.FC = () => {
  return <br></br>;
};

export interface DeviceCardProps {
  key: number;
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = (props) => {
  const controls = props.device.controls;
  console.log(controls);

  const deviceOptions = <DeviceOptions device={props.device} />;
  const deviceWarning = null;

  const cameraControls = (
    <CameraControls controls={controls} devicePath={props.device.info.path} />
  );

  return (
    <Grid
      item
      xs={12}
      lg={7}
      xl={6}
      flexWrap='wrap'
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Card sx={{ minWidth: 512, boxShadow: 3, textAlign: "left" }}>
        <CardHeader
          action={deviceWarning}
          title={props.device.info.name}
          subheader={
            <>
              {`Manufacturer: ${props.device.info.manufacturer}`}
              <LineBreak />
              {`Model: ${props.device.info.model}`}
              <LineBreak />
              {`USB ID: ${props.device.info.usbInfo}`}
              <LineBreak />
              <TextField
                sx={{ top: 10 }}
                onChange={(e) => {
                  props.device.info.name = e.target.value;
                  // setDevice(
                  //   props.device.stream.device_path,
                  //   props.device.info.name
                  // );
                  // makePostRequest("/setDeviceName", {
                  //   devicePath: props.device.stream.device_path,
                  //   name: e.target.value,
                  // });
                }}
                helperText='Device Nickname'
                placeholder='Device Nickname'
                variant='standard'
                defaultValue={""}
              ></TextField>
            </>
          }
        />
        <CardContent>
          {props.device.stream.device_path ? (
            <SupportingText>
              Device: {props.device.stream.device_path}
            </SupportingText>
          ) : (
            <></>
          )}
          {deviceOptions}
          <StreamOptions device={props.device} />
          {cameraControls}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default DeviceCard;
