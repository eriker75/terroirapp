import { api } from '@/config/api';

export interface UploadResult {
  /** Ruta/URL devuelta por el backend (p.ej. /uploads/abc.jpg o https://…). */
  url: string;
}

export interface UploadFileInput {
  uri: string;
  name: string;
  type: string; // mime, p.ej. image/jpeg
}

// POST /api/files/upload (multipart, campo "file"). El interceptor adjunta el token.
export const uploadImageRequest = (file: UploadFileInput): Promise<UploadResult> => {
  const form = new FormData();
  // En React Native el "archivo" de FormData es { uri, name, type }.
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  return api
    .post<UploadResult>('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
