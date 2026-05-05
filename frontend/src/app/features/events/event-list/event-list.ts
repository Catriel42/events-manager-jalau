import { Component, inject, signal, OnInit } from '@angular/core';
import { EventsApi } from '@core/services/events-api';
import { Event } from '@shared/types/event.types';
import { EventCard } from '../event-card/event-card';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [EventCard],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css'
})
export class EventList implements OnInit {
  private eventsApi = inject(EventsApi);

  events = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  hasEvents = signal<boolean>(false);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents(page = 1) {
    this.isLoading.set(true);
    this.eventsApi.getEvents(page, 10).subscribe({
      next: (response) => {
        this.events.set(response.data);
        this.currentPage.set(response.meta.page);
        this.totalPages.set(response.meta.totalPages);
        this.hasEvents.set(response.data.length > 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.hasEvents.set(false);
        this.isLoading.set(false);
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.loadEvents(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.loadEvents(this.currentPage() - 1);
    }
  }
}