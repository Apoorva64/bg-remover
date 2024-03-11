"use client";
import * as React from 'react';
import {useState} from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ImageDropzone from '@/components/DropZOne';
import Result from "@/components/Result";
import Paper from "@mui/material/Paper";
import Spinner from "@mui/material/CircularProgress";

export const dynamic = 'force-dynamic' // defaults to auto
export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    return (
        <Container maxWidth="lg"

                   sx={{
                       display: 'flex',
                       flexDirection: 'column',
                       justifyContent: 'start',
                       alignItems: 'center',
                       width: '100vw',
                       height: '100vh',
                       p: 4,
                   }}
        > <Paper
            elevation={3}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                p: 4,
            }}
        >

            <Typography variant="h2" sx={{mb: 5}}>
                Background Removal
            </Typography>

            <Container maxWidth="sm"
                       sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           justifyContent: 'center',
                           alignItems: 'center',
                           width: '100%',
                           height: '100%',
                       }}
            >


                {!isLoading ? (


                    <ImageDropzone onDrop={
                        async (acceptedFiles: File[]) => {
                            setIsLoading(true);
                            const formData = new FormData();
                            for (const file of acceptedFiles) {
                                formData.append('files', file);
                            }
                            const base64Images = await fetch('/api/upload/bgremove', {
                                method: 'POST',
                                body: formData,
                            });

                            // redirect to the result page
                            const data = await base64Images.json();
                            setImages(data.images);
                            setIsLoading(false);
                        }
                    }/>
                ) : (
                    <Spinner/>
                )}


            </Container>
            {images.length > 0 && (
                <Box sx={{mb: 2}}>
                    <Result images={images}/>
                </Box>
            )}
        </Paper>

        </Container>
    );
}

