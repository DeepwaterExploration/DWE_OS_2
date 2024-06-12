import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

import { getVideos , videoProxy } from "./api";
import { CameraIdentifier, FileInfo, FilesJson } from "./types";


interface viewerProps {
    videoList: FilesJson;
    setSelected: (value: string | undefined) => void;
}
const ExplorerView: React.FC<viewerProps> = (props) => {
    const columns = [
        {
            field: "path",
            headerName: "Name",
            valueGetter: (col: string) => col.split("/").at(-1),
            flex: 1,
        },
        {
            field: "camera",
            headerName: "Camera",
            valueGetter: (col: CameraIdentifier) => col.id,
            flex: 1,
        },
    ];
    return (
        <div style={{ width: "60%", height: "100%" }}>
            <DataGrid
                rows={props.videoList as FileInfo[]}
                columns={columns}
                getRowId={(x) => x.path}
                sx={{ height: "100%" }}
                disableMultipleRowSelection
                checkboxSelection
                onRowSelectionModelChange={(rows) => {
                    props.setSelected(rows[0] as string);
                }}
            />
        </div>
    );
};
interface previewProps {
    video: string | undefined;
    videoList: FilesJson;
    theme: string;
}
const Preview: React.FC<previewProps> = (props) => {
    const video = props.videoList.find((o) => o.path === props.video);

    return (
        <div style={{ width: "40%", height: "100%" }}>
            {props.video && video ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                    }}
                >
                    <video controls width='80%' src={videoProxy(video.path)}>
                        <source src={videoProxy(video.path)} />
                    </video>
                    <Typography
                        fontWeight='800'
                        style={{
                            width: "100%",
                            textAlign: "center",
                            padding: "25px",
                            fontSize: "30px",
                            color: props.theme === "light" ? "black" : "white",
                        }}
                    >
                        {video.path.split("/").at(-1)}
                        {video.path.endsWith(".avi") ? (
                            <sub>
                                <br />
                                &#9888;Cannot play AVI files in browser
                            </sub>
                        ) : undefined}
                    </Typography>

                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Path</TableCell>
                                <TableCell>
                                    <a href={"file://///" + video.path}>
                                        {video.path}
                                    </a>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Created</TableCell>
                                <TableCell>{video.humanReadableDate}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Camera Model</TableCell>
                                <TableCell>{video.camera.model}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Camera Name</TableCell>
                                <TableCell>{video.camera.nickname}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Camera ID</TableCell>
                                <TableCell>{video.camera.id}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            ) : undefined}
        </div>
    );
};

const Files: React.FC = () => {
    const [videoList, setVideoList] = useState<FilesJson>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | undefined>(
        undefined
    );
    const getTheme = () =>
        localStorage.getItem("theme") !== null
            ? (localStorage.getItem("theme") as string)
            : "dark";
    const [theme, setTheme] = useState<string>(getTheme);
    useEffect(() => {
        getVideos().then((videos: FilesJson) => {
            setVideoList(videos);
        });
    }, []);
    window.addEventListener("themechanged", () => {
        setTimeout(() => setTheme(getTheme()), 0);
    });
    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            <ExplorerView
                videoList={videoList}
                setSelected={setSelectedVideo}
            />
            <Preview
                videoList={videoList}
                video={selectedVideo}
                theme={theme}
            />
        </div>
    );
};

export default Files;
