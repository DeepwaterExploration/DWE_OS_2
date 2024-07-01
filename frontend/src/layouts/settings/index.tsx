import { Card, CardContent, Grid, Typography } from "@mui/material"
import TextFieldButton from "./textFieldButton";
import { useState } from "react";

const Settings: React.FC = () => {

    const [defualtPath, setDefaultPath] = useState("");
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
            <Card
                sx={{
                    width: "512px",
                    boxShadow: 3,
                    textAlign: "left",
                    margin: "20px",
                    padding: "15px",
                }}
            >
                <CardContent>
                    <Typography
                        sx={{ fontWeight: "bold", }}
                        variant='h6'
                        color='textPrimary'
                    >
                        Defaults
                    </Typography>
                </CardContent>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "start",
                    gap: "20px",

                    marginLeft: "20px",
                    marginRight: "20px",
                    marginBottom: "20px",
                }}>
                    <TextFieldButton
                        textInputLabel={"Default Path"}
                        textInputValue={""}
                        buttonLabel={"Save"}
                        buttonOnClick={() => { }}
                        textFieldOnChange={() => { }}
                    />
                </div>
            </Card>
        </Grid>)
}

export default Settings;