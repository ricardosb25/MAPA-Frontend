import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { InfoSidebarComponent } from '../../../../shared/components/info-sidebar/info-sidebar.component';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, InfoSidebarComponent, LoginFormComponent],
  template: `
    <div class="auth-page-layout">
      <div class="sidebar-column">
        <app-info-sidebar mode="login"></app-info-sidebar>
      </div>

      <main class="form-column">
        <app-login-form
          [isSubmitting]="isSubmitting"
          (submitLoginForm)="onLoginSubmit($event)"
        ></app-login-form>
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
export class LoginPageComponent implements OnDestroy {
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
          this.router.navigate(['/garage']);
        }, 600);
      },
      error: (httpError: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.feedbackService.showAuthError(httpError, 'login');
      }
    });
  }
}

