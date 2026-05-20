import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsApi, RegistrationWithUser } from '@core/services/events-api';
import { Event } from '@shared/types/event.types';

@Component({
  selector: 'app-registrations-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 my-8 md:my-12">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Event Registrations</h1>
          <p class="text-[var(--text-secondary)] mt-1">Monitor and manage attendees across all platform events.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-[var(--border-color)]">
        <a routerLink="/dashboard" class="px-6 py-3 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-all duration-200">
          Events
        </a>
        <a routerLink="/dashboard/registrations" class="px-6 py-3 border-b-2 border-blue-500 text-blue-400 font-semibold text-sm transition-all duration-200">
          Registrations
        </a>
      </div>

      <!-- Events List Table - Desktop -->
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
              @if (isLoadingEvents()) {
                @for (i of [1, 2, 3]; track i) {
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
                        <div class="max-w-[250px] truncate">
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
                      <button
                        (click)="openAttendeesPanel(event)"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all duration-200 text-sm active:scale-95"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        View Attendees
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-20 text-center text-[var(--text-secondary)]">
                      No events found.
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
        @if (isLoadingEvents()) {
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-lg bg-white/5 animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-3/4 bg-white/5 rounded"></div>
                  <div class="h-3 w-1/2 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>
          }
        } @else {
          @for (event of events(); track event.id) {
            <div class="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col">
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
              </div>
              <button
                (click)="openAttendeesPanel(event)"
                class="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border-t border-[var(--border-color)] font-medium text-sm flex items-center justify-center gap-2 transition-colors active:bg-blue-600/30"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                View Attendees
              </button>
            </div>
          } @empty {
            <div class="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-secondary)]">
              No events found.
            </div>
          }
        }
      </div>

      <!-- Slide-over Attendees Panel -->
      @if (isPanelOpen()) {
        <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div class="absolute inset-0 overflow-hidden">
            <!-- Background backdrop, show/hide based on slide-over state. -->
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" (click)="closePanel()"></div>

            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 md:pl-16">
              <!--
                Slide-over panel, show/hide based on slide-over state.
                Entering: "transform transition ease-in-out duration-300"
                Leaving: "transform transition ease-in-out duration-300"
              -->
              <div class="pointer-events-auto w-screen max-w-md transform bg-[var(--bg-secondary)] border-l border-[var(--border-color)] shadow-2xl transition ease-in-out duration-300 animate-in slide-in-from-right">
                <div class="flex h-full flex-col overflow-y-scroll py-6">
                  <!-- Header -->
                  <div class="px-6 sm:px-8 border-b border-[var(--border-color)] pb-6">
                    <div class="flex items-start justify-between">
                      <h2 class="text-xl font-bold text-[var(--text-primary)]" id="slide-over-title">
                        Event Attendees
                      </h2>
                      <div class="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          class="relative rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all"
                          (click)="closePanel()"
                        >
                          <span class="sr-only">Close panel</span>
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    @if (selectedEvent()) {
                      <div class="mt-4 flex items-center gap-3">
                        <img [src]="selectedEvent()?.banner_url || '/placeholder-event.jpg'" class="w-10 h-10 rounded-lg object-cover border border-white/10">
                        <div>
                          <h3 class="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[260px]">
                            {{ selectedEvent()?.title }}
                          </h3>
                          <p class="text-xs text-[var(--text-secondary)]">
                            {{ selectedEvent()?.starts_at | date:'mediumDate' }}
                          </p>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Content / Filter Input -->
                  <div class="relative flex-1 px-6 sm:px-8 mt-6">
                    <div class="relative mb-6">
                      <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg class="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        (input)="onSearchInput($event)"
                        [value]="searchQuery()"
                        class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors"
                      >
                    </div>

                    <!-- List container -->
                    @if (isLoadingAttendees()) {
                      <div class="flex flex-col items-center justify-center py-20 space-y-3">
                        <div class="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p class="text-sm text-[var(--text-secondary)]">Loading attendees...</p>
                      </div>
                    } @else {
                      <div class="space-y-4">
                        <p class="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                          Attendees ({{ confirmedCount() }} Confirmed, {{ waitlistCount() }} Waitlisted)
                        </p>
                        
                        <div class="divide-y divide-[var(--border-color)]">
                          @for (reg of filteredAttendees(); track reg.id) {
                            <div class="py-4 flex items-center justify-between gap-4 group">
                              <div class="flex items-center gap-3 min-w-0">
                                @if (reg.user.avatar_url) {
                                  <img [src]="reg.user.avatar_url" class="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0">
                                } @else {
                                  <div class="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                                    {{ getInitials(reg.user.full_name) }}
                                  </div>
                                }
                                <div class="min-w-0">
                                  <div class="flex items-center gap-2">
                                    <h4 class="text-sm font-semibold text-[var(--text-primary)] truncate">
                                      {{ reg.user.full_name }}
                                    </h4>
                                    <span
                                      class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full shrink-0"
                                      [ngClass]="{
                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': reg.status === 'confirmed',
                                        'bg-amber-500/10 text-amber-400 border border-amber-500/20': reg.status === 'waitlisted'
                                      }"
                                    >
                                      {{ reg.status === 'confirmed' ? 'Confirmed' : 'Waitlist #' + reg.waitlist_position }}
                                    </span>
                                  </div>
                                  <p class="text-xs text-[var(--text-secondary)] truncate">
                                    {{ reg.user.email }}
                                  </p>
                                  <p class="text-[10px] text-[var(--text-secondary)]/70 mt-0.5">
                                    Registered on {{ reg.registered_at | date:'mediumDate' }}
                                  </p>
                                </div>
                              </div>

                              <button
                                (click)="copyEmail(reg.user.email)"
                                class="p-1.5 text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors shrink-0"
                                [title]="copiedEmail() === reg.user.email ? 'Copied!' : 'Copy Email'"
                              >
                                @if (copiedEmail() === reg.user.email) {
                                  <span class="text-xs text-blue-400 font-semibold px-1">Copied!</span>
                                } @else {
                                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                }
                              </button>
                            </div>
                          } @empty {
                            <div class="text-center py-12 text-[var(--text-secondary)]">
                              No attendees found.
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RegistrationsView implements OnInit {
  private eventsApi = inject(EventsApi);

  events = signal<Event[]>([]);
  isLoadingEvents = signal(true);

  isPanelOpen = signal(false);
  selectedEvent = signal<Event | null>(null);
  attendees = signal<RegistrationWithUser[]>([]);
  isLoadingAttendees = signal(false);

  searchQuery = signal('');
  copiedEmail = signal('');

  // Computed filter for attendees list based on query
  filteredAttendees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.attendees();
    }
    return this.attendees().filter(
      (reg) =>
        reg.user.full_name.toLowerCase().includes(query) ||
        reg.user.email.toLowerCase().includes(query)
    );
  });

  confirmedCount = computed(() => {
    return this.filteredAttendees().filter(reg => reg.status === 'confirmed').length;
  });

  waitlistCount = computed(() => {
    return this.filteredAttendees().filter(reg => reg.status === 'waitlisted').length;
  });

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoadingEvents.set(true);
    this.eventsApi.getAllEvents(1, 100).subscribe({
      next: (res) => {
        this.events.set(res.data);
        this.isLoadingEvents.set(false);
      },
      error: () => this.isLoadingEvents.set(false),
    });
  }

  openAttendeesPanel(event: Event) {
    this.selectedEvent.set(event);
    this.isPanelOpen.set(true);
    this.searchQuery.set('');
    this.loadAttendees(event.id);
  }

  loadAttendees(eventId: string) {
    this.isLoadingAttendees.set(true);
    this.eventsApi.getEventRegistrations(eventId).subscribe({
      next: (data) => {
        this.attendees.set(data);
        this.isLoadingAttendees.set(false);
      },
      error: () => {
        this.isLoadingAttendees.set(false);
      },
    });
  }

  closePanel() {
    this.isPanelOpen.set(false);
    this.selectedEvent.set(null);
    this.attendees.set([]);
  }

  onSearchInput(event: EventTarget | null | any) {
    this.searchQuery.set(event?.target?.value || '');
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  copyEmail(email: string) {
    navigator.clipboard.writeText(email).then(() => {
      this.copiedEmail.set(email);
      setTimeout(() => {
        if (this.copiedEmail() === email) {
          this.copiedEmail.set('');
        }
      }, 2000);
    });
  }
}
