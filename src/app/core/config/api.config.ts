import { environment } from '../../../environments/environment';
import { EcuMapType } from '../models/ecu-map.model';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    motores: `${environment.apiUrl}/motores`,
    motoresSelecionado: `${environment.apiUrl}/motores/selecionado`,
    classes: `${environment.apiUrl}/classes`,
    users: `${environment.apiUrl}/users`,
    auditLogs: `${environment.apiUrl}/users/audit-logs`,
    auth: {
      login: `${environment.apiUrl}/auth/login`,
      register: `${environment.apiUrl}/auth/register`,
      me: `${environment.apiUrl}/auth/me`,
      forgotPassword: `${environment.apiUrl}/auth/forgot-password`,
      resetPassword: `${environment.apiUrl}/auth/reset-password`
    }
  },
  buildEngineMapsUrl(engineId: string | number): string {
    return `${environment.apiUrl}/motores/${engineId}/mapas`;
  },
  buildEngineMapCellUrl(engineId: string | number, mapType: EcuMapType): string {
    return `${environment.apiUrl}/motores/${engineId}/mapas/${mapType}/celulas`;
  },
  buildEngineMapRestoreUrl(engineId: string | number, mapType: EcuMapType): string {
    return `${environment.apiUrl}/motores/${engineId}/mapas/${mapType}/restaurar`;
  },
  buildEngineByIdUrl(engineId: string | number): string {
    return `${environment.apiUrl}/motores/${engineId}`;
  }
};