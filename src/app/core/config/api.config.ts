import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    motores: `${environment.apiUrl}/motores`,
    auth: {
      login: `${environment.apiUrl}/auth/login`,
      register: `${environment.apiUrl}/auth/register`,
      me: `${environment.apiUrl}/auth/me`
    }
  }
};
