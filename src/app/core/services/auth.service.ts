import { Observable } from 'rxjs';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../models/auth.model';

export abstract class AuthService {
  abstract login(credentials: LoginCredentials): Observable<AuthResponse>;
  abstract register(credentials: RegisterCredentials): Observable<AuthResponse>;
}
