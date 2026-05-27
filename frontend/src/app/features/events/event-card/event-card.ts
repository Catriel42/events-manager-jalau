import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Event, EventType, EventStatus } from '@shared/types/event.types';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCard {
  event = input.required<Event>();

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
      published: 'Upcoming',
      cancelled: 'Cancelled',
      completed: 'Finished'
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
