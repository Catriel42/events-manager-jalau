import { Component, input, inject, signal, DestroyRef, Injector } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, tap } from 'rxjs';
import { EventsApi, Registration } from '@core/services/events-api';
import { AuthService } from '@core/services/auth.service';
import { CalendarService } from '@core/services/calendar.service';
import { Event, Tag, EventType, EventStatus } from '@shared/types/event.types';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail {
  private eventsApi = inject(EventsApi);
  private authService = inject(AuthService);
  private calendarService = inject(CalendarService);
  private router = inject(Router);
  private injector = inject(Injector);

  id = input.required<string>();

  event = signal<Event | null>(null);
  registration = signal<Registration | null>(null);
  isLoading = signal<boolean>(true);
  isRegistering = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    toObservable(this.id, { injector: this.injector }).pipe(
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
        this.registration.set(null);
      }),
      switchMap((id) => this.eventsApi.getEvent(id).pipe(
        catchError((err) => {
          this.error.set('Error loading the event');
          return of(null);
        })
      )),
      tap({ next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
        if (event && this.authService.isAuthenticated()) {
          this.checkRegistration(this.id());
        }
      }})
    ).subscribe();
  }

  checkRegistration(eventId: string) {
    this.eventsApi.getMyRegistration(eventId).subscribe({
      next: (reg) => this.registration.set(reg),
      error: () => this.registration.set(null)
    });
  }

  onRegister() {
    if (!this.authService.isAuthenticated()) {
      this.authService.setPendingEventId(this.id());
      this.router.navigate(['/auth/login']);
      return;
    }

    const eventId = this.id();
    this.isRegistering.set(true);

    this.eventsApi.registerToEvent(eventId).subscribe({
      next: (reg) => {
        this.registration.set(reg);
        this.isRegistering.set(false);
      },
      error: () => {
        this.isRegistering.set(false);
      }
    });
  }

  onUnregister() {
    const eventId = this.id();
    this.isRegistering.set(true);

    this.eventsApi.unregisterFromEvent(eventId).subscribe({
      next: () => {
        this.registration.set(null);
        this.isRegistering.set(false);
      },
      error: () => {
        this.isRegistering.set(false);
      }
    });
  }

  addToGoogleCalendar() {
    const event = this.event();
    if (!event) return;
    this.calendarService.addToGoogleCalendar(event);
  }

  addToOutlookCalendar() {
    const event = this.event();
    if (!event) return;
    this.calendarService.addToOutlookCalendar(event);
  }

  getUserProvider(): string {
    return this.authService.currentUser()?.provider || 'google';
  }

  getEventTypeLabel(type: EventType): string {
    const labels: Record<EventType, string> = {
      in_person: 'In Person',
      virtual: 'Virtual',
      hybrid: 'Hybrid'
    };
    return labels[type];
  }

  getEventTypeClass(type: EventType): string {
    const classes: Record<EventType, string> = {
      in_person: 'bg-type-in_person',
      virtual: 'bg-type-virtual',
      hybrid: 'bg-type-hybrid'
    };
    return classes[type];
  }

  getEventStatusLabel(status: EventStatus): string {
    const labels: Record<EventStatus, string> = {
      draft: 'Draft',
      published: 'New',
      cancelled: 'Cancelled',
      completed: 'Completed'
    };
    return labels[status];
  }

  getEventStatusClass(status: EventStatus): string {
    const classes: Record<EventStatus, string> = {
      draft: 'bg-status-draft',
      published: 'bg-status-published',
      cancelled: 'bg-status-cancelled',
      completed: 'bg-status-completed'
    };
    return classes[status];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  formatTimeRange(starts: string, ends: string): string {
    const startDate = new Date(starts);
    const endDate = new Date(ends);
    
    const timeFormat = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${timeFormat.format(startDate)} - ${timeFormat.format(endDate)}`;
  }
}