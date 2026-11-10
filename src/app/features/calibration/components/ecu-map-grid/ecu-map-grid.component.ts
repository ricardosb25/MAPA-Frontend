import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EcuMapCellUpdate, EcuMapGrid } from '../../../../core/models/ecu-map.model';

interface CellPosition {
  loadIndex: number;
  rpmIndex: number;
}

@Component({
  selector: 'app-ecu-map-grid',
  standalone: true,
  imports: [FormsModule],
  template: `
    @let valueSuffix = map.mapType === 'IGNITION' ? '°' : '%';
    <div class="map-grid-wrapper">
      <table class="map-grid" [attr.aria-label]="map.label + ' em ' + map.unit">
        <thead>
          <tr>
            <th class="row-axis" rowspan="2" scope="col">Carga (%)</th>
            <th class="rpm-axis" [attr.colspan]="map.rpmBreakpoints.length">
              {{ map.mapType === 'IGNITION' ? 'Avanço (°)' : 'VE (%)' }} por rotação (RPM)
              <span aria-hidden="true">→</span>
            </th>
          </tr>
          <tr>
            @for (rpm of map.rpmBreakpoints; track rpm) {
              <th class="rpm-header" scope="col">{{ rpm }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (load of map.loadBreakpoints; track load; let loadIndex = $index) {
            <tr>
              <th class="load-header" scope="row">Carga {{ load }}%</th>
              @for (rpm of map.rpmBreakpoints; track rpm; let rpmIndex = $index) {
                @let cellLabel = 'Carga ' + load + '%, ' + rpm + ' RPM, ' + map.unit;
                <td class="grid-cell">
                  @if (isEditing(loadIndex, rpmIndex)) {
                    <input
                      #cellInput
                      type="number"
                      class="cell-input"
                      [attr.aria-label]="cellLabel"
                      [attr.min]="map.minValue"
                      [attr.max]="map.maxValue"
                      [attr.step]="map.step"
                      [(ngModel)]="editValue"
                      [disabled]="isSaving"
                      (keydown.enter)="handleCommit()"
                      (keydown.escape)="handleCancelEdit()"
                      (blur)="handleCommit()"
                    />
                  } @else {
                    <button
                      type="button"
                      class="cell-button"
                      [attr.aria-label]="cellLabel + ': ' + map.values[loadIndex][rpmIndex] + valueSuffix"
                      [disabled]="isSaving"
                      [style.backgroundColor]="getCellStyle(map.values[loadIndex][rpmIndex])"
                      (click)="handleCellClick(loadIndex, rpmIndex)"
                    >
                      {{ map.values[loadIndex][rpmIndex] }}{{ valueSuffix }}
                    </button>
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>

      @if (validationMessage) {
        <p class="validation-message" role="alert">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>{{ validationMessage }}</span>
        </p>
      }
    </div>
  `,
  styles: [
    `
      .map-grid-wrapper {
        overflow-x: auto;
      }

      .map-grid {
        border-collapse: separate;
        border-spacing: 6px;
        width: 100%;
        font-family: 'Courier New', monospace;
      }

      .row-axis,
      .rpm-axis,
      .rpm-header,
      .load-header {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--mapa-gray-600);
        text-align: center;
        padding: 4px 6px;
        white-space: nowrap;
      }

      .row-axis,
      .load-header {
        background-color: var(--mapa-gray-200);
        color: var(--mapa-gray-700);
        border-radius: 6px;
      }

      .rpm-axis,
      .rpm-header {
        background-color: var(--mapa-blue-100);
        color: var(--mapa-blue-900);
        border-radius: 6px;
      }

      .grid-cell {
        padding: 0;
      }

      .cell-button {
        width: 100%;
        min-width: 56px;
        height: 44px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--mapa-ink);
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
      }

      .cell-button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.18);
      }

      .cell-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .cell-input {
        width: 100%;
        min-width: 56px;
        height: 44px;
        border: 2px solid var(--mapa-blue-500);
        border-radius: 8px;
        text-align: center;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--mapa-ink);
        background-color: var(--mapa-white);
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.2);
        box-sizing: border-box;
      }

      .validation-message {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 12px 0 0 0;
        font-size: 0.8rem;
        font-weight: 600;
        color: #b91c1c;
      }
    `
  ]
})
export class EcuMapGridComponent implements AfterViewChecked {
  @Input({ required: true }) map!: EcuMapGrid;
  @Input() isSaving = false;
  @Output() cellSave = new EventEmitter<EcuMapCellUpdate>();

  @ViewChild('cellInput') private cellInput?: ElementRef<HTMLInputElement>;

  editingCell: CellPosition | null = null;
  editValue = '';
  validationMessage = '';

  private hasFocusedInput = false;

  ngAfterViewChecked(): void {
    if (this.editingCell !== null && !this.hasFocusedInput && this.cellInput) {
      this.cellInput.nativeElement.focus();
      this.cellInput.nativeElement.select();
      this.hasFocusedInput = true;
    }
  }

  handleCellClick(loadIndex: number, rpmIndex: number): void {
    if (this.isSaving) {
      return;
    }

    this.editingCell = { loadIndex, rpmIndex };
    this.editValue = String(this.map.values[loadIndex][rpmIndex]);
    this.validationMessage = '';
    this.hasFocusedInput = false;
  }

  handleCommit(): void {
    if (this.editingCell === null || this.isSaving) {
      return;
    }

    const parsedValue = Number(this.editValue);
    if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue)) {
      this.validationMessage = `Valor inválido: informe um número inteiro entre ${this.map.minValue} e ${this.map.maxValue} (${this.map.unit}).`;
      return;
    }

    if (parsedValue < this.map.minValue || parsedValue > this.map.maxValue) {
      this.validationMessage = `Valor fora do intervalo permitido: ${this.map.minValue} a ${this.map.maxValue} (${this.map.unit}).`;
      return;
    }

    const { loadIndex, rpmIndex } = this.editingCell;
    const currentValue = this.map.values[loadIndex][rpmIndex];

    this.editingCell = null;
    this.validationMessage = '';
    this.hasFocusedInput = false;

    if (parsedValue !== currentValue) {
      this.cellSave.emit({ loadIndex, rpmIndex, value: parsedValue });
    }
  }

  handleCancelEdit(): void {
    this.editingCell = null;
    this.validationMessage = '';
    this.hasFocusedInput = false;
  }

  isEditing(loadIndex: number, rpmIndex: number): boolean {
    return (
      this.editingCell !== null &&
      this.editingCell.loadIndex === loadIndex &&
      this.editingCell.rpmIndex === rpmIndex
    );
  }

  getCellStyle(value: number): string {
    const valueRange = Math.max(this.map.maxValue - this.map.minValue, 1);
    const ratio = Math.min(Math.max((value - this.map.minValue) / valueRange, 0), 1);

    const startHue = 205;
    const middleHue = 95;
    const endHue = 8;
    const hue =
      ratio <= 0.5
        ? startHue + (middleHue - startHue) * (ratio / 0.5)
        : middleHue + (endHue - middleHue) * ((ratio - 0.5) / 0.5);

    return `hsl(${Math.round(hue)} 85% 74%)`;
  }
}
