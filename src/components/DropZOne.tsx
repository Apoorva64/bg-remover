// Importez les modules nécessaires
import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {Paper} from "@mui/material";
import Typography from "@mui/material/Typography";


// Composant Dropzone
const ImageDropzone = ({
                           onDrop
                       }: {
                           onDrop: (acceptedFiles: File[]) => void;

                       }
) => {

    const onDropHandler = useCallback(
        (acceptedFiles: File[]) => {
            if (onDrop) {
                onDrop(acceptedFiles);
            }
        },
        [onDrop]
    );

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop: onDropHandler,
    });

    return (
        <Paper
            {...getRootProps()}
            sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                border: 1,
                borderColor: "primary.main",
                borderStyle: "dashed",
                borderRadius: 1,
                cursor: "pointer",
                backgroundColor: "background.default",
                width: "100%",
                height: "100%",
                maxHeight: 400,
            }}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <Typography variant="h6">Drop file to remove background</Typography>
            ) : (
                // eslint-disable-next-line react/no-unescaped-entities
                <Typography variant="h6">Drag 'n' drop file to remove background</Typography>
            )}
        </Paper>
    );
};

export default ImageDropzone;
