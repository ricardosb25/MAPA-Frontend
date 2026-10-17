//⚠️ MOCK com dados provisórios — a parte de desafios será integrada ao backend futuramente.

export interface DynoChallenge {
  title: string;
  description: string;
  criteria: DynoChallengeCriterion[];
}

export interface DynoChallengeCriterion {
  label: string;
  isMet: (result: { picoPotencia: number; statusFinal: string }) => boolean;
}

export const ACTIVE_DYNO_CHALLENGE: DynoChallenge | null = {
  title: 'Falta de potência em alta rotação',
  description:
    'O mapa de fábrica do AP 1.8 8V está pobre e atrasado acima de 6.000 rpm. Corrija combustível e avanço sem provocar detonação.',
  criteria: [
    { label: 'Atingir 103 cv de pico', isMet: (result) => result.picoPotencia >= 103 },
    { label: 'Nenhum ponto com detonação', isMet: (result) => result.statusFinal !== 'QUEBRADO_DETONACAO' },
    { label: 'Motor íntegro após o teste', isMet: (result) => result.statusFinal === 'INTEGRO' }
  ]
};
