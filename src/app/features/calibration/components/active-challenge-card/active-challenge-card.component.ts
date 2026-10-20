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
        @for (criterion of challenge.criteria; track criterion; let index = $index) {
          <li class="criteria-item" [class.criteria-done]="index < challenge.completedCriteria">
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
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
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
        background: #eef8ff;
        border: 1px solid #bce4ff;
        color: #065ca0;
      }

      .challenge-title {
        margin: 0 0 8px 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.3;
        letter-spacing: -0.01em;
      }

      .challenge-description {
        margin: 0 0 14px 0;
        font-size: 0.82rem;
        line-height: 1.5;
        color: #475569;
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
        color: #475569;
      }

      .criteria-dot {
        width: 14px;
        height: 14px;
        min-width: 14px;
        border-radius: 50%;
        background-color: #ffffff;
        border: 2px solid #cbd5e1;
        box-sizing: border-box;
        transition: background-color 0.2s ease, border-color 0.2s ease;
      }

      .criteria-item.criteria-done {
        color: #065ca0;
        font-weight: 700;
      }

      .criteria-item.criteria-done .criteria-dot {
        background-color: #0099ff;
        border-color: #0099ff;
      }

      :host ::ng-deep .challenge-progress {
        height: 6px;
        border-radius: 3px;
        background: #e2e8f0;
      }

      :host ::ng-deep .challenge-progress .p-progressbar-value {
        background: #0099ff;
        border-radius: 3px;
      }

      .progress-label {
        display: block;
        margin-top: 7px;
        font-size: 0.7rem;
        font-weight: 700;
        color: #64748b;
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
