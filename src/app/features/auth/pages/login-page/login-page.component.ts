import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../core/models/auth.model';
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

        @if (feedbackMessage) {
          <div class="feedback-toast" [class.feedback-success]="isSuccess">
            {{ feedbackMessage }}
          </div>
        }
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

    .feedback-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background-color: #1e293b;
      color: #ffffff;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    }

    .feedback-toast.feedback-success {
      background-color: #10b981;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
export class LoginPageComponent {
  isSubmitting = false;
  feedbackMessage = '';
  isSuccess = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onLoginSubmit(credentials: LoginCredentials): void {
    this.isSubmitting = true;
    this.feedbackMessage = '';

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.feedbackMessage = `Login efetuado com sucesso! Bem-vindo(a), ${response.user.fullName}.`;
        
        setTimeout(() => {
          this.router.navigate(['/garage']);
        }, 600);
      },
      error: () => {
        this.isSubmitting = false;
        this.isSuccess = false;
        this.feedbackMessage = 'Erro ao realizar login. Tente novamente.';
      }
    });
  }
}

