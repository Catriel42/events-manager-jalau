import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface GlobalRegistration {
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
  event: {
    id: string;
    title: string;
    starts_at: string;
    event_type: string;
  };
}

@Injectable({ providedIn: 'root' })
export class GlobalRegistrationsApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/registrations`;

  getAllRegistrations(): Observable<GlobalRegistration[]> {
    return this.http.get<GlobalRegistration[]>(this.baseUrl);
  }

  updateStatus(id: string, status: 'confirmed' | 'waitlisted' | 'cancelled'): Observable<GlobalRegistration> {
    return this.http.patch<GlobalRegistration>(`${this.baseUrl}/${id}/status`, { status });
  }

  deleteRegistration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
