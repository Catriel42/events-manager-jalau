import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./ui/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./ui/auth-callback').then((m) => m.AuthCallback),
  },
];
