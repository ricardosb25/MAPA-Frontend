import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [AuthLayoutComponent, ForgotPasswordFormComponent],
  template: `
    <app-auth-layout mode="login">
        <app-forgot-password-form
          [isSubmitting]="isSubmitting"
          (submitForgotPasswordForm)="onForgotPasswordSubmit($event)"
        ></app-forgot-password-form>
      </app-auth-layout>
  `
})
export class ForgotPasswordPageComponent {
  isSubmitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly feedbackService: FeedbackService
  ) {}

  onForgotPasswordSubmit(request: ForgotPasswordRequest): void {
    this.isSubmitting = true;

    this.authService.forgotPassword(request).subscribe({
      next: (messageResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showSuccess('Solicitação enviada', messageResponse.message, { life: 6000 });
      },
      error: (httpError: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showAuthError(httpError, 'forgotPassword');
      }
    });
  }
}