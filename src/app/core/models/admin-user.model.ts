import { UserProfileType } from './user-profile.enum';

export interface AdminUserModel {
  id: number;
  fullName: string;
  email: string;
  role: UserProfileType;
  active: boolean;
  createdAt: string;
}

export interface AdminUserQuery {
  search: string;
  role: UserProfileType | null;
  page: number;
  size: number;
  sort: string;
}

export interface AdminUserUpdatePayload {
  fullName: string;
  email: string;
  active: boolean;
}
