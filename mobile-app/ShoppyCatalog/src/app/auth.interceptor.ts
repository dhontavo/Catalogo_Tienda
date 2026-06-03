import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToolsService } from './tools/tools';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const tools = inject(ToolsService);
  const router = inject(Router);
  let requestToForward = req;

  if (token) {
    requestToForward = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(requestToForward).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          // No mostrar mensajes automáticos de éxito aquí para evitar duplicados o mensajes en blanco
        }
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {
          // console.error(`[API ERROR ${error.status}] ${req.method} ${req.urlWithParams} ->`, error.error || error.message);

          // Solo mostrar toasts para errores de nuestra propia API
          if (req.url.startsWith(environment.apiUrl)) {
            let errorMsg = 'Ocurrió un error inesperado. Por favor, intenta más tarde.';

            if (error.status === 401) {
              errorMsg = 'Sesión expirada o acceso no autorizado.';
              // Limpiar sesión local y redirigir
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.navigateByUrl('/login');
            } else {
              // Extraer mensaje del cuerpo del error (si es JSON) o usar mensaje de estado
              const apiError = error.error;
              if (apiError && typeof apiError === 'object') {
                errorMsg = apiError.error || apiError.message || errorMsg;
              } else if (typeof apiError === 'string' && apiError.length > 0) {
                // El error viene como texto plano (posible error de PHP)
                errorMsg = apiError.length < 100 ? apiError : 'Error interno del servidor (PHP).';
              } else {
                errorMsg = `[${error.status}] ${error.statusText || 'Error desconocido'}`;
              }
            }

            tools.presentToast(errorMsg, 'danger');
          }
        }
      }
    })
  );
};


