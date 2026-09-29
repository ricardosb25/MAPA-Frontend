export type AuditLogLevel = 'INFO' | 'AVISO' | 'ERRO';

export type AuditLogAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_ANONYMIZED'
  | 'PASSWORD_RESET'
  | 'TERMS_ACCEPTED';

export interface AuditLogModel {
  id: number;
  action: AuditLogAction;
  actionLabel: string;
  level: AuditLogLevel;
  actorId: number | null;
  actorEmail: string | null;
  targetUserId: number | null;
  targetEmail: string | null;
  details: string | null;
  createdAt: string;
}

export interface AuditLogQuery {
  search: string;
  level: AuditLogLevel | null;
  page: number;
  size: number;
  sort: string;
}