import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    motores: `${environment.apiUrl}/motores`,
    auth: {
      login: `${environment.apiUrl}/auth/login`,
      register: `${environment.apiUrl}/auth/register`,
      me: `${environment.apiUrl}/auth/me`,
      forgotPassword: `${environment.apiUrl}/auth/forgot-password`,
      resetPassword: `${environment.apiUrl}/auth/reset-password`
    }
  },
  buildEngineByIdUrl(engineId: string | number): string {
    return `${environment.apiUrl}/motores/${engineId}`;
  }
};
