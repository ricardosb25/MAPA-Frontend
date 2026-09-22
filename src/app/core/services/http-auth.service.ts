import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  AuthResponse,
  LoginCredentials,
  LoginResponseDto,
  RegisterCredentials,
  UserModel,
  mapLoginResponseToAuth,
  mapRegisterRequest
} from '../models/auth.model';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class HttpAuthService extends AuthService {
  private readonly currentUserSubject: BehaviorSubject<UserModel | null>;
  override readonly currentUser$: Observable<UserModel | null>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {
    super();
    const hasExpiredSession = this.tokenStorage.isSessionExpired();
    const initialUser = hasExpiredSession ? null : this.tokenStorage.getUser();
    this.currentUserSubject = new BehaviorSubject<UserModel | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  override login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.httpClient.post<LoginResponseDto>(API_CONFIG.endpoints.auth.login, credentials).pipe(
      map(mapLoginResponseToAuth),
      tap((authResponse) =>
        this.persistSession(authResponse.token, authResponse.user, authResponse.expiresIn)
      )
    );
  }

  override register(credentials: RegisterCredentials): Observable<UserModel> {
    return this.httpClient.post<UserModel>(
      API_CONFIG.endpoints.auth.register,
      mapRegisterRequest(credentials)
    );
  }

  override getCurrentUser(): Observable<UserModel> {
    return this.httpClient.get<UserModel>(API_CONFIG.endpoints.auth.me).pipe(
      tap((authenticatedUser) => {
        const storedToken = this.tokenStorage.getToken();
        if (storedToken) {
          const storedExpiresAt = this.tokenStorage.getExpiresAt();
          const remainingLifetimeSeconds =
            storedExpiresAt !== null
              ? Math.max(0, Math.floor((storedExpiresAt - Date.now()) / 1000))
              : undefined;
          this.persistSession(storedToken, authenticatedUser, remainingLifetimeSeconds);
        } else {
          this.currentUserSubject.next(authenticatedUser);
        }
      })
    );
  }

  override logout(): void {
    this.tokenStorage.clearSession();
    this.currentUserSubject.next(null);
  }

  override getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  override isAuthenticated(): boolean {
    return this.getToken() !== null && !this.tokenStorage.isSessionExpired();
  }

  private persistSession(token: string, authenticatedUser: UserModel, expiresInSeconds?: number): void {
    this.tokenStorage.saveSession(token, authenticatedUser, expiresInSeconds);
    this.currentUserSubject.next(authenticatedUser);
  }
}
