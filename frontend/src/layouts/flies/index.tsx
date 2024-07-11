import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

import { deleteFile, getVideos, videoProxy } from "./api";
import { CameraIdentifier, FileInfo, FilesJson } from "./types";
import { Delete } from "@mui/icons-material";


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
    updatelist: [FilesJson, (arg0: FilesJson) => void];
}
const Preview: React.FC<previewProps> = (props) => {
    const video = props.videoList.find((o) => o.path === props.video);

    function downloadFile(path: string) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', videoProxy(path), true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement('a');
            tag.href = imageUrl;
            tag.target = '_blank';
            tag.download = (path.split("/").at(-1)) ?? "download.mp4";
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        };
        xhr.onerror = err => {
            alert('Failed to download picture');
        };
        xhr.send();
    }
    return (
        <div style={{ width: "40%", height: "100%" }}>
            {props.video && video ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        rowGap: "10px"
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
                    <Button
                        onClick={() => downloadFile(video.path)}
                    >
                        Download
                    </Button>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Path</TableCell>
                                <TableCell>

                                    {video.path}

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
                    <Button
                        sx={{
                            width: "90%",
                            margin: "0px"
                        }}
                        variant="contained"
                        color="error"
                        onClick={() => {
                            const name = video.path.split("/").at(-1)!;
                            deleteFile(name).then(() => {
                                var videos = structuredClone(props.updatelist[0]);
                                videos = videos.filter((a) => a.path != video.path);
                                props.updatelist[1](videos);
                            })
                        }}
                    >
                        <Delete />
                        Delete
                    </Button>
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
                updatelist={[videoList, setVideoList]}
            />
        </div>
    );
};

export default Files;
