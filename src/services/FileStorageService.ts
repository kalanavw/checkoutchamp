import {storage} from "@/lib/firebase";
import {getDownloadURL, ref, uploadBytesResumable} from 'firebase/storage';

export class FileStorageService {
    async uploadImage(file: File, baseFolder: string = 'images'): Promise<string> {
        return await this.resizeAndUploadImage(file, "uploads" + "/" + baseFolder);
    }

    private async resizeAndUploadImage(file: File, baseFolder: string): Promise<string> {
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            const maxSize: number = 800
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const img = new Image();
                img.src = e.target?.result as string;

                img.onload = async () => {
                    // Resize image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d')!;
                    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                    const width = img.width * ratio;
                    const height = img.height * ratio;

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas to blob
                    canvas.toBlob(async (blob) => {
                        if (!blob) {
                            reject('Error converting canvas to blob');
                            return;
                        }

                        // Upload resized image to Firebase Storage
                        // const fileRef = storage.ref().child(`${baseFolder}/${file.name}`);
                        const fileRef = ref(storage, `${baseFolder}/${file.name}`);
                        const uploadTask = uploadBytesResumable(fileRef, blob);
                        uploadTask.on(
                            'state_changed',
                            (snapshot) => {
                                // You can track the progress here if needed
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log(`Upload is ${progress}% done`);
                            },
                            (error) => {
                                reject(error); // Handle errors during upload
                            },
                            async () => {
                                // When upload is complete, get the download URL
                                try {
                                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                    resolve(downloadURL); // Resolve the promise with the URL
                                } catch (error) {
                                    reject(error);
                                }
                            }
                        );
                    }, 'image/jpeg', 0.85); // 85% quality
                };
            };

            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }
}

export const fileStorageService = new FileStorageService();