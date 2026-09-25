import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let feedbackService: FeedbackService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeedbackService, MessageService]
    });

    feedbackService = TestBed.inject(FeedbackService);
    messageService = TestBed.inject(MessageService);
  });

  const buildHttpError = (status: number): HttpErrorResponse =>
    new HttpErrorResponse({ status, statusText: 'Error' });

  it('should show the support contact message when forgot-password fails with 503', () => {
    const addSpy = vi.spyOn(messageService, 'add');

    feedbackService.showAuthError(buildHttpError(503), 'forgotPassword');

    expect(addSpy).toHaveBeenCalledTimes(1);
    const message = addSpy.mock.calls[0][0];
    expect(message.severity).toBe('error');
    expect(message.summary).toBe('Falha no envio do e-mail');
    expect(message.detail).toContain('Entre em contato com o suporte');
  });

  it('should keep the generic message for other forgot-password errors', () => {
    const addSpy = vi.spyOn(messageService, 'add');

    feedbackService.showAuthError(buildHttpError(500), 'forgotPassword');

    expect(addSpy).toHaveBeenCalledTimes(1);
    const message = addSpy.mock.calls[0][0];
    expect(message.severity).toBe('error');
    expect(message.detail).toBe('Não foi possível processar a solicitação. Tente novamente em instantes.');
  });
});
