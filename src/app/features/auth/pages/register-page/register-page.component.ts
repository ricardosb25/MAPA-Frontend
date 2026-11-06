import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterCredentials } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [AuthLayoutComponent, RegisterFormComponent],
  template: `
    <app-auth-layout mode="register">
        <app-register-form
          [isSubmitting]="isSubmitting"
          (submitRegisterForm)="onRegisterSubmit($event)"
        ></app-register-form>
      </app-auth-layout>
  `
})
export class RegisterPageComponent implements OnDestroy {
  isSubmitting = false;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly feedbackService: FeedbackService,
    private readonly router: Router
  ) {}

  ngOnDestroy(): void {
    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
    }
  }

  onRegisterSubmit(credentials: RegisterCredentials): void {
    this.isSubmitting = true;

    this.authService.register(credentials).subscribe({
      next: (createdUser) => {
        this.isSubmitting = false;
        this.feedbackService.showSuccess(
          'Conta criada',
          `Bem-vindo(a), ${createdUser.fullName}. Faça login para continuar.`
        );

        this.feedbackTimeoutId = setTimeout(() => {
          this.router.navigate(['/login']);
        }, 900);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showAuthError(httpError, 'register');
      }
    });
  }
}

