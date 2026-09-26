import { Injectable } from '@angular/core';
import { UserModel } from '../models/auth.model';
import { getJwtExpirationTimestamp } from '../auth/jwt.utils';

const TOKEN_STORAGE_KEY = 'mapa.token';
const USER_STORAGE_KEY = 'mapa.user';
const EXPIRES_AT_STORAGE_KEY = 'mapa.expiresAt';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  saveSession(token: string, authenticatedUser: UserModel, expiresInSeconds?: number): void {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));

    const expiresAt = this.resolveExpiresAt(token, expiresInSeconds);

    if (expiresAt !== null) {
      sessionStorage.setItem(EXPIRES_AT_STORAGE_KEY, String(expiresAt));
    } else {
      sessionStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  getUser(): UserModel | null {
    const serializedUser = sessionStorage.getItem(USER_STORAGE_KEY);

    if (!serializedUser) {
      return null;
    }

    try {
      return JSON.parse(serializedUser) as UserModel;
    } catch {
      return null;
    }
  }

  getExpiresAt(): number | null {
    const serializedExpiresAt = sessionStorage.getItem(EXPIRES_AT_STORAGE_KEY);

    if (!serializedExpiresAt) {
      return null;
    }

    const expiresAt = Number(serializedExpiresAt);

    return Number.isNaN(expiresAt) ? null : expiresAt;
  }

  isSessionExpired(clockSkewSeconds = 60): boolean {
    const storedToken = this.getToken();

    if (!storedToken) {
      return true;
    }

    const storedExpiresAt = this.getExpiresAt();

    if (storedExpiresAt !== null) {
      return Date.now() >= storedExpiresAt - clockSkewSeconds * 1000;
    }

    const jwtExpiresAt = getJwtExpirationTimestamp(storedToken);

    if (jwtExpiresAt === null) {
      return true;
    }

    return Date.now() >= jwtExpiresAt - clockSkewSeconds * 1000;
  }

  clearSession(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
  }

  private resolveExpiresAt(token: string, expiresInSeconds?: number): number | null {
    if (typeof expiresInSeconds === 'number' && !Number.isNaN(expiresInSeconds)) {
      return Date.now() + expiresInSeconds * 1000;
    }

    return getJwtExpirationTimestamp(token);
  }
}

