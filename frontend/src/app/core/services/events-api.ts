import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, PaginatedResponse } from '@shared/types/event.types';
import { environment } from '@env/environment';

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  waitlist_position?: number | null;
  registered_at: string;
}

export interface RegistrationWithUser {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  waitlist_position?: number | null;
  registered_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class EventsApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/events`;

  getEvents(page = 1, limit = 10, includeAll = false): Observable<PaginatedResponse<Event>> {
    return this.http.get<PaginatedResponse<Event>>(this.baseUrl, {
      params: { page, limit, includeAll: includeAll ? 'true' : 'false' }
    });
  }

  getAllEvents(page = 1, limit = 100): Observable<PaginatedResponse<Event>> {
    return this.getEvents(page, limit, true);
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, event);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/${id}`, event);
  }

  syncCalendar(id: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.baseUrl}/${id}/sync-calendar`, {});
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  registerToEvent(eventId: string): Observable<Registration> {
    return this.http.post<Registration>(`${this.baseUrl}/${eventId}/registrations`, {});
  }

  getMyRegistration(eventId: string): Observable<Registration | null> {
    return this.http.get<Registration | null>(`${this.baseUrl}/${eventId}/registrations`);
  }

  unregisterFromEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${eventId}/registrations`);
  }

  getEventRegistrations(eventId: string): Observable<RegistrationWithUser[]> {
    return this.http.get<RegistrationWithUser[]>(`${this.baseUrl}/${eventId}/registrations/all`);
  }
}