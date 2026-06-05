import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createContactMessageRequest,
  type CreateContactMessageDto,
  type ContactMessage,
} from '@/requests/contact/contact.requests';

// Envía el mensaje del formulario de contacto al backend (público).
export function useCreateContactMessageMutation() {
  return useMutation<ContactMessage, AxiosError, CreateContactMessageDto>({
    mutationFn: createContactMessageRequest,
  });
}
