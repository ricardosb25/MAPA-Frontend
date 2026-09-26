import { UserProfileType } from './user-profile.enum';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileType: UserProfileType;
  acceptedTerms: boolean;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  role: UserProfileType;
  acceptedTerms: boolean;
}

export interface UserModel {
  id: string;
  fullName: string;
  email: string;
  role: UserProfileType;
  active: boolean;
}

export interface LoginResponseDto {
  token: string;
  type: string;
  expiresIn: number;
  user: UserModel;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserModel;
}

export function mapRegisterRequest(credentials: RegisterCredentials): RegisterRequestDto {
  return {
    fullName: credentials.fullName,
    email: credentials.email,
    password: credentials.password,
    role: credentials.profileType,
    acceptedTerms: credentials.acceptedTerms === true
  };
}

export function mapLoginResponseToAuth(response: LoginResponseDto): AuthResponse {
  return {
    token: response.token,
    tokenType: response.type,
    expiresIn: response.expiresIn,
    user: response.user
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

