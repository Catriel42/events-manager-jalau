import { Injectable, inject } from '@angular/core';
import { EventsApi } from './events-api';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private eventsApi = inject(EventsApi);
  
  syncEventToCalendar(eventId: string): Observable<{ url: string }> {
    return this.eventsApi.syncCalendar(eventId).pipe(
      tap(res => {
        if (res.url) {
          window.open(res.url, '_blank');
        }
      })
    );
  }
}