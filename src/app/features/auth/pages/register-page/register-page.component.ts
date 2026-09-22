import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterCredentials } from '../../../../core/models/auth.model';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { InfoSidebarComponent } from '../../../../shared/components/info-sidebar/info-sidebar.component';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, InfoSidebarComponent, RegisterFormComponent],
  template: `
    <div class="auth-page-layout">
      <div class="sidebar-column">
        <app-info-sidebar mode="register"></app-info-sidebar>
      </div>

      <main class="form-column">
        <app-register-form
          [isSubmitting]="isSubmitting"
          (submitRegisterForm)="onRegisterSubmit($event)"
        ></app-register-form>
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

