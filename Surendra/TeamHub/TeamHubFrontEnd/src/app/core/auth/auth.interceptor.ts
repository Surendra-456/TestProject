import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const isPublicHomeRequest = request.url.startsWith(`${environment.apiUrl}api/employees/home`);
  if (!isApiRequest || isPublicHomeRequest || !authService.isAuthenticated) {
    return next(request);
  }

  return authService.acquireAccessToken().pipe(
    switchMap(token => next(token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request))
  );
};
