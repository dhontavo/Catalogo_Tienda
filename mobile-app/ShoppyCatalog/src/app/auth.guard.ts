import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from 'src/service/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación.
 * Verifica si existe un token en el almacenamiento local.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
