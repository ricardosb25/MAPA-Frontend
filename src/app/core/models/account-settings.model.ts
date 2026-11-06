export interface AccountSettings {
  email: string;
  nextEmailChangeAt: string | null;
  nextPasswordChangeAt: string | null;
}

export interface EmailChangeRequest {
  email: string;
  currentPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
