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
}

export interface UserModel {
  id: string;
  fullName: string;
  email: string;
  profileType: UserProfileType;
}

export interface AuthResponse {
  accessToken: string;
  user: UserModel;
}
