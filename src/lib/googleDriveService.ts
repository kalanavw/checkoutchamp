
import { getAuth } from 'firebase/auth';
import { db, storage } from './firebase';

export interface DriveUploadOptions {
  folderId?: string;
  fileName?: string;
  mimeType?: string;
  onProgress?: (progress: number) => void;
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private apiKey: string;
  private discoveryDocs: string[];
  private clientId: string;
  private scope: string;
  private tokenClient: any;
  private isInitialized: boolean = false;
  private accessToken: string | null = null;

  private constructor() {
    // Google Drive API Configuration
    this.apiKey = 'AIzaSyA_ReJ3a7qewp89vsp8-MpN_tfWI8oRUtI'; // Same as Firebase API key
    this.discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
    this.clientId = '274289865490-v9gnjr98qkbf2nj5qk4rb3tck1f0mkfd.apps.googleusercontent.com'; // Firebase clientId
    this.scope = 'https://www.googleapis.com/auth/drive.file';
  }

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: this.discoveryDocs,
            });

            // Load the Auth2 library
            const authScript = document.createElement('script');
            authScript.src = 'https://accounts.google.com/gsi/client';
            authScript.onload = () => {
              this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope: this.scope,
                callback: (tokenResponse: any) => {
                  if (tokenResponse && tokenResponse.access_token) {
                    this.accessToken = tokenResponse.access_token;
                  }
                  this.isInitialized = true;
                  resolve(true);
                },
              });
              // Initial check is complete
              this.isInitialized = true;
              resolve(true);
            };
            document.body.appendChild(authScript);
          } catch (error) {
            console.error('Error initializing Google Drive API', error);
            resolve(false);
          }
        });
      };
      document.body.appendChild(script);
    });
  }

  public async authenticate(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise<boolean>((resolve) => {
      // Check if user is already authenticated with Firebase
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error('User must be authenticated with Firebase first');
        resolve(false);
        return;
      }

      // Request access token
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
      
      // We'll resolve from the callback when token is received
      const checkToken = setInterval(() => {
        if (this.accessToken) {
          clearInterval(checkToken);
          resolve(true);
        }
      }, 500);
    });
  }

  public async uploadFile(
    file: File,
    options: DriveUploadOptions = {}
  ): Promise<string | null> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) return null;
    }

    const metadata = {
      name: options.fileName || file.name,
      mimeType: options.mimeType || file.type,
      parents: options.folderId ? [options.folderId] : [],
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    try {
      // Upload to Google Drive
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      const result = await response.json();
      
      if (result.id) {
        // Make the file publicly accessible
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'reader',
              type: 'anyone',
            }),
          }
        );

        // Get file's webViewLink
        const fileResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        const fileData = await fileResponse.json();
        return fileData.webViewLink;
      }
      return null;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      return null;
    }
  }

  // Hybrid approach - fallback to Firebase Storage if Google Drive fails
  public async uploadWithFallback(
    file: File,
    storagePath: string,
    options: DriveUploadOptions = {}
  ): Promise<string | null> {
    try {
      // Try Google Drive first
      const driveUrl = await this.uploadFile(file, options);
      if (driveUrl) return driveUrl;

      // Fallback to Firebase Storage
      console.log("Falling back to Firebase Storage");
      return this.uploadToFirebaseStorage(file, storagePath);
    } catch (error) {
      console.error('Error in upload with fallback:', error);
      // Final fallback to Firebase Storage
      return this.uploadToFirebaseStorage(file, storagePath);
    }
  }

  private async uploadToFirebaseStorage(file: File, storagePath: string): Promise<string | null> {
    try {
      // Use existing Firebase Storage upload logic
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error('Error uploading to Firebase Storage:', error);
      return null;
    }
  }
}

// Create a simplified hook for components to use
export const useGoogleDrive = () => {
  const driveService = GoogleDriveService.getInstance();
  
  const uploadImage = async (
    file: File, 
    type: 'product' | 'user' | 'business', 
    id?: string
  ): Promise<string | null> => {
    // Initialize if needed
    if (!driveService.isInitialized) {
      await driveService.initialize();
    }
    
    const timestamp = Date.now();
    const fileName = `${type}-${id || timestamp}-${file.name}`;
    const storagePath = `${type}-images/${fileName}`;
    
    // Get folder ID based on type (you would configure these folder IDs)
    const folderMap: Record<string, string> = {
      'product': 'your-drive-product-folder-id', // Replace with actual folder IDs
      'user': 'your-drive-user-folder-id',
      'business': 'your-drive-business-folder-id',
    };
    
    return driveService.uploadWithFallback(file, storagePath, {
      folderId: folderMap[type],
      fileName
    });
  };
  
  return { uploadImage, initialize: driveService.initialize };
};
