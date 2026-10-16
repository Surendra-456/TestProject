import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return authService.loadCurrentUser().pipe(
    map(user => user.roles.some(role => role === 'Admin') || router.createUrlTree(['/home'])),
    catchError(() => of(router.createUrlTree(['/home'])))
  );
};
