import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule],
  template: `
    <nav class="pagination-container" [attr.aria-label]="ariaLabel">
      <span class="pagination-summary">
        {{ totalElements }}
        {{ totalElements === 1 ? itemNounSingular : itemNounPlural }} · página
        {{ page + 1 }} de {{ totalPages === 0 ? 1 : totalPages }}
      </span>

      <div class="pagination-actions">
        <p-button
          icon="pi pi-angle-double-left"
          severity="secondary"
          [outlined]="true"
          size="small"
          styleClass="pagination-button"
          [disabled]="!hasPrevious"
          (onClick)="goToFirstPage()"
          ariaLabel="Primeira página"
        ></p-button>
        <p-button
          icon="pi pi-angle-left"
          severity="secondary"
          [outlined]="true"
          size="small"
          styleClass="pagination-button"
          [disabled]="!hasPrevious"
          (onClick)="goToPreviousPage()"
          ariaLabel="Página anterior"
        ></p-button>
        <p-button
          icon="pi pi-angle-right"
          severity="secondary"
          [outlined]="true"
          size="small"
          styleClass="pagination-button"
          [disabled]="!hasNext"
          (onClick)="goToNextPage()"
          ariaLabel="Próxima página"
        ></p-button>
        <p-button
          icon="pi pi-angle-double-right"
          severity="secondary"
          [outlined]="true"
          size="small"
          styleClass="pagination-button"
          [disabled]="!hasNext"
          (onClick)="goToLastPage()"
          ariaLabel="Última página"
        ></p-button>
      </div>

      <label class="pagination-size">
        <span class="pagination-size-label">Itens por página</span>
        <p-select
          [options]="pageSizeOptions"
          [ngModel]="size"
          (onChange)="handleSizeChange($event.value)"
          styleClass="pagination-size-select"
          ariaLabel="Itens por página"
        ></p-select>
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
      padding: 12px 16px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .pagination-summary {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }

    .pagination-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    :host ::ng-deep .pagination-button.p-button {
      width: 32px;
      height: 32px;
      padding: 0;
      color: #475569;
      border-color: #cbd5e1;
      background-color: #ffffff;
      border-radius: 4px;
      box-shadow: none;
    }

    :host ::ng-deep .pagination-button.p-button:not(:disabled):hover {
      background-color: #eef8ff;
      border-color: #0099ff;
      color: #065ca0;
    }

    :host ::ng-deep .pagination-button.p-button:disabled {
      background-color: #f8fafc;
      border-color: #e2e8f0;
      color: #cbd5e1;
      opacity: 1;
    }

    .pagination-size {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }

    :host ::ng-deep .pagination-size-select {
      width: 82px;
    }

    :host ::ng-deep .pagination-size-select.p-select {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      box-shadow: none;
    }

    :host ::ng-deep .pagination-size-select.p-select:not(.p-disabled):hover {
      border-color: #0099ff;
    }

    :host ::ng-deep .pagination-size-select .p-select-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #0f172a;
      padding: 0.42rem 0.55rem;
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
  @Input() itemNounSingular = 'motor';
  @Input() itemNounPlural = 'motores';
  @Input() ariaLabel = 'Paginação do catálogo de motores';
  @Input() pageSizeOptions: number[] = [12, 24, 48];
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

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

  handleSizeChange(size: number): void {
    this.sizeChange.emit(Number(size));
  }

  private goToPage(targetPage: number): void {
    const isOutOfRange = targetPage < 0 || targetPage >= this.totalPages;
    if (isOutOfRange || targetPage === this.page) {
      return;
    }
    this.pageChange.emit(targetPage);
  }
}