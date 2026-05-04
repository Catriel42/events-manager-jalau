/**
 * Shared type definitions used by both frontend and backend.
 * These interfaces define the data contracts between the API and the UI.
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  meetingUrl: string | null;
  eventType: 'in_person' | 'virtual' | 'hybrid';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
