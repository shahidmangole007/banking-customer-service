import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudService {

    private storage: Storage;
    private bucketName = process.env.GCP_BUCKET_NAME || '';

    constructor() {
        this.storage = new Storage({
            projectId: process.env.GOOGLE_CLOUD_PROJECT,
        });
    }

    async upload(
        objectKey: string,
        buffer: Buffer,
        mimeType: string,
    ): Promise<void> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(objectKey);

            await file.save(buffer, {
                resumable: false,
                contentType: mimeType,
                metadata: {
                    cacheControl: 'private, max-age=0',
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to upload document to cloud storage',
            );
        }
    }


    async generateSignedUrl(objectKey: string): Promise<string> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(objectKey);

            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 5 * 60 * 1000, 
            
            });

            return url;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to generate signed URL',
            );
        }
    }



}
