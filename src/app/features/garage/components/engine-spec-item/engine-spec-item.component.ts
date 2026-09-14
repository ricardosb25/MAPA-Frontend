import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-engine-spec-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spec-item-container">
      <span class="spec-label">{{ label }}</span>
      <span class="spec-value">{{ value }}</span>
    </div>
  `,
  styles: [`
    .spec-item-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .spec-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      text-transform: uppercase;
    }

    .spec-value {
      font-size: 0.9rem;
      font-weight: 800;
      color: #0f172a;
    }
  `]
})
export class EngineSpecItemComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
}
