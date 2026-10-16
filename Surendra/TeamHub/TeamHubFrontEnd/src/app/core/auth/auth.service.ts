import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import type { RedirectRequest } from '@azure/msal-browser';
import { Observable, firstValueFrom, from, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ENTRA_CLIENT } from './entra-msal';
import { CurrentUser } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly clientPromise = inject(ENTRA_CLIENT);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}api/auth`;
  readonly currentUser = signal<CurrentUser | null>(null);
  private readonly authenticated = signal(false);
  readonly isAdmin = computed(() => this.currentUser()?.roles.some(role => role === 'Admin') ?? false);

  get isAuthenticated(): boolean {
    return this.authenticated();
  }

  async initialize(): Promise<void> {
    const client = await this.clientPromise;
    await client.initialize();
    const result = await client.handleRedirectPromise();
    const account = result?.account ?? client.getActiveAccount() ?? client.getAllAccounts()[0] ?? null;
    client.setActiveAccount(account);
    this.authenticated.set(account !== null);
    if (account) {
      await firstValueFrom(this.loadCurrentUser()).catch(() => undefined);
    }
  }

  signIn(returnUrl: string): Promise<void> {
    if (!this.isConfigured) {
      return Promise.reject(new Error('Microsoft Entra settings are not configured.'));
    }

    const request: RedirectRequest = {
      scopes: [environment.entra.apiScope],
      redirectStartPage: `${window.location.origin}${returnUrl}`
    };
    return this.clientPromise.then(client => client.loginRedirect(request));
  }

  async signOut(): Promise<void> {
    const client = await this.clientPromise;
    await client.logoutRedirect({
      account: client.getActiveAccount() ?? undefined,
      postLogoutRedirectUri: `${window.location.origin}/home`
    });
  }

  acquireAccessToken(): Observable<string | null> {
    return from(this.clientPromise.then(async client => {
      const account = client.getActiveAccount() ?? client.getAllAccounts()[0];
      if (!account || !environment.entra.apiScope) {
        return null;
      }
      const result = await client.acquireTokenSilent({ account, scopes: [environment.entra.apiScope] });
      return result.accessToken;
    }));
  }

  loadCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  get isConfigured(): boolean {
    return Boolean(environment.entra.tenantId && environment.entra.clientId && environment.entra.apiScope);
  }
}
