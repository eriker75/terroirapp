import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getTagsRequest, getTagByIdRequest } from '@/requests/tags/tags.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { GetTagsQueryDto } from '@/dtos/tags/tags.request.dto';
import type { TagsResponseDto, TagResponseDto } from '@/dtos/tags/tags.response.dto';

export function useTagsQuery(query?: GetTagsQueryDto) {
  return useQuery<TagsResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.TAGS.LIST(query),
    queryFn: () => getTagsRequest(query),
  });
}

export function useTagQuery(id: string) {
  return useQuery<TagResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.TAGS.DETAIL(id),
    queryFn: () => getTagByIdRequest(id),
    enabled: !!id,
  });
}
