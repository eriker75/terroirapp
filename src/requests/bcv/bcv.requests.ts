import { api } from '@/config/api';

export interface BcvRateResponse {
  rate: number;
  source?: string;
  updatedAt?: string;
}

// Tasa BCV vigente (pública) para mostrar montos en Bs en el checkout. El backend
// es la fuente autoritativa; aquí solo se usa para previsualizar.
export const getBcvRateRequest = (): Promise<BcvRateResponse> =>
  api.get<BcvRateResponse>('/bcv-rate').then((r) => r.data);
