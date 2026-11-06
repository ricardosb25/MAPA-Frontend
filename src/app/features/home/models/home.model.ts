export interface HomeStepItem {
  stepNumber: string;
  category: string;
  title: string;
  description: string;
  note: string;
  routePath: string;
  buttonLabel: string;
  iconClass: string;
  accentColor: 'blue' | 'amber' | 'emerald';
}
