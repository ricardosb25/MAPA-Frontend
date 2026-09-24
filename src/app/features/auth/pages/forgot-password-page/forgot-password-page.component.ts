import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { InfoSidebarComponent } from '../../../../shared/components/info-sidebar/info-sidebar.component';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, InfoSidebarComponent, ForgotPasswordFormComponent],
  template: `
    <div class="auth-page-layout">
      <div class="sidebar-column">
        <app-info-sidebar mode="login"></app-info-sidebar>
      </div>

      <main class="form-column">
        <app-forgot-password-form
          [isSubmitting]="isSubmitting"
          (submitForgotPasswordForm)="onForgotPasswordSubmit($event)"
        ></app-forgot-password-form>
      </main>
    </div>
  `,
  styles: [`
    .auth-page-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background-color: #e5e7eb;
      box-sizing: border-box;
    }

    .sidebar-column {
      flex: 1;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2.5rem;
    }

    .form-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      position: relative;
    }

    @media (max-width: 991px) {
      .auth-page-layout {
        flex-direction: column;
      }
      .sidebar-column {
        max-width: 100%;
        padding: 1.5rem;
      }
      .form-column {
        padding: 1.5rem;
      }
    }
  `]
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