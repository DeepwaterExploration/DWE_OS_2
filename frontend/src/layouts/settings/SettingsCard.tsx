// const VideoCard: React.FC<VideoCardProps> = ({

import { Card, CardContent, Typography } from "@mui/material";
import { PropsWithChildren } from "react";
const styles = {
    card: {
        margin: "15px",
        height: "100%",
        width: "450px",
    },
    cardContent: {
        cardTitle: {
            fontWeight: "bold",
        },
    },
    select: {
        color: "white",
    },
    options: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "start",
        gap: "20px",

        marginLeft: "20px",
        marginRight: "20px",
        marginBottom: "20px",
    },
} as const;
interface SettingsCardProps extends PropsWithChildren {
    cardTitle: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ cardTitle, children }) => {
    return (
        <Card raised sx={styles.card}>
            <CardContent sx={styles.cardContent}>
                <Typography
                    sx={styles.cardContent.cardTitle}
                    variant='h6'
                    color='textPrimary'
                >
                    {cardTitle}
                </Typography>
            </CardContent>
            <div style={styles.options}>{children}</div>
        </Card>
    );
};

export default SettingsCard;

