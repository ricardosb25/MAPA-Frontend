import { Component, Input } from '@angular/core';
import { ActiveChallenge } from '../../mocks/active-challenge.mock';

@Component({
  selector: 'app-active-challenge-card',
  standalone: true,
  template: `
    <section class="challenge-card" aria-labelledby="challengeTitle">
      <span class="challenge-tag">
        <i class="fa-solid fa-bullseye challenge-tag-icon"></i>
        DESAFIO ATIVO
      </span>

      <h2 class="challenge-title" id="challengeTitle">{{ challenge.title }}</h2>
      <p class="challenge-description">{{ challenge.description }}</p>

      <ul class="criteria-list">
        @for (criterion of challenge.criteria; track criterion; let index = $index) {
          <li class="criteria-item" [class.criteria-done]="index < challenge.completedCriteria">
            <span class="criteria-dot"></span>
            <span>{{ criterion }}</span>
          </li>
        }
      </ul>

      <div class="progress-track">
        <div
          class="progress-fill"
          [style.width.%]="progressPercentage"
        ></div>
      </div>
      <span class="progress-label">{{ challenge.completedCriteria }}/{{ challenge.criteria.length }} critérios</span>
    </section>
  `,
  styles: [
    `
      .challenge-card {
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .challenge-tag {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #0099ff;
        text-transform: uppercase;
        margin-bottom: 14px;
      }

      .challenge-tag-icon {
        font-size: 0.8rem;
      }

      .challenge-title {
        margin: 0 0 10px 0;
        font-size: 1.2rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.3;
      }

      .challenge-description {
        margin: 0 0 18px 0;
        font-size: 0.85rem;
        line-height: 1.5;
        color: #475569;
      }

      .criteria-list {
        list-style: none;
        margin: 0 0 18px 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .criteria-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.825rem;
        font-weight: 600;
        color: #334155;
      }

      .criteria-dot {
        width: 14px;
        height: 14px;
        min-width: 14px;
        border-radius: 50%;
        background-color: #475569;
        transition: background-color 0.2s ease;
      }

      .criteria-item.criteria-done {
        color: #166534;
      }

      .criteria-item.criteria-done .criteria-dot {
        background-color: #22c55e;
      }

      .progress-track {
        height: 8px;
        border-radius: 999px;
        background-color: #e2e8f0;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background-color: #0099ff;
        transition: width 0.3s ease;
      }

      .progress-label {
        display: block;
        margin-top: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
      }
    `
  ]
})
export class ActiveChallengeCardComponent {
  @Input({ required: true }) challenge!: ActiveChallenge;

  get progressPercentage(): number {
    if (this.challenge.criteria.length === 0) {
      return 0;
    }

    return (this.challenge.completedCriteria / this.challenge.criteria.length) * 100;
  }
}
