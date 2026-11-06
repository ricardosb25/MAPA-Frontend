import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChallengeModel } from '../../../../core/models/challenge.model';

@Component({
  selector: 'app-active-challenge-card',
  standalone: true,
  imports: [TagModule, ProgressBarModule],
  template: `
    <section class="challenge-card" aria-labelledby="challengeTitle">
      <p-tag
        value="DESAFIO ATIVO"
        icon="pi pi-flag"
        severity="info"
        styleClass="challenge-tag"
      ></p-tag>

      <h2 class="challenge-title" id="challengeTitle">{{ challenge.title }}</h2>
      <p class="challenge-description">{{ challenge.description }}</p>

      <ul class="criteria-list">
        @for (criterion of challenge.criteria; track criterion; let criterionPosition = $index) {
          <li class="criteria-item" [class.criteria-done]="challenge.criteriaResults?.[criterionPosition] === true">
            <span class="criteria-dot"></span>
            <span>{{ criterion }}</span>
          </li>
        }
      </ul>

      <p-progressbar
        [value]="progressPercentage"
        [showValue]="false"
        styleClass="challenge-progress"
      ></p-progressbar>
      <span class="progress-label">{{ challenge.completedCriteria }}/{{ challenge.criteria.length }} critérios</span>
    </section>
  `,
  styles: [
    `
      .challenge-card {
        background-color: var(--mapa-white);
        border: 1px solid var(--mapa-gray-200);
        border-radius: 12px;
        padding: 18px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      :host ::ng-deep .challenge-tag.p-tag {
        display: inline-flex;
        margin-bottom: 12px;
        padding: 0.24rem 0.5rem;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        border-radius: 6px;
        background: var(--mapa-blue-50);
        border: 1px solid var(--mapa-blue-200);
        color: var(--mapa-blue-800);
      }

      .challenge-title {
        margin: 0 0 8px 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--mapa-ink);
        line-height: 1.3;
        letter-spacing: -0.01em;
      }

      .challenge-description {
        margin: 0 0 14px 0;
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--mapa-gray-600);
      }

      .criteria-list {
        list-style: none;
        margin: 0 0 14px 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .criteria-item {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--mapa-gray-600);
      }

      .criteria-dot {
        width: 14px;
        height: 14px;
        min-width: 14px;
        border-radius: 50%;
        background-color: var(--mapa-white);
        border: 2px solid var(--mapa-gray-300);
        box-sizing: border-box;
        transition: background-color 0.2s ease, border-color 0.2s ease;
      }

      .criteria-item.criteria-done {
        color: var(--mapa-blue-800);
        font-weight: 700;
      }

      .criteria-item.criteria-done .criteria-dot {
        background-color: var(--mapa-blue-500);
        border-color: var(--mapa-blue-500);
      }

      :host ::ng-deep .challenge-progress {
        height: 6px;
        border-radius: 3px;
        background: var(--mapa-gray-200);
      }

      :host ::ng-deep .challenge-progress .p-progressbar-value {
        background: var(--mapa-blue-500);
        border-radius: 3px;
      }

      .progress-label {
        display: block;
        margin-top: 7px;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--mapa-gray-500);
        letter-spacing: 0.03em;
      }
    `
  ]
})
export class ActiveChallengeCardComponent {
  @Input({ required: true }) challenge!: ChallengeModel;

  get progressPercentage(): number {
    if (!this.challenge || !this.challenge.criteria || this.challenge.criteria.length === 0) {
      return 0;
    }

    return (this.challenge.completedCriteria / this.challenge.criteria.length) * 100;
  }
}
