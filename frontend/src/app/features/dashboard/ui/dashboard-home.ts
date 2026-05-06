import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventsApi } from '@core/services/events-api';
import { Event } from '@shared/types/event.types';
import { EventFormModal } from './event-form-modal';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, EventFormModal],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Gestión de Eventos</h1>
          <p class="text-[var(--text-secondary)] mt-1">Administra, crea y supervisa todos los eventos de la plataforma.</p>
        </div>
        
        <button 
          (click)="openCreateModal()"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Evento
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats(); track stat.label) {
          <div class="p-6 bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl">
            <p class="text-sm font-medium text-[var(--text-secondary)]">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-[var(--text-primary)] mt-1">{{ stat.value }}</p>
          </div>
        }
      </div>

      <!-- Events Table Section -->
      <div class="bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[var(--border-color)] bg-white/5">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Evento</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Fecha</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Estado</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-right">Acciones</th>
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
                        <button (click)="onEdit(event)" class="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Editar">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button (click)="onDelete(event.id)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Eliminar">
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
                      No hay eventos creados todavía. ¡Comienza creando uno!
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Component -->
      @if (isModalOpen()) {
        <app-event-form-modal 
          [event]="selectedEvent()" 
          (close)="isModalOpen.set(false)"
          (saved)="loadEvents()"
        ></app-event-form-modal>
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

  stats = signal([
    { label: 'Eventos Totales', value: '0' },
    { label: 'Participantes', value: '0' },
    { label: 'Próximos', value: '0' },
    { label: 'Finalizados', value: '0' },
  ]);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    this.eventsApi.getEvents(1, 100).subscribe({
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
      { label: 'Eventos Totales', value: events.length.toString() },
      { label: 'Publicados', value: events.filter(e => e.status === 'published').length.toString() },
      { label: 'Borradores', value: events.filter(e => e.status === 'draft').length.toString() },
      { label: 'Cancelados', value: events.filter(e => e.status === 'cancelled').length.toString() },
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

  onDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.eventsApi.deleteEvent(id).subscribe(() => this.loadEvents());
    }
  }
}

