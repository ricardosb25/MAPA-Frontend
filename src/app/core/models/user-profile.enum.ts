export enum UserProfileType {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface UserProfileOption {
  value: UserProfileType;
  label: string;
  description: string;
  iconName: string;
}

