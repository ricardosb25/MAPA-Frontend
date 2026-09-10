import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AuthResponse, LoginCredentials, RegisterCredentials, UserModel } from '../models/auth.model';
import { UserProfileType } from '../models/user-profile.enum';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService implements AuthService {
  private readonly mockDelayMilliseconds = 800;

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const mockUser: UserModel = {
      id: 'usr-1001',
      fullName: 'Usuário Demonstrativo',
      email: credentials.email,
      profileType: UserProfileType.OTHER
    };

    const mockResponse: AuthResponse = {
      accessToken: 'mock-jwt-token-' + Date.now(),
      user: mockUser
    };

    return of(mockResponse).pipe(delay(this.mockDelayMilliseconds));
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    const mockUser: UserModel = {
      id: 'usr-' + Math.floor(Math.random() * 10000),
      fullName: credentials.fullName,
      email: credentials.email,
      profileType: credentials.profileType || UserProfileType.OTHER
    };

    const mockResponse: AuthResponse = {
      accessToken: 'mock-jwt-token-' + Date.now(),
      user: mockUser
    };

    return of(mockResponse).pipe(delay(this.mockDelayMilliseconds));
  }
}
