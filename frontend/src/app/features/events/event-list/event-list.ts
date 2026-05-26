import { Component, inject, signal, input, computed, OnInit } from '@angular/core';
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
  filterMyEvents = input<boolean>(false);
  activeTab = signal<'published' | 'completed' | 'cancelled'>('published');

  groupedEvents = computed(() => {
    const list = this.events();
    const groups: { label: string; events: Event[] }[] = [];

    for (const event of list) {
      const label = this.getGroupLabel(event);
      let group = groups.find(g => g.label === label);
      if (!group) {
        group = { label, events: [] };
        groups.push(group);
      }
      group.events.push(event);
    }
    return groups;
  });

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents(page = 1) {
    this.isLoading.set(true);
    const request$ = this.filterMyEvents()
      ? this.eventsApi.getMyEvents(page, 10, this.activeTab())
      : this.eventsApi.getEvents(page, 10);

    request$.subscribe({
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

  selectTab(tab: 'published' | 'completed' | 'cancelled') {
    this.activeTab.set(tab);
    this.loadEvents(1);
  }

  getGroupLabel(event: Event): string {
    const startsAt = new Date(event.starts_at);
    const now = new Date();

    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate());

    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays > 1 && diffDays <= 7) {
      return 'This week';
    } else if (diffDays < -1 && diffDays >= -7) {
      return 'Last week';
    } else if (startsAt.getMonth() === now.getMonth() && startsAt.getFullYear() === now.getFullYear()) {
      return 'This month';
    } else {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[startsAt.getMonth()]} ${startsAt.getFullYear()}`;
    }
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

  getGridClass(count: number): string {
    if (this.filterMyEvents()) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }

    if (count === 1) {
      return 'grid-cols-1 w-full';
    } else {
      return 'grid-cols-1 md:grid-cols-2';
    }
  }
}
