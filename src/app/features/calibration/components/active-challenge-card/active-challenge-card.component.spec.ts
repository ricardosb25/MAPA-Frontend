import { TestBed } from '@angular/core/testing';
import { ActiveChallengeCardComponent } from './active-challenge-card.component';
import { ChallengeModel } from '../../../../core/models/challenge.model';

describe('ActiveChallengeCardComponent', () => {
  it('marks integrity only when 98 cv does not reach the 255 cv goal', async () => {
    await TestBed.configureTestingModule({ imports: [ActiveChallengeCardComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ActiveChallengeCardComponent);
    fixture.componentRef.setInput('challenge', {
      title: 'Meta 255 cv', description: 'Dados fictícios para regressão visual.',
      goalPowerCv: 255, completed: false, completedCriteria: 1,
      criteria: ['Atingir 255 cv de pico', 'Status final: Motor íntegro'],
      criteriaResults: [false, true]
    } as ChallengeModel);
    fixture.detectChanges();
    const criteriaItems = (fixture.nativeElement as HTMLElement).querySelectorAll('.criteria-item');
    expect(criteriaItems[0].classList.contains('criteria-done')).toBe(false);
    expect(criteriaItems[1].classList.contains('criteria-done')).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.progress-label')?.textContent).toContain('1/2');
    fixture.destroy();
  });
});
