import { Component, input, inject, signal, DestroyRef, Injector } from '@angular/core';
import { RouterModule } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, tap } from 'rxjs';
import { EventsApi } from '@core/services/events-api';
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
  private injector = inject(Injector);

  id = input.required<string>();

  event = signal<Event | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    toObservable(this.id, { injector: this.injector }).pipe(
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((id) => this.eventsApi.getEvent(id).pipe(
        catchError((err) => {
          this.error.set('Error al cargar el evento');
          return of(null);
        })
      )),
      tap({ next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
      }})
    ).subscribe();
  }

  getEventTypeLabel(type: EventType): string {
    const labels: Record<EventType, string> = {
      in_person: 'Presencial',
      virtual: 'Virtual',
      hybrid: 'Híbrido'
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
      draft: 'Borrador',
      published: 'New',
      cancelled: 'Cancelado',
      completed: 'Completado'
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
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  formatTimeRange(starts: string, ends: string): string {
    const startDate = new Date(starts);
    const endDate = new Date(ends);
    
    const timeFormat = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${timeFormat.format(startDate)} - ${timeFormat.format(endDate)}`;
  }
}