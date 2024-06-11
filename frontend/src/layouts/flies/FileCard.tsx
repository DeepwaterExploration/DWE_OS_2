import { Accordion, AccordionDetails, AccordionSummary, Card, CardHeader, Table, TableBody, TableCell, TableRow } from "@mui/material"
import { FileInfo } from "./types"
import { videoProxy } from "./api";

interface filePropsInterface {
    file: FileInfo
}

const FileCard: React.FC<filePropsInterface> = (props) => {
    const file = props.file;
    return (
        <Card
            sx={{
                minWidth: 512,
                boxShadow: 3,
                textAlign: "left",
                margin: "20px",
                padding: "15px",
            }}
        >
            <CardHeader
                title={file.path.split("/").at(-1)}
                sx={{ paddingBottom: "0px" }}
            />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <video controls={true} width="512px">
                    <source src={videoProxy(file.path)} />
                </video>
                <Accordion>
                    <AccordionSummary>
                        Video Info
                    </AccordionSummary>
                    <AccordionDetails>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Path</TableCell>
                                    <TableCell><a href={"file:///" + file.path}>{file.path}</a></TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>Created</TableCell>
                                    <TableCell>{file.humanReadableDate}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>Camera Model</TableCell>
                                    <TableCell>{file.camera.model}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Camera Name</TableCell>
                                    <TableCell>{file.camera.nickname}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>

                    </AccordionDetails>
                </Accordion>
            </div>
        </Card>

    )
}
export default FileCard;