import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { ChallengeModel, ChallengePayload, ChallengeQuery, ChallengeDifficulty } from '../../../../core/models/challenge.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';
import { ChallengeCardComponent } from '../../components/challenge-card/challenge-card.component';
import { ChallengeFormModalComponent } from '../../components/challenge-form-modal/challenge-form-modal.component';
import { ChallengePerformanceModalComponent } from '../../components/challenge-performance-modal/challenge-performance-modal.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-challenges-page',
  standalone: true,
  imports: [EmptyStateComponent, 
    CommonModule,
    FormsModule,
    HeaderNavbarComponent,
    LoadingComponent,
    PaginationControlsComponent,
    ChallengeCardComponent,
    ChallengeFormModalComponent,
    ChallengePerformanceModalComponent,
    ButtonModule,
    InputTextModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>
      @if (challengeBeingDeleted(); as challenge) {
        <app-confirm-dialog title="Excluir desafio" [message]="'Deseja excluir o desafio ' + challenge.title + '?'"
          confirmButtonLabel="Excluir desafio" confirmingLabel="Excluindo desafio..." [confirmationRequired]="false"
          [isConfirming]="deletingChallenge()" [errorMessage]="deletionError()"
          (confirm)="handleConfirmDelete()" (cancel)="handleCancelDelete()" />
      }

      <main class="mapa-page-container">
        <section class="page-header">
          <div class="header-content">
            <div class="page-header-text">
              <span class="category-tag">PROFESSOR</span>
              <h1 class="mapa-page-title">Desafios</h1>
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
          <app-loading variant="page" message="Carregando desafios..."></app-loading>
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

            <app-pagination-controls itemNounSingular="desafio" itemNounPlural="desafios" ariaLabel="Paginação dos desafios"
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
            <app-empty-state icon="fa-solid fa-bullseye" title="Nenhum desafio encontrado" description="Comece criando o seu primeiro desafio de calibração."><p-button
                label="Criar Desafio"
                icon="pi pi-plus"
                [outlined]="true"
                styleClass="challenge-secondary-button"
                (onClick)="openCreateModal()"
              ></p-button></app-empty-state>
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
      background-color: var(--mapa-page-background);
      display: flex;
      flex-direction: column;
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
      color: var(--mapa-gray-500);
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .page-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: var(--mapa-gray-600);
    }

    .filters-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      background-color: var(--mapa-white);
      border: 1px solid var(--mapa-gray-200);
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
      border-color: var(--mapa-gray-300);
      box-shadow: none;
    }

    :host ::ng-deep .search-field .p-inputtext:enabled:focus {
      border-color: var(--mapa-blue-500);
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    :host ::ng-deep .search-field .p-inputicon {
      color: #94a3b8;
    }

    :host ::ng-deep .filter-dropdown.p-select {
      min-width: 190px;
      height: 42px;
      border: 1px solid var(--mapa-gray-300);
      border-radius: 10px;
      box-shadow: none;
    }

    :host ::ng-deep .filter-dropdown.p-select:not(.p-disabled):hover {
      border-color: var(--mapa-blue-500);
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
      color: var(--mapa-blue-800);
      border-color: var(--mapa-blue-200);
      background: var(--mapa-white);
    }

    :host ::ng-deep .challenge-secondary-button.p-button:not(:disabled):hover {
      color: var(--mapa-blue-800);
      border-color: var(--mapa-blue-500);
      background: var(--mapa-blue-50);
    }

    .challenges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .mapa-page-container {
        padding: 20px 16px 40px;
      }
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .mapa-page-title {
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
  readonly challengeBeingDeleted = signal<ChallengeModel | null>(null);
  readonly deletingChallenge = signal(false);
  readonly deletionError = signal('');

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly feedbackService: FeedbackService,
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
        this.feedbackService.showError('Erro', 'Não foi possível carregar os desafios.');
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
        this.feedbackService.showSuccess('Sucesso', `Desafio ${challenge ? 'atualizado' : 'criado'} com sucesso.`);
      },
      error: () => {
        this.submitting.set(false);
        this.feedbackService.showError('Erro', 'Erro ao salvar o desafio.');
      }
    });
  }

  confirmDelete(challenge: ChallengeModel): void {
    this.deletionError.set('');
    this.challengeBeingDeleted.set(challenge);
  }

  handleCancelDelete(): void {
    if (!this.deletingChallenge()) this.challengeBeingDeleted.set(null);
  }

  handleConfirmDelete(): void {
    const challenge = this.challengeBeingDeleted();
    if (!challenge || this.deletingChallenge()) return;
    this.deletingChallenge.set(true);
    this.deletionError.set('');
    this.challengeService.deleteChallenge(challenge.id).subscribe({
      next: () => {
        this.deletingChallenge.set(false);
        this.challengeBeingDeleted.set(null);
        this.loadChallenges();
        this.feedbackService.showSuccess('Sucesso', 'Desafio excluído com sucesso.');
      },
      error: () => {
        this.deletingChallenge.set(false);
        this.deletionError.set('Erro ao excluir o desafio. Tente novamente.');
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
