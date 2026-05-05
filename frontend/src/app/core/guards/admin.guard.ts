import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  const redirectPath = router.createUrlTree(['/events']);
  return new RedirectCommand(redirectPath);
};
