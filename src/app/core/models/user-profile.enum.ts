export enum UserProfileType {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  OTHER = 'OTHER'
}

export interface UserProfileOption {
  value: UserProfileType;
  label: string;
  description: string;
  iconName: string;
}
