import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { createEntraClient, ENTRA_CLIENT } from './core/auth/entra-msal';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ENTRA_CLIENT, useFactory: createEntraClient },
    provideAppInitializer(() => inject(AuthService).initialize()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideNativeDateAdapter()
  ]
};
