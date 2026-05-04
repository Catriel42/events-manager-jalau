export type EventType = 'in_person' | 'virtual' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type OrganizerRole = 'owner' | 'co_host';
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meeting_url?: string;
  event_type: EventType;
  status: EventStatus;
  starts_at: Date;
  ends_at: Date;
  capacity?: number;
  banner_url?: string;
  calendar_uid: string;
  created_at: Date;
  updated_at: Date;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  waitlist_position?: number;
  token: string;
  registered_at: Date;
  cancelled_at?: Date;
}
