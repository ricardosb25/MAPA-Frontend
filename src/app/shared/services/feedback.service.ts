import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { FeedbackSeverity, FeedbackToastOptions } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private readonly messageService: MessageService) {}

  showInfo(title: string, message: string, options?: FeedbackToastOptions): void {
    this.showToast('info', title, message, options);
  }

  showSuccess(title: string, message: string, options?: FeedbackToastOptions): void {
    this.showToast('success', title, message, options);
  }

  showWarning(title: string, message: string, options?: FeedbackToastOptions): void {
    this.showToast('warn', title, message, options);
  }

  showError(title: string, message: string, options?: FeedbackToastOptions): void {
    this.showToast('error', title, message, options);
  }

  showAuthError(
    httpError: HttpErrorResponse,
    context: 'login' | 'register' | 'forgotPassword' | 'resetPassword'
  ): void {
    if (httpError.status === 0) {
      this.showError(
        'Servidor indisponível',
        'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
      );
      return;
    }

    if (context === 'login') {
      this.showLoginError(httpError);
      return;
    }

    if (context === 'register') {
      this.showRegisterError(httpError);
      return;
    }

    this.showPasswordResetError(httpError, context);
  }

  clearAll(): void {
    this.messageService.clear();
  }

  private showLoginError(httpError: HttpErrorResponse): void {
    if (httpError.status === 401) {
      this.showError('Credenciais inválidas', 'Verifique e-mail e senha e tente novamente.');
      return;
    }

    if (httpError.status === 400) {
      this.showWarning('Atenção', 'Requisição inválida. Confira os campos informados.');
      return;
    }

    this.showError('Erro no login', 'Erro ao realizar login. Tente novamente.');
  }

  private showRegisterError(httpError: HttpErrorResponse): void {
    if (httpError.status === 409) {
      this.showWarning('E-mail já cadastrado', 'Este e-mail já está cadastrado. Faça login.');
      return;
    }

    if (httpError.status === 400) {
      this.showError('Dados inválidos', 'Verifique os campos e tente novamente.');
      return;
    }

    this.showError('Erro no cadastro', 'Erro ao cadastrar conta. Tente novamente.');
  }

  private showPasswordResetError(httpError: HttpErrorResponse, context: 'forgotPassword' | 'resetPassword'): void {
    if (context === 'forgotPassword') {
      if (httpError.status === 503) {
        this.showError(
          'Falha no envio do e-mail',
          'Não foi possível enviar o e-mail mesmo após as tentativas de reenvio. Entre em contato com o suporte.'
        );
        return;
      }

      this.showError('Erro na solicitação', 'Não foi possível processar a solicitação. Tente novamente em instantes.');
      return;
    }

    if (httpError.status === 400) {
      this.showWarning('Link inválido', 'O link de redefinição é inválido ou expirado. Solicite um novo.');
      return;
    }

    this.showError('Erro na redefinição', 'Não foi possível redefinir a senha. Tente novamente.');
  }

  private showToast(
    severity: FeedbackSeverity,
    summary: string,
    detail: string,
    options?: FeedbackToastOptions
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      sticky: options?.sticky ?? false,
      life: options?.life ?? 4500
    });
  }
}
