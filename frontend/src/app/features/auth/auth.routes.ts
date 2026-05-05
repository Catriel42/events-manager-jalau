import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./auth-callback').then((m) => m.AuthCallback),
  },
];
