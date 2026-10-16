import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export type EntraClient = import('@azure/msal-browser').PublicClientApplication;
export const ENTRA_CLIENT = new InjectionToken<Promise<EntraClient>>('ENTRA_CLIENT');

export async function createEntraClient(): Promise<EntraClient> {
  const { BrowserCacheLocation, PublicClientApplication } = await import('@azure/msal-browser');
  return new PublicClientApplication({
    auth: {
      clientId: environment.entra.clientId || '00000000-0000-0000-0000-000000000000',
      authority: `https://login.microsoftonline.com/${environment.entra.tenantId || 'organizations'}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: `${window.location.origin}/home`
    },
    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage
    }
  });
}