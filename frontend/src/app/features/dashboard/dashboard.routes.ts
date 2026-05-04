import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/dashboard-home').then((m) => m.DashboardHome),
  },
  {
    path: 'events/new',
    loadComponent: () =>
      import('../events/ui/event-form').then((m) => m.EventForm),
  },
  {
    path: 'events/:id/edit',
    loadComponent: () =>
      import('../events/ui/event-form').then((m) => m.EventForm),
  },
  {
    path: 'events/:id/registrations',
    loadComponent: () =>
      import('./ui/registrations-view').then((m) => m.RegistrationsView),
  },
];
