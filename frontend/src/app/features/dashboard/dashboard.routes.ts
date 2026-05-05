import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
import { EventLayout } from '@shared/layouts/event-layout/event-layout';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: EventLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./ui/dashboard-home').then((m) => m.DashboardHome),
      },
      {
        path: 'registrations',
        loadComponent: () =>
          import('./ui/registrations-view').then((m) => m.RegistrationsView),
      },
    ],
  },
];
