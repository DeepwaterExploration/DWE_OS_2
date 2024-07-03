import { Button, TextField, Tooltip } from "@mui/material";
const styles = {
    textButtonContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
    },
    textInput: {
        width: "100%",
    },
    button: {
        width: "90px",
        height: "40px",
        color: "white",
        fontWeight: "bold",
    },
} as const;

interface TextInput_ButtonProps {
    textInputLabel: string;
    textInputValue: string;
    buttonLabel: string;
    tooltip?: string;
    textInputError?: boolean;
    buttonOnClick: () => void; // Function for Button's onClick event
    textFieldOnChange: (value: string) => void; // Function for TextField's onChange event
    children?: React.ReactNode; // Add children prop
}

const TextFieldButton: React.FC<TextInput_ButtonProps> = ({
    textInputLabel,
    textInputValue,
    buttonLabel,
    tooltip,
    textInputError,
    buttonOnClick,
    textFieldOnChange,
    children,
}) => {
    const handleTextFieldChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        textFieldOnChange(event.target.value);
    };

    return (
        <div style={styles.textButtonContainer}>
            <Tooltip title={tooltip} placement='bottom-end'>
                <TextField
                    sx={styles.textInput}
                    label={textInputLabel}
                    onChange={handleTextFieldChange}
                    value={textInputValue}
                    variant='outlined'
                    error={textInputError}
                    size='small'
                />
            </Tooltip>
            <Button sx={styles.button} variant='contained' onClick={buttonOnClick}>
                {buttonLabel}
            </Button>
            {children}
        </div>
    );
};

export default TextFieldButton;