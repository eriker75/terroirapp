import { api } from '@/config/api';
import type { GetTagsQueryDto } from '@/dtos/tags/tags.request.dto';
import type { TagsResponseDto, TagResponseDto } from '@/dtos/tags/tags.response.dto';

export const getTagsRequest = (query?: GetTagsQueryDto): Promise<TagsResponseDto> =>
  api.get<TagsResponseDto>('/tags', { params: query }).then((r) => r.data);

export const getTagByIdRequest = (id: string): Promise<TagResponseDto> =>
  api.get<TagResponseDto>(`/tags/${id}`).then((r) => r.data);
