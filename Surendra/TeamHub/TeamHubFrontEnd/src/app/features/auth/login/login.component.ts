import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  errorMessage = '';
  isSubmitting = false;

  async signIn(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const returnUrl = requestedUrl?.startsWith('/') && !requestedUrl.startsWith('//') ? requestedUrl : '/home';
    try {
      await this.authService.signIn(returnUrl);
    } catch {
      this.isSubmitting = false;
      this.errorMessage = this.authService.isConfigured
        ? 'Unable to start Microsoft sign-in. Check the Entra app registration and try again.'
        : 'Microsoft Entra settings are not configured yet.';
    }
  }
}
