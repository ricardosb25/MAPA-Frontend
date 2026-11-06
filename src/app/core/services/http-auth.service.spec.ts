import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpAuthService } from './http-auth.service';
import { TokenStorageService } from './token-storage.service';
import { API_CONFIG } from '../config/api.config';

describe('HttpAuthService', () => {
  let service: HttpAuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpAuthService, TokenStorageService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(HttpAuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  const matchesPostTo = (endpointUrl: string) => (request: HttpRequest<unknown>): boolean =>
    request.method === 'POST' && request.url === endpointUrl;

  it('should post the email to the forgot-password endpoint and read the message', () => {
    const genericMessage = 'Se o e-mail informado estiver cadastrado, enviaremos um link de redefinição em instantes.';

    service.forgotPassword({ email: 'ana@email.com' }).subscribe((messageResponse) => {
      expect(messageResponse.message).toBe(genericMessage);
    });

    const forgotRequest = httpTestingController.expectOne(matchesPostTo(API_CONFIG.endpoints.auth.forgotPassword));
    expect(forgotRequest.request.body).toEqual({ email: 'ana@email.com' });
    forgotRequest.flush({ message: genericMessage });
  });

  it('should post token and password to the reset-password endpoint and read the message', () => {
    service.resetPassword({ token: 'token-valido', password: 'senhaNova12345' }).subscribe((messageResponse) => {
      expect(messageResponse.message).toBe('Senha redefinida com sucesso.');
    });

    const resetRequest = httpTestingController.expectOne(matchesPostTo(API_CONFIG.endpoints.auth.resetPassword));
    expect(resetRequest.request.body).toEqual({ token: 'token-valido', password: 'senhaNova12345' });
    resetRequest.flush({ message: 'Senha redefinida com sucesso.' });
  });
});