import { Grid } from "@mui/material"
import { useEffect, useState } from "react";
import { FilesJson } from "./types";
import { getVideos } from "./api";
import FileCard from "./FileCard";

const Files: React.FC = () => {
    const [videoList, setVideoList] = useState<FilesJson>([])
    useEffect(() => {
        getVideos().then((videos: FilesJson) => {
            setVideoList(videos);
        });

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
            {videoList.map((file) => <FileCard file={file} key={file.path} />)}
        </Grid>
    )
}

export default Files;