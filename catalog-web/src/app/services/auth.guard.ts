import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authSvc = inject(AuthService);
  const router = inject(Router);

  if (authSvc.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
