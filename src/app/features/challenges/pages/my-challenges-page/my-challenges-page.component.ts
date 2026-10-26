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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-my-challenges-page',
  standalone: true,
  imports: [
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
    ToastModule
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>
      <p-toast styleClass="challenge-toast"></p-toast>

      <main class="content-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">ALUNO</span>
            <h1 class="page-title">Meus Desafios</h1>
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
              <i class="fa-solid fa-graduation-cap empty-icon"></i>
              <h3>Nenhum desafio disponível</h3>
              <p>Você ainda não tem desafios atribuídos às suas turmas.</p>
            </div>
          }
        }
      </main>
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

    .challenges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
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

    @media (max-width: 768px) {
      .content-container {
        padding: 20px 16px 40px;
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
    private readonly messageService: MessageService,
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

  handleSelectChallenge(challenge: ChallengeModel): void {
    this.selectingId.set(challenge.id);
    this.challengeService.selectChallenge(challenge.id).subscribe({
      next: () => {
        this.selectingId.set(null);
        this.loadChallenges();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Desafio Selecionado', 
          detail: `"${challenge.title}" é agora o seu desafio ativo.` 
        });
      },
      error: () => {
        this.selectingId.set(null);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Não foi possível selecionar o desafio.' 
        });
      }
    });
  }

  handleGoToCalibration(challenge: ChallengeModel): void {
    this.router.navigate(['/calibration']);
  }
}
