import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In with Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ==========================================
// Google Drive API REST Integrations
// ==========================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

// 1. List Files in Google Drive
export const listDriveFiles = async (token: string, searchQuery: string = ''): Promise<DriveFile[]> => {
  try {
    let q = "trashed = false";
    if (searchQuery.trim()) {
      q += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,size,webViewLink,iconLink,thumbnailLink,createdTime,modifiedTime)&pageSize=25&orderBy=modifiedTime desc`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Drive API Error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list Drive files:', error);
    throw error;
  }
};

// 2. Upload JSON / Text Content File to Google Drive
export const uploadTextToDrive = async (
  token: string, 
  fileName: string, 
  content: string, 
  mimeType: string = 'application/json'
): Promise<DriveFile> => {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${err}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw error;
  }
};

// 3. Upload Raw File (Binary / Blob) to Google Drive
export const uploadFileBlobToDrive = async (
  token: string,
  file: File
): Promise<DriveFile> => {
  try {
    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`File upload failed: ${res.status} - ${err}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
};

// 4. Delete File from Google Drive (with explicit confirmation mandate)
export const deleteDriveFile = async (token: string, fileId: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Delete failed with status ${res.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete Drive file:', error);
    throw error;
  }
};

// 5. Get Google Drive About Info (Storage quota)
export const getDriveQuota = async (token: string): Promise<{ limit: string; usage: string }> => {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return { limit: '0', usage: '0' };
    const data = await res.json();
    return {
      limit: data.storageQuota?.limit || '0',
      usage: data.storageQuota?.usage || '0'
    };
  } catch {
    return { limit: '0', usage: '0' };
  }
};
