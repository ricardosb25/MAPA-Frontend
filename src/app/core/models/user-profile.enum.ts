export enum UserProfileType {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface UserProfileOption {
  value: UserProfileType;
  label: string;
  description: string;
  iconName: string;
}

