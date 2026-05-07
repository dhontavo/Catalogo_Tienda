import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToolsService } from './tools/tools';

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
          console.log(`[API SUCCESS 200] ${req.method} ${req.urlWithParams} ->`, event.body);
          
          // Mostrar mensaje de éxito si el backend lo envía
          const body = event.body as any;
          if (body && body.message) {
            tools.presentToast(body.message, 'success');
          }
        }
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {
          console.error(`[API ERROR ${error.status}] ${req.method} ${req.urlWithParams} ->`, error.error || error.message);
          
          // Mostrar mensaje de error del backend
          const errorMsg = error.error?.error || error.error?.message || 'Error en el servidor';
          tools.presentToast(errorMsg, 'danger');
        }
      }
    })
  );
};


