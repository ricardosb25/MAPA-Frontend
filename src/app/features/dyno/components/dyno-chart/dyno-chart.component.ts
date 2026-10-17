import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIChart } from 'primeng/chart';

const KGFM_TO_NM = 9.80665;

@Component({
  selector: 'app-dyno-chart',
  standalone: true,
  imports: [CommonModule, UIChart],
  template: `
    <div class="chart-toolbar">
      <button type="button" class="series-toggle" [class.series-active]="showPower()" (click)="togglePower()">
        <span class="series-dot dot-power"></span>
        <span>Potência (cv)</span>
      </button>
      <button type="button" class="series-toggle" [class.series-active]="showTorque()" (click)="toggleTorque()">
        <span class="series-dot dot-torque"></span>
        <span>Torque (Nm)</span>
      </button>
      <button type="button" class="series-toggle" [class.series-active]="showAfr()" (click)="toggleAfr()">
        <span class="series-dot dot-afr"></span>
        <span>AFR</span>
      </button>
    </div>

    <div class="chart-frame">
      <p-chart type="line" [data]="chartData()" [options]="chartOptions()" height="340px" ariaLabel="Curvas de potência, torque e AFR por RPM"></p-chart>
    </div>
  `,
  styles: [
    `
      .chart-toolbar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        margin-bottom: 14px;
      }

      .series-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        color: #94a3b8;
        padding: 4px 6px;
        transition: color 0.2s ease;
      }

      .series-toggle.series-active {
        color: #334155;
      }

      .series-dot {
        width: 14px;
        height: 3px;
        border-radius: 2px;
        background-color: #cbd5e1;
        transition: background-color 0.2s ease;
      }

      .series-active .dot-power {
        background-color: #0099ff;
      }

      .series-active .dot-torque {
        background-color: #22c55e;
      }

      .series-active .dot-afr {
        background-color: #f59e0b;
      }

      .chart-frame {
        width: 100%;
        min-height: 340px;
      }
    `
  ]
})
export class DynoChartComponent implements OnChanges {
  @Input({ required: true }) rpmAxis: number[] = [];
  @Input({ required: true }) powerCurve: number[] = [];
  @Input({ required: true }) torqueCurve: number[] = [];
  @Input() afrCurve: number[] = [];

  readonly showPower = signal(true);
  readonly showTorque = signal(true);
  readonly showAfr = signal(false);

  readonly chartData = signal<Record<string, unknown>>({});
  readonly chartOptions = signal<Record<string, unknown>>({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rpmAxis'] || changes['powerCurve'] || changes['torqueCurve'] || changes['afrCurve']) {
      this.rebuildChart();
    }
  }

  togglePower(): void {
    this.showPower.update((visible) => !visible);
    this.rebuildChart();
  }

  toggleTorque(): void {
    this.showTorque.update((visible) => !visible);
    this.rebuildChart();
  }

  toggleAfr(): void {
    this.showAfr.update((visible) => !visible);
    this.rebuildChart();
  }

  private rebuildChart(): void {
    const datasets: Record<string, unknown>[] = [];

    if (this.showPower()) {
      datasets.push(this.buildDataset('Potência (cv)', this.powerCurve, '#0099ff', 'y'));
    }

    if (this.showTorque()) {
      const torqueInNm = this.torqueCurve.map((torqueKgfm) => torqueKgfm * KGFM_TO_NM);
      datasets.push(this.buildDataset('Torque (Nm)', torqueInNm, '#22c55e', 'y'));
    }

    if (this.showAfr()) {
      datasets.push(this.buildDataset('AFR', this.afrCurve, '#f59e0b', 'yAfr'));
    }

    this.chartData.set({
      labels: this.rpmAxis.map(String),
      datasets
    });

    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: { label?: string }[]) => `${items[0]?.label ?? ''} RPM`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'RPM', color: '#64748b', font: { size: 11, weight: 600 } },
          ticks: { color: '#64748b', maxTicksLimit: 9 },
          grid: { color: '#e2e8f0' }
        },
        y: {
          title: { display: true, text: 'cv / Nm', color: '#64748b', font: { size: 11, weight: 600 } },
          ticks: { color: '#64748b' },
          grid: { color: '#e2e8f0' },
          beginAtZero: true
        },
        yAfr: {
          display: this.showAfr(),
          position: 'right',
          title: { display: true, text: 'AFR', color: '#64748b', font: { size: 11, weight: 600 } },
          ticks: { color: '#64748b' },
          grid: { drawOnChartArea: false }
        }
      }
    });
  }

  private buildDataset(label: string, data: number[], color: string, yAxisID: string): Record<string, unknown> {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.35,
      yAxisID
    };
  }
}
