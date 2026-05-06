import { Injectable } from '@angular/core';
import { EventsApi } from './events-api';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(private eventsApi: EventsApi) {}

  syncEventToCalendar(eventId: string) {
    return this.eventsApi.syncCalendar(eventId).pipe(
      tap((res) => {
        if (res && res.url) {
          window.open(res.url, '_blank');
        }
      })
    );
  }
}