import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GlobalRegistrationsApi, GlobalRegistration } from '@core/services/global-registrations-api';
import { DashboardNav } from './dashboard-nav';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrations-view',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNav, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 my-8 md:my-12">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Global Registrations</h1>
          <p class="text-[var(--text-secondary)] mt-1">Manage all registrations across all events.</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <app-dashboard-nav></app-dashboard-nav>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by event, user name or email..."
            class="w-full pl-10 pr-4 py-3 bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors shadow-sm"
          >
        </div>
      </div>

      <!-- Registrations Table Section -->
      <div class="bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b border-[var(--border-color)] bg-white/5">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">User</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Event</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Registered At</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              @if (isLoading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr class="animate-pulse">
                    <td colspan="5" class="px-6 py-8 h-16 bg-white/5"></td>
                  </tr>
                }
              } @else {
                @for (reg of filteredRegistrations(); track reg.id) {
                  <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        @if (reg.user.avatar_url) {
                          <img [src]="reg.user.avatar_url" class="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0">
                        } @else {
                          <div class="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                            {{ getInitials(reg.user.full_name) }}
                          </div>
                        }
                        <div class="max-w-[200px] truncate">
                          <p class="text-[var(--text-primary)] font-medium truncate">{{ reg.user.full_name }}</p>
                          <p class="text-xs text-[var(--text-secondary)] truncate">{{ reg.user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-[var(--text-primary)] font-medium truncate max-w-[200px]">{{ reg.event.title }}</p>
                      <p class="text-xs text-[var(--text-secondary)] capitalize">{{ reg.event.event_type }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-[var(--text-primary)]">{{ reg.registered_at | date:'mediumDate' }}</p>
                      <p class="text-xs text-[var(--text-secondary)]">{{ reg.registered_at | date:'shortTime' }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 w-max"
                        [ngClass]="{
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': reg.status === 'confirmed',
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20': reg.status === 'waitlisted',
                          'bg-red-500/10 text-red-400 border border-red-500/20': reg.status === 'cancelled'
                        }"
                      >
                        {{ reg.status }}
                        @if (reg.status === 'waitlisted' && reg.waitlist_position) {
                          <span class="opacity-75">#{{ reg.waitlist_position }}</span>
                        }
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        @if (reg.status !== 'confirmed') {
                          <button (click)="updateStatus(reg, 'confirmed')" class="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Mark Confirmed">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        }
                        @if (reg.status !== 'cancelled') {
                          <button (click)="updateStatus(reg, 'cancelled')" class="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Mark Cancelled">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        }
                        <button (click)="deleteRegistration(reg)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Forever">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-20 text-center text-[var(--text-secondary)]">
                      No registrations found.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class RegistrationsView implements OnInit {
  private api = inject(GlobalRegistrationsApi);

  registrations = signal<GlobalRegistration[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');

  filteredRegistrations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.registrations();
    return this.registrations().filter(
      (reg) =>
        reg.user.full_name.toLowerCase().includes(query) ||
        reg.user.email.toLowerCase().includes(query) ||
        reg.event.title.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.isLoading.set(true);
    this.api.getAllRegistrations().subscribe({
      next: (data) => {
        this.registrations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  updateStatus(reg: GlobalRegistration, status: 'confirmed' | 'waitlisted' | 'cancelled') {
    if (confirm(`Are you sure you want to change the status to ${status}?`)) {
      this.api.updateStatus(reg.id, status).subscribe(() => {
        this.loadRegistrations();
      });
    }
  }

  deleteRegistration(reg: GlobalRegistration) {
    if (confirm(`Are you sure you want to permanently delete this registration?`)) {
      this.api.deleteRegistration(reg.id).subscribe(() => {
        this.loadRegistrations();
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}
