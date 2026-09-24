import { Observable } from 'rxjs';
import { AuthResponse, LoginCredentials, RegisterCredentials, UserModel } from '../models/auth.model';

export abstract class AuthService {
  abstract readonly currentUser$: Observable<UserModel | null>;
  abstract readonly isAdmin$: Observable<boolean>;
  abstract login(credentials: LoginCredentials): Observable<AuthResponse>;
  abstract register(credentials: RegisterCredentials): Observable<UserModel>;
  abstract getCurrentUser(): Observable<UserModel>;
  abstract logout(): void;
  abstract getToken(): string | null;
  abstract isAuthenticated(): boolean;
  abstract isAdmin(): boolean;
}
