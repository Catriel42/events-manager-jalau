import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/event-list').then((m) => m.EventList),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./ui/event-detail').then((m) => m.EventDetail),
  },
];
