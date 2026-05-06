import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsApi } from '@core/services/events-api';
import { Event } from '@shared/types/event.types';
import { EventFormModal } from './event-form-modal';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, EventFormModal],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 my-8 md:my-12">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Event Management</h1>
          <p class="text-[var(--text-secondary)] mt-1">Create, manage and oversee all platform events.</p>
        </div>

        <button
          (click)="openCreateModal()"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </button>
      </div>

      <!-- Stats Overview - Desktop -->
      <div class="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats(); track stat.label) {
          <div class="p-6 bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl">
            <p class="text-sm font-medium text-[var(--text-secondary)]">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-[var(--text-primary)] mt-1">{{ stat.value }}</p>
          </div>
        }
      </div>

      <!-- Stats Overview - Mobile -->
      <div class="sm:hidden">
        <div class="grid grid-cols-2 gap-3 p-4 bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl">
          <div class="text-center py-2">
            <p class="text-3xl font-bold text-[var(--text-primary)]">{{ stats()[0].value }}</p>
            <p class="text-[10px] font-medium text-[var(--text-secondary)] uppercase">{{ stats()[0].label }}</p>
          </div>
          <div class="text-center py-2">
            <p class="text-3xl font-bold text-[var(--text-primary)]">{{ stats()[1].value }}</p>
            <p class="text-[10px] font-medium text-[var(--text-secondary)] uppercase">{{ stats()[1].label }}</p>
          </div>
          <div class="text-center py-2">
            <p class="text-3xl font-bold text-[var(--text-primary)]">{{ stats()[2].value }}</p>
            <p class="text-[10px] font-medium text-[var(--text-secondary)] uppercase">{{ stats()[2].label }}</p>
          </div>
          <div class="text-center py-2">
            <p class="text-3xl font-bold text-[var(--text-primary)]">{{ stats()[3].value }}</p>
            <p class="text-[10px] font-medium text-[var(--text-secondary)] uppercase">{{ stats()[3].label }}</p>
          </div>
        </div>
      </div>

      <!-- Events Table Section - Desktop -->
      <div class="hidden md:block bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[var(--border-color)] bg-white/5">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Event</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Date</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              @if (isLoading()) {
                @for (i of [1,2,3]; track i) {
                  <tr class="animate-pulse">
                    <td colspan="4" class="px-6 py-8 h-16 bg-white/5"></td>
                  </tr>
                }
              } @else {
                @for (event of events(); track event.id) {
                  <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <img [src]="event.banner_url || '/placeholder-event.jpg'" class="w-12 h-12 rounded-lg object-cover border border-white/10 shadow-md">
                        <div class="max-w-[200px] truncate">
                          <p class="text-[var(--text-primary)] font-medium truncate">{{ event.title }}</p>
                          <p class="text-xs text-[var(--text-secondary)] capitalize">{{ event.event_type }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-[var(--text-primary)]">{{ event.starts_at | date:'mediumDate' }}</p>
                      <p class="text-xs text-[var(--text-secondary)]">{{ event.starts_at | date:'shortTime' }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
                        [ngClass]="{
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': event.status === 'published',
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20': event.status === 'draft',
                          'bg-red-500/10 text-red-400 border border-red-500/20': event.status === 'cancelled'
                        }"
                      >
                        {{ event.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="onEdit(event)" class="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button (click)="openDeleteModal(event)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-20 text-center text-[var(--text-secondary)]">
                      No events yet. Create one!
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Events Cards Section - Mobile -->
      <div class="md:hidden space-y-4">
        @if (isLoading()) {
          @for (i of [1,2,3]; track i) {
            <div class="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-lg bg-white/5"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-3/4 bg-white/5 rounded"></div>
                  <div class="h-3 w-1/2 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>
          }
        } @else {
          @for (event of events(); track event.id) {
            <div class="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden">
              <div class="flex gap-4 p-4">
                <img [src]="event.banner_url || '/placeholder-event.jpg'" class="w-20 h-20 rounded-lg object-cover border border-white/10 shrink-0">
                <div class="flex-1 min-w-0">
                  <h3 class="text-[var(--text-primary)] font-medium truncate">{{ event.title }}</h3>
                  <p class="text-xs text-[var(--text-secondary)] capitalize mt-1">{{ event.event_type }}</p>
                  <p class="text-xs text-[var(--text-secondary)] mt-1">{{ event.starts_at | date:'mediumDate' }} • {{ event.starts_at | date:'shortTime' }}</p>
                  <span
                    class="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': event.status === 'published',
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20': event.status === 'draft',
                      'bg-red-500/10 text-red-400 border border-red-500/20': event.status === 'cancelled'
                    }"
                  >
                    {{ event.status }}
                  </span>
                </div>
                <div class="flex flex-col gap-2 shrink-0">
                  <button (click)="onEdit(event)" class="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button (click)="openDeleteModal(event)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-secondary)]">
              No events yet. Create one!
            </div>
          }
        }
      </div>

      <!-- Modal Component -->
      @if (isModalOpen()) {
        <app-event-form-modal
          [event]="selectedEvent()"
          (close)="isModalOpen.set(false)"
          (saved)="loadEvents()"
        ></app-event-form-modal>
      }

      <!-- Delete Confirmation Modal -->
      @if (isDeleteModalOpen()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="isDeleteModalOpen.set(false)"></div>
          <div class="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
            <div class="text-center">
              <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg class="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">Delete Event</h3>
              <p class="text-[var(--text-secondary)] mb-6">Are you sure you want to delete "<span class="text-[var(--text-primary)] font-medium">{{ eventToDelete()?.title }}</span>"? This action cannot be undone.</p>
              <div class="flex gap-3">
                <button (click)="isDeleteModalOpen.set(false)" class="flex-1 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-primary)] font-medium rounded-xl transition-colors">
                  Cancel
                </button>
                <button (click)="confirmDelete()" class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardHome implements OnInit {
  private eventsApi = inject(EventsApi);

  events = signal<Event[]>([]);
  isLoading = signal(true);
  isModalOpen = signal(false);
  selectedEvent = signal<Event | null>(null);
  isDeleteModalOpen = signal(false);
  eventToDelete = signal<Event | null>(null);

  stats = signal([
    { label: 'Total Events', value: '0' },
    { label: 'Published', value: '0' },
    { label: 'Drafts', value: '0' },
    { label: 'Cancelled', value: '0' },
  ]);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    this.eventsApi.getAllEvents(1, 100).subscribe({
      next: (res) => {
        this.events.set(res.data);
        this.updateStats(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateStats(events: Event[]) {
    this.stats.set([
      { label: 'Total Events', value: events.length.toString() },
      { label: 'Published', value: events.filter(e => e.status === 'published').length.toString() },
      { label: 'Drafts', value: events.filter(e => e.status === 'draft').length.toString() },
      { label: 'Cancelled', value: events.filter(e => e.status === 'cancelled').length.toString() },
    ]);
  }

  openCreateModal() {
    this.selectedEvent.set(null);
    this.isModalOpen.set(true);
  }

  onEdit(event: Event) {
    this.selectedEvent.set(event);
    this.isModalOpen.set(true);
  }

  openDeleteModal(event: Event) {
    this.eventToDelete.set(event);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    const event = this.eventToDelete();
    if (event) {
      this.eventsApi.deleteEvent(event.id).subscribe(() => {
        this.loadEvents();
        this.isDeleteModalOpen.set(false);
        this.eventToDelete.set(null);
      });
    }
  }
}

