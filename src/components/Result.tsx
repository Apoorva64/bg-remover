"use client";
import React from "react";
import Container from '@mui/material/Container';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

export default function Result(
    props: { images: string[] }
) {


    return (

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
            {
                <ImageList variant="masonry" cols={3} gap={8}>
                    {props.images.map((item, index) => (
                        <ImageListItem key={index}>
                            <img
                                key={index}
                                src={
                                    `data:image/png;base64,${item}`
                                }
                                alt={`Image ${index}`}

                                style={{cursor: "pointer"}}
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `data:image/png;base64,${item}`;
                                    link.download = `image-${index}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}

                            />
                        </ImageListItem>
                    ))}
                </ImageList>

            }
        </Container>

    );
}