import { Injectable, inject } from '@angular/core';
import { Event } from '@shared/types/event.types';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  
  addToGoogleCalendar(event: Event): void {
    const startDate = new Date(event.starts_at);
    const endDate = new Date(event.ends_at);

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', event.title);
    url.searchParams.set('dates', `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    if (event.location) {
      url.searchParams.set('location', event.location);
    }
    if (event.description) {
      url.searchParams.set('details', event.description);
    }

    window.open(url.toString(), '_blank');
  }

  addToOutlookCalendar(event: Event): void {
    const startDate = new Date(event.starts_at);
    const endDate = new Date(event.ends_at);

    const formatOutlookDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    url.searchParams.set('subject', event.title);
    url.searchParams.set('startdt', formatOutlookDate(startDate));
    url.searchParams.set('enddt', formatOutlookDate(endDate));
    if (event.location) {
      url.searchParams.set('location', event.location);
    }
    if (event.description) {
      url.searchParams.set('body', event.description);
    }

    window.open(url.toString(), '_blank');
  }
}