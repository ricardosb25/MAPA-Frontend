import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination-container" aria-label="Paginação do catálogo de motores">
      <span class="pagination-summary">
        {{ totalElements }} {{ totalElements === 1 ? 'motor' : 'motores' }} · página
        {{ page + 1 }} de {{ totalPages === 0 ? 1 : totalPages }}
      </span>

      <div class="pagination-actions">
        <button
          type="button"
          class="pagination-button"
          [disabled]="!hasPrevious"
          (click)="goToFirstPage()"
          aria-label="Primeira página"
          title="Primeira página"
        >
          <i class="pi pi-angle-double-left"></i>
        </button>
        <button
          type="button"
          class="pagination-button"
          [disabled]="!hasPrevious"
          (click)="goToPreviousPage()"
          aria-label="Página anterior"
          title="Página anterior"
        >
          <i class="pi pi-angle-left"></i>
        </button>
        <button
          type="button"
          class="pagination-button"
          [disabled]="!hasNext"
          (click)="goToNextPage()"
          aria-label="Próxima página"
          title="Próxima página"
        >
          <i class="pi pi-angle-right"></i>
        </button>
        <button
          type="button"
          class="pagination-button"
          [disabled]="!hasNext"
          (click)="goToLastPage()"
          aria-label="Última página"
          title="Última página"
        >
          <i class="pi pi-angle-double-right"></i>
        </button>
      </div>

      <label class="pagination-size">
        <span class="pagination-size-label">Itens por página</span>
        <select class="pagination-size-select" (change)="handleSizeChange($event)">
          <option
            *ngFor="let pageSizeOption of pageSizeOptions"
            [value]="pageSizeOption"
            [selected]="pageSizeOption === size"
          >
            {{ pageSizeOption }}
          </option>
        </select>
      </label>
    </nav>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 24px;
      padding: 14px 18px;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
    }

    .pagination-summary {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }

    .pagination-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pagination-button {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background-color: #ffffff;
      color: #475569;
      cursor: pointer;
      font-size: 0.85rem;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .pagination-button:hover:not(:disabled) {
      background-color: #0099ff;
      border-color: #0099ff;
      color: #ffffff;
    }

    .pagination-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .pagination-size {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }

    .pagination-size-select {
      height: 34px;
      padding: 0 28px 0 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background-color: #ffffff;
      color: #0f172a;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .pagination-size-select:focus {
      outline: none;
      border-color: var(--color-primary, #0099ff);
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .pagination-size-select option {
      background-color: #ffffff;
      color: #0f172a;
    }

    @media (max-width: 640px) {
      .pagination-container {
        justify-content: center;
      }
      .pagination-size-label {
        display: none;
      }
    }
  `]
})
export class PaginationControlsComponent {
  @Input({ required: true }) page!: number;
  @Input({ required: true }) size!: number;
  @Input({ required: true }) totalElements!: number;
  @Input({ required: true }) totalPages!: number;
  @Input() hasNext = false;
  @Input() hasPrevious = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  readonly pageSizeOptions = [12, 24, 48];

  goToFirstPage(): void {
    this.goToPage(0);
  }

  goToPreviousPage(): void {
    this.goToPage(this.page - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.page + 1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages - 1);
  }

  handleSizeChange(changeEvent: Event): void {
    const sizeSelectElement = changeEvent.target as HTMLSelectElement;
    this.sizeChange.emit(Number(sizeSelectElement.value));
  }

  private goToPage(targetPage: number): void {
    const isOutOfRange = targetPage < 0 || targetPage >= this.totalPages;
    if (isOutOfRange || targetPage === this.page) {
      return;
    }
    this.pageChange.emit(targetPage);
  }
}