import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  uploadImageRequest,
  type UploadFileInput,
  type UploadResult,
} from '@/requests/files/files.requests';

export function useUploadImageMutation() {
  return useMutation<UploadResult, AxiosError, UploadFileInput>({
    mutationFn: uploadImageRequest,
  });
}
