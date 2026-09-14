import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    motores: `${environment.apiUrl}/motores`
  }
};
