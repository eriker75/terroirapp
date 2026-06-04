import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getBcvRateRequest, type BcvRateResponse } from '@/requests/bcv/bcv.requests';
import { QUERY_KEYS } from '@/config/queryKeys';

export function useBcvRateQuery() {
  return useQuery<BcvRateResponse, AxiosError>({
    queryKey: QUERY_KEYS.BCV.RATE(),
    queryFn: getBcvRateRequest,
    staleTime: 1000 * 60 * 15, // la tasa cambia a lo sumo una vez al día
  });
}
