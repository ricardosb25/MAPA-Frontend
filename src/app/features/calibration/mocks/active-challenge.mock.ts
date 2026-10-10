
 //⚠️ MOCK com dados provisórios

export interface ActiveChallenge {
  title: string;
  description: string;
  criteria: string[];
  completedCriteria: number;
}

export const ACTIVE_CHALLENGE: ActiveChallenge | null = {
  title: 'Falta de potência em alta rotação',
  description:
    'O mapa de fábrica do AP 1.8 8V está pobre e atrasado acima de 6.000 rpm. Corrija combustível e avanço sem provocar detonação.',
  criteria: ['Atingir 103 cv de pico', 'Nenhum ponto com detonação', 'Motor íntegro após o teste'],
  completedCriteria: 0
};
