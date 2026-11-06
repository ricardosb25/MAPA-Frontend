import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { AuthLayoutComponent } from '../../../../shared/components/auth-layout/auth-layout.component';
import { ResetPasswordFormComponent } from '../../components/reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [AuthLayoutComponent, ResetPasswordFormComponent],
  template: `
    <app-auth-layout mode="login">
        @if (resetToken) {
          <app-reset-password-form
            [token]="resetToken"
            [isSubmitting]="isSubmitting"
            (submitResetPasswordForm)="onResetPasswordSubmit($event)"
          ></app-reset-password-form>
        }
      </app-auth-layout>
  `
})
export class ResetPasswordPageComponent implements OnDestroy {
  isSubmitting = false;
  resetToken: string | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly feedbackService: FeedbackService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {
    this.activatedRoute.queryParamMap.pipe(take(1)).subscribe((queryParameters) => {
      this.resetToken = queryParameters.get('token');

      if (!this.resetToken) {
        this.feedbackService.showError(
          'Link inválido',
          'O link de redefinição está ausente ou inválido. Solicite um novo.'
        );
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
    }
  }

  onResetPasswordSubmit(request: ResetPasswordRequest): void {
    this.isSubmitting = true;

    this.authService.resetPassword(request).subscribe({
      next: (messageResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showSuccess('Senha redefinida', messageResponse.message);

        this.feedbackTimeoutId = setTimeout(() => {
          this.router.navigate(['/login']);
        }, 900);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showAuthError(httpError, 'resetPassword');
      }
    });
  }
}