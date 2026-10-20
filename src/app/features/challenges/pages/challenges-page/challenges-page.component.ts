import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { ChallengeModel, ChallengePayload, ChallengeQuery, ChallengeDifficulty } from '../../../../core/models/challenge.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';
import { ChallengeCardComponent } from '../../components/challenge-card/challenge-card.component';
import { ChallengeFormModalComponent } from '../../components/challenge-form-modal/challenge-form-modal.component';
import { ChallengePerformanceModalComponent } from '../../components/challenge-performance-modal/challenge-performance-modal.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-challenges-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderNavbarComponent,
    PaginationControlsComponent,
    ChallengeCardComponent,
    ChallengeFormModalComponent,
    ChallengePerformanceModalComponent,
    ButtonModule,
    InputTextModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>
      <p-toast styleClass="challenge-toast"></p-toast>
      <p-confirmDialog styleClass="challenge-confirm-dialog"></p-confirmDialog>

      <main class="content-container">
        <section class="page-header">
          <div class="header-content">
            <div class="page-header-text">
              <span class="category-tag">PROFESSOR</span>
              <h1 class="page-title">Desafios</h1>
              <p class="page-subtitle">Crie tarefas de calibração e atribua às turmas.</p>
            </div>
            <p-button
              label="Novo desafio"
              icon="pi pi-plus"
              styleClass="challenge-primary-button"
              (onClick)="openCreateModal()"
            ></p-button>
          </div>
        </section>

        <section class="filters-bar">
          <p-iconfield class="search-field">
            <p-inputicon class="pi pi-search"></p-inputicon>
            <input 
              type="text" 
              pInputText 
              placeholder="Buscar desafios..." 
              (input)="handleSearch($event)"
            />
          </p-iconfield>
          
          <p-select 
            [options]="difficultyFilters" 
            [(ngModel)]="selectedDifficulty" 
            placeholder="Dificuldade"
            (onChange)="loadChallenges()"
            [showClear]="true"
            styleClass="filter-dropdown"
          ></p-select>
        </section>

        @if (loading()) {
          <div class="loading-state">
            <p-progressSpinner
              styleClass="loading-spinner"
              strokeWidth="4"
              animationDuration="1s"
            ></p-progressSpinner>
          </div>
        } @else {
          @if (challengesPage()?.content?.length) {
            <div class="challenges-grid">
              @for (challenge of challengesPage()?.content; track challenge.id) {
                <app-challenge-card
                  [challenge]="challenge"
                  (viewPerformance)="openPerformanceModal($event)"
                  (edit)="openEditModal($event)"
                  (delete)="confirmDelete($event)"
                ></app-challenge-card>
              }
            </div>

            <app-pagination-controls
              [page]="query().page"
              [size]="query().size"
              [totalElements]="challengesPage()?.totalElements || 0"
              [totalPages]="challengesPage()?.totalPages || 0"
              [hasNext]="challengesPage()?.hasNext || false"
              [hasPrevious]="challengesPage()?.hasPrevious || false"
              (pageChange)="handlePageChange($event)"
              (sizeChange)="handleSizeChange($event)"
            ></app-pagination-controls>
          } @else {
            <div class="empty-state">
              <i class="fa-solid fa-bullseye empty-icon"></i>
              <h3>Nenhum desafio encontrado</h3>
              <p>Comece criando o seu primeiro desafio de calibração.</p>
              <p-button
                label="Criar Desafio"
                icon="pi pi-plus"
                [outlined]="true"
                styleClass="challenge-secondary-button"
                (onClick)="openCreateModal()"
              ></p-button>
            </div>
          }
        }
      </main>

      <app-challenge-form-modal
        *ngIf="showFormModal()"
        [challenge]="selectedChallenge()"
        [visible]="showFormModal()"
        [loading]="submitting()"
        (save)="handleSave($event)"
        (close)="closeFormModal()"
      ></app-challenge-form-modal>

      <app-challenge-performance-modal
        *ngIf="showPerformanceModal()"
        [challenge]="selectedChallenge()"
        [visible]="showPerformanceModal()"
        (close)="closePerformanceModal()"
      ></app-challenge-performance-modal>
    </div>
  `,
  styles: [`
    .page-layout {
      min-height: 100vh;
      background-color: #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .content-container {
      max-width: 1320px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px 64px;
      box-sizing: border-box;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
    }

    .category-tag {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .page-title {
      margin: 0 0 8px 0;
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
    }

    .page-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: #475569;
    }

    .filters-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    }

    .search-field {
      flex: 1;
    }

    :host ::ng-deep .search-field .p-inputtext {
      width: 100%;
      height: 42px;
      border-radius: 10px;
      border-color: #cbd5e1;
      box-shadow: none;
    }

    :host ::ng-deep .search-field .p-inputtext:enabled:focus {
      border-color: #0099ff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    :host ::ng-deep .search-field .p-inputicon {
      color: #94a3b8;
    }

    :host ::ng-deep .filter-dropdown.p-select {
      min-width: 190px;
      height: 42px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      box-shadow: none;
    }

    :host ::ng-deep .filter-dropdown.p-select:not(.p-disabled):hover {
      border-color: #0099ff;
    }

    :host ::ng-deep .challenge-primary-button.p-button {
      height: 44px;
      padding: 0 20px;
      border-radius: 10px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0, 153, 255, 0.25);
    }

    :host ::ng-deep .challenge-secondary-button.p-button {
      height: 44px;
      padding: 0 20px;
      border-radius: 10px;
      font-weight: 700;
      box-shadow: none;
      color: #065ca0;
      border-color: #bce4ff;
      background: #ffffff;
    }

    :host ::ng-deep .challenge-secondary-button.p-button:not(:disabled):hover {
      color: #065ca0;
      border-color: #0099ff;
      background: #eef8ff;
    }

    .challenges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 5rem;
      color: #0099ff;
    }

    :host ::ng-deep .loading-spinner {
      width: 44px;
      height: 44px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 56px 24px;
      background-color: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      text-align: center;
    }

    .empty-state h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
      color: #475569;
    }

    .empty-icon {
      font-size: 1.75rem;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    :host ::ng-deep .empty-state .challenge-secondary-button.p-button {
      margin-top: 12px;
    }

    @media (max-width: 768px) {
      .content-container {
        padding: 20px 16px 40px;
      }
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .page-title {
        font-size: 1.75rem;
      }
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }
      :host ::ng-deep .filter-dropdown.p-select {
        width: 100%;
      }
      .challenges-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ChallengesPageComponent implements OnInit {
  challengesPage = signal<PageResponse<ChallengeModel> | null>(null);
  loading = signal(false);
  submitting = signal(false);
  
  query = signal<ChallengeQuery>({
    page: 0,
    size: 12,
    sort: 'createdAt,DESC'
  });

  selectedDifficulty: ChallengeDifficulty | null = null;
  difficultyFilters = [
    { label: 'Fácil', value: 'EASY' },
    { label: 'Médio', value: 'MEDIUM' },
    { label: 'Difícil', value: 'HARD' }
  ];

  showFormModal = signal(false);
  showPerformanceModal = signal(false);
  selectedChallenge = signal<ChallengeModel | null>(null);

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {
    effect(() => {
      this.loadChallenges();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.loading.set(true);
    const currentQuery = { 
      ...this.query(), 
      difficulty: this.selectedDifficulty || undefined 
    };

    this.challengeService.getChallengesByTeacher(currentQuery).subscribe({
      next: (page) => {
        this.challengesPage.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Não foi possível carregar os desafios.' 
        });
      }
    });
  }

  handleSearch(event: any): void {
    const value = event.target.value;
    this.query.update(q => ({ ...q, search: value, page: 0 }));
  }

  handlePageChange(page: number): void {
    this.query.update(q => ({ ...q, page }));
  }

  handleSizeChange(size: number): void {
    this.query.update(q => ({ ...q, size, page: 0 }));
  }

  openCreateModal(): void {
    this.selectedChallenge.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(challenge: ChallengeModel): void {
    this.selectedChallenge.set(challenge);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.selectedChallenge.set(null);
  }

  handleSave(payload: ChallengePayload): void {
    this.submitting.set(true);
    const challenge = this.selectedChallenge();
    
    const request = challenge 
      ? this.challengeService.updateChallenge(challenge.id, payload)
      : this.challengeService.createChallenge(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeFormModal();
        this.loadChallenges();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Sucesso', 
          detail: `Desafio ${challenge ? 'atualizado' : 'criado'} com sucesso.` 
        });
      },
      error: () => {
        this.submitting.set(false);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Erro ao salvar o desafio.' 
        });
      }
    });
  }

  confirmDelete(challenge: ChallengeModel): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o desafio "${challenge.title}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.challengeService.deleteChallenge(challenge.id).subscribe({
          next: () => {
            this.loadChallenges();
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Sucesso', 
              detail: 'Desafio excluído com sucesso.' 
            });
          },
          error: () => {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Erro', 
              detail: 'Erro ao excluir o desafio.' 
            });
          }
        });
      }
    });
  }

  openPerformanceModal(challenge: ChallengeModel): void {
    this.selectedChallenge.set(challenge);
    this.showPerformanceModal.set(true);
  }

  closePerformanceModal(): void {
    this.showPerformanceModal.set(false);
    this.selectedChallenge.set(null);
  }
}
