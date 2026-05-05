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
    // We will create this module later, for now we can just redirect or leave it empty
    // loadChildren: () => ...
    redirectTo: 'events', 
  },
  {
    path: 'cancel/:token',
    loadComponent: () =>
      import('./features/cancel/ui/cancel-page').then((m) => m.CancelPage),
  },
  {
    path: '**',
    redirectTo: 'events',
  },
];
