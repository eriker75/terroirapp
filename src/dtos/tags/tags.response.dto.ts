import type { Tag } from '@/types/tag.types';
import type { PaginatedResponse } from '@/types/api.types';

export type TagResponseDto = Tag;
export type TagsResponseDto = PaginatedResponse<Tag>;
