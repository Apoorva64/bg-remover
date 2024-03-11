import {NextRequest, NextResponse} from 'next/server';
import * as fs from "fs";

export const dynamic = 'force-dynamic' // defaults to auto

async function base64_encode(file: File) {
    const buffer = await file.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}
export async function POST(req: NextRequest) {
    const formData = await req.formData();

    // Remember to enforce type here and after use some lib like zod.js to check it
    const files = formData.getAll('files') as File[];


    // check if files are images
    const images = files.filter(file => file.type.startsWith('image/'));
    if (images.length !== files.length) {
        return NextResponse.json({message: 'Only images are allowed'}, {status: 400});
    }

    //  call API to remove background
    const bgRemoveAPI = 'https://ray-serve.ray.apoorva64.com/api/v2/bg_remover';
    const base64Images = await Promise.all(images.map(base64_encode));
    const imagesRM = base64Images.map(async (base64Image) => {
            const response = await fetch(bgRemoveAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({image: base64Image}),
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.image;
        }
    );

    const imagesRMData = await Promise.all(imagesRM);

    // return the images
    return NextResponse.json({images: imagesRMData});


}

