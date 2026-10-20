import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynoResult, EngineStatus, ENGINE_STATUS_LABELS } from '../../../../core/models/dyno.model';

@Component({
  selector: 'app-engine-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="health-card" aria-label="Saúde do motor">
      <span class="health-tag">SAÚDE DO MOTOR</span>

      @if (result === null) {
        <div class="health-alert health-waiting">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Aguardando primeira passada de dinamômetro.</span>
        </div>
      } @else {
        <div class="health-alert" [ngClass]="alertClass">
          <i [class]="statusIcon" aria-hidden="true"></i>
          <div class="health-details">
            <span class="health-status">{{ statusLabel }}</span>
            <span class="health-message">{{ statusMessage }}</span>
            @if (result.finalStatus !== 'INTEGRO') {
              <span class="health-rpm">Interrupção em {{ lastSimulatedRpm }} RPM.</span>
            }
          </div>
        </div>

        <div class="health-metrics">
          <div class="metric">
            <span class="metric-label">PICO DE POTÊNCIA</span>
            <span class="metric-value metric-power">{{ result.peakPower.toFixed(1) }} cv</span>
          </div>
          <div class="metric">
            <span class="metric-label">PICO DE TORQUE</span>
            <span class="metric-value metric-torque">{{ result.peakTorque.toFixed(1) }} kgfm</span>
          </div>
          <div class="metric">
            <span class="metric-label">AFR MÉDIO</span>
            <span class="metric-value">{{ averageAfr.toFixed(1) }}</span>
          </div>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .health-card {
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .health-tag {
        display: block;
        font-family: 'Courier New', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #64748b;
        margin-bottom: 14px;
      }

      .health-alert {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .health-waiting {
        background-color: #fffbeb;
        border-color: #fcd34d;
        color: #b45309;
      }

      .health-ok {
        background-color: #f0fdf4;
        border-color: #86efac;
        color: #166534;
      }

      .health-broken {
        background-color: #fef2f2;
        border-color: #fca5a5;
        color: #991b1b;
      }

      .health-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .health-status {
        font-weight: 800;
      }

      .health-message {
        font-weight: 500;
        color: #475569;
      }

      .health-rpm {
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .health-metrics {
        display: flex;
        gap: 32px;
        margin-top: 18px;
        flex-wrap: wrap;
      }

      .metric-label {
        display: block;
        font-family: 'Courier New', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #64748b;
        margin-bottom: 4px;
      }

      .metric-value {
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
      }

      .metric-power {
        color: #0099ff;
      }

      .metric-torque {
        color: #16a34a;
      }
    `
  ]
})
export class EngineHealthComponent {
  @Input({ required: true }) result!: DynoResult | null;

  get statusLabel(): string {
    if (this.result === null) {
      return '';
    }
    return ENGINE_STATUS_LABELS[this.result.finalStatus];
  }

  get statusIcon(): string {
    return this.result?.finalStatus === 'INTEGRO'
      ? 'fa-solid fa-circle-check'
      : 'fa-solid fa-circle-xmark';
  }

  get alertClass(): string {
    return this.result?.finalStatus === 'INTEGRO' ? 'health-ok' : 'health-broken';
  }

  get statusMessage(): string {
    switch (this.result?.finalStatus) {
      case 'INTEGRO':
        return 'A puxada percorreu toda a faixa de rotação sem violar os limites físicos do motor.';
      case 'QUEBRADO_POBRE':
        return 'Mistura excessivamente pobre sob alta carga (AFR acima de 16:1). Na vida real, superaqueceria e derreteria o pistão.';
      case 'QUEBRADO_DETONACAO':
        return 'Avanço de ignição acima do limite para a taxa de compressão e RPM atuais. Na vida real, causaria batida de pino (knock).';
      case 'OVERREV':
        return 'Corte de giro configurado acima da tolerância física das peças. Na vida real, causaria flutuação de válvulas.';
      default:
        return '';
    }
  }

  get lastSimulatedRpm(): number {
    if (this.result === null || this.result.rpmAxis.length === 0) {
      return 0;
    }
    return this.result.rpmAxis[this.result.rpmAxis.length - 1];
  }

  get averageAfr(): number {
    if (this.result === null || this.result.afrCurve.length === 0) {
      return 0;
    }
    return this.result.afrCurve.reduce((total, afr) => total + afr, 0) / this.result.afrCurve.length;
  }
}
