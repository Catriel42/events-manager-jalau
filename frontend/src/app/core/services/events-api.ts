import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, PaginatedResponse } from '@shared/types/event.types';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class EventsApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/events`;

  getEvents(page = 1, limit = 10): Observable<PaginatedResponse<Event>> {
    return this.http.get<PaginatedResponse<Event>>(this.baseUrl, {
      params: { page, limit }
    });
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

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}