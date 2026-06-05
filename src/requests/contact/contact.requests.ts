import { api } from '@/config/api';

// Mensaje del formulario público de contacto. El backend (POST /api/contact) crea
// el ContactMessage y vincula/crea el Contact por email (mismo flujo que la web);
// la IP se deriva en el servidor. `subject` es opcional.
export interface CreateContactMessageDto {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Público: la baseURL del cliente ya incluye `/api`, por eso el path es `/contact`.
export const createContactMessageRequest = (
  dto: CreateContactMessageDto,
): Promise<ContactMessage> =>
  api.post<ContactMessage>('/contact', dto).then((r) => r.data);
