import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    motores: `${environment.apiUrl}/motores`
  },
  buildEngineByIdUrl(engineId: number | string): string {
    return `${environment.apiUrl}/motores/${engineId}`;
  }
};
