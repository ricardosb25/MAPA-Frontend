import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { environment as productionEnvironment } from '../../../../../environments/environment.prod';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutComponent, LoginFormComponent],
  template: `
    <app-auth-layout mode="login">
        <app-login-form
          [isSubmitting]="isSubmitting"
          (submitLoginForm)="onLoginSubmit($event)"
        ></app-login-form>
      </app-auth-layout>
  `
})
export class LoginPageComponent implements OnInit, OnDestroy {
  isSubmitting = false;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly feedbackService: FeedbackService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const healthUrl = new URL('/actuator/health', productionEnvironment.apiUrl);
    void fetch(healthUrl, { mode: 'no-cors', credentials: 'omit', cache: 'no-store' })
      .catch(() => undefined);
  }

  ngOnDestroy(): void {
    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
    }
  }

  onLoginSubmit(credentials: LoginCredentials): void {
    this.isSubmitting = true;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.feedbackService.showSuccess(
          'Login efetuado',
          `Bem-vindo(a), ${response.user.fullName}.`
        );

        this.feedbackTimeoutId = setTimeout(() => {
          this.router.navigate(['/home']);
        }, 600);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showAuthError(httpError, 'login');
      }
    });
  }
}

