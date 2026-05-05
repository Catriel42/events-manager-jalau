export type EventType = 'in_person' | 'virtual' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meeting_url?: string;
  event_type: EventType;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  banner_url?: string;
  calendar_uid: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}