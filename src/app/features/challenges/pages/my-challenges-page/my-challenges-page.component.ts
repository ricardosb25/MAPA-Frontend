import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { ChallengeModel, ChallengeQuery, ChallengeDifficulty } from '../../../../core/models/challenge.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';
import { StudentChallengeCardComponent } from '../../components/student-challenge-card/student-challenge-card.component';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FeedbackService } from '../../../../shared/services/feedback.service';

@Component({
  selector: 'app-my-challenges-page',
  standalone: true,
  imports: [EmptyStateComponent, 
    CommonModule,
    FormsModule,
    HeaderNavbarComponent,
    LoadingComponent,
    PaginationControlsComponent,
    StudentChallengeCardComponent,
    InputTextModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="mapa-page-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">ALUNO</span>
            <h1 class="mapa-page-title">Meus Desafios</h1>
            <p class="page-subtitle">Escolha um desafio ativo e comece a calibrar.</p>
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
                <app-student-challenge-card
                  [challenge]="challenge"
                  [loading]="selectingId() === challenge.id"
                  (select)="handleSelectChallenge($event)"
                  (goToCalibration)="handleGoToCalibration($event)"
                ></app-student-challenge-card>
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
            <app-empty-state icon="fa-solid fa-graduation-cap" title="Nenhum desafio disponível" description="Você ainda não tem desafios atribuídos às suas turmas."></app-empty-state>
          }
        }
      </main>
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
export class MyChallengesPageComponent implements OnInit {
  challengesPage = signal<PageResponse<ChallengeModel> | null>(null);
  loading = signal(false);
  selectingId = signal<number | null>(null);
  
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

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly feedbackService: FeedbackService,
    private readonly router: Router
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

    this.challengeService.getAvailableChallengesForStudent(currentQuery).subscribe({
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

  handleSelectChallenge(challenge: ChallengeModel): void {
    this.selectingId.set(challenge.id);
    this.challengeService.selectChallenge(challenge.id).subscribe({
      next: () => {
        this.selectingId.set(null);
        this.loadChallenges();
        this.feedbackService.showSuccess('Desafio Selecionado', `"${challenge.title}" é agora o seu desafio ativo.`);
      },
      error: () => {
        this.selectingId.set(null);
        this.feedbackService.showError('Erro', 'Não foi possível selecionar o desafio.');
      }
    });
  }

  handleGoToCalibration(challenge: ChallengeModel): void {
    this.router.navigate(['/calibration']);
  }
}
