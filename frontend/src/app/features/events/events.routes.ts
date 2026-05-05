import { Routes } from '@angular/router';
import { EventLayout } from '@shared/layouts/event-layout/event-layout';

export const eventsRoutes: Routes = [
  {
    path: '',
    component: EventLayout,
    children: [
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
    ],
  },
];
