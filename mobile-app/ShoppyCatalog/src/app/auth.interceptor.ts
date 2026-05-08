import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToolsService } from './tools/tools';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const tools = inject(ToolsService);
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
          // console.log(`[API SUCCESS 200] ${req.method} ${req.urlWithParams} ->`, event.body);

          // Mostrar mensaje de éxito si el backend lo envía
          const body = event.body as any;
          if (body && body.message) {
            tools.presentToast(body.message, 'success');
          }
        }
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {
          // console.error(`[API ERROR ${error.status}] ${req.method} ${req.urlWithParams} ->`, error.error || error.message);

          // Solo mostrar toasts para errores de nuestra propia API
          if (req.url.startsWith(environment.apiUrl)) {
            let errorMsg = 'Ocurrió un error inesperado. Por favor, intenta más tarde.';

            if (!environment.production) {
              // Modo Desarrollo: Mostrar error técnico detallado
              errorMsg = error.error?.error || error.error?.message || `[${error.status}] ${error.message}`;
            } else {
              // Modo Producción: Mostrar error genérico o un mensaje amigable del backend si existe de forma segura
              if (error.status === 401) errorMsg = 'Sesión expirada o credenciales inválidas.';
              if (error.status === 400) errorMsg = 'Hubo un problema con los datos enviados.';
            }

            tools.presentToast(errorMsg, 'danger');
          }
        }
      }
    })
  );
};


