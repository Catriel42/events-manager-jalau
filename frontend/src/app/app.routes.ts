import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.routes').then((m) => m.eventsRoutes),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes,
      ),
  },
  {
    path: 'my-events',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/event-layout/event-layout').then(
        (m) => m.EventLayout,
      ),
    children: [
      {
        path: '',
        data: { filterMyEvents: true },
        loadComponent: () =>
          import('./features/events/event-list/event-list').then(
            (m) => m.EventList,
          ),
      },
    ],
  },
  {
    path: 'cancel/:token',
    loadComponent: () =>
      import('./features/cancel/ui/cancel-page').then((m) => m.CancelPage),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy/privacy.component').then(
        (m) => m.PrivacyComponent,
      ),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/legal/terms/terms.component').then(
        (m) => m.TermsComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'events',
  },
];
