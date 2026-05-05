import { EventType, EventStatus } from '@prisma/client';

export class TagResponseDto {
  id?: string;
  name?: string;
  slug?: string;
}

export class EventResponseDto {
  id?: string;
  title?: string;
  description?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  event_type?: EventType;
  status?: EventStatus;
  starts_at?: Date;
  ends_at?: Date;
  capacity?: number | null;
  banner_url?: string | null;
  calendar_uid?: string;
  created_at?: Date;
  updated_at?: Date;
  tags?: TagResponseDto[];
}

export class PaginatedEventsDto {
  data?: EventResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
