import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PageResponse } from '../../../../core/models/pagination.model';
import {
  SHIFT_OPTIONS,
  ClassModel,
  ClassQuery,
  Shift,
  shiftLabel,
} from '../../../../core/models/class.model';
import { ClassService } from '../../../../core/services/class.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-my-classes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderNavbarComponent, PaginationControlsComponent],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">ALUNO</span>
            <h1 class="page-title">Minhas turmas</h1>
            <p class="page-subtitle">Turmas das quais você participa.</p>
          </div>
        </section>

        <section class="join-card" aria-label="Entrar em uma turma pelo código">
          <form class="join-form" (ngSubmit)="handleJoinSchoolClass()" novalidate>
            <div class="join-field">
              <i class="fa-solid fa-key join-icon" aria-hidden="true"></i>
              <input
                type="text"
                class="join-input"
                placeholder="Código da turma (ex.: AUT-2A)"
                aria-label="Código da turma"
                maxlength="10"
                [value]="joinCode"
                (input)="handleJoinCodeInput($event)"
              />
            </div>
            <button type="submit" class="primary-button join-button" [disabled]="isJoining">
              @if (isJoining) {
                <i class="pi pi-spin pi-spinner"></i>
                <span>Entrando...</span>
              } @else {
                <i class="fa-solid fa-plus" aria-hidden="true"></i>
                <span>Entrar</span>
              }
            </button>
          </form>
          @if (joinErrorMessage) {
            <div class="form-error-banner">{{ joinErrorMessage }}</div>
          }
        </section>

        <section class="filters-bar" aria-label="Busca e filtros de turmas">
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
            <input
              type="search"
              class="search-input"
              placeholder="Buscar por nome ou código..."
              aria-label="Buscar minhas turmas"
              (input)="handleSearchInput($event)"
            />
          </div>

          <select
            class="shift-select"
            aria-label="Filtrar por turno"
            [value]="selectedShift ?? ''"
            (change)="handleShiftChange($event)"
          >
            <option value="">Todos os turnos</option>
            @for (option of shiftOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </section>

        <section class="classes-section">
          @if (myClassesPage$ | async; as classesPage) {
            @if (classesPage.content.length > 0) {
              <div class="classes-grid" [class.is-refreshing]="isLoading">
                @for (schoolClass of classesPage.content; track schoolClass.id) {
                  <article class="class-card">
                    <header class="class-card-header">
                      <span class="class-card-icon" aria-hidden="true">
                        <i class="fa-solid fa-chalkboard-user"></i>
                      </span>
                      <span class="code-badge">{{ schoolClass.code }}</span>
                    </header>

                    <h2 class="class-card-title">{{ schoolClass.name }}</h2>
                    <p class="class-card-meta">
                      Prof. {{ schoolClass.professorName }} · {{ shiftLabel(schoolClass.shift) }}
                    </p>
                    <p class="class-card-count">
                      {{ schoolClass.studentCount }} aluno(s) matriculado(s)
                    </p>

                    <button
                      type="button"
                      class="leave-button"
                      [disabled]="leavingClassId === schoolClass.id"
                      (click)="handleLeaveSchoolClass(schoolClass)"
                    >
                      @if (leavingClassId === schoolClass.id) {
                        <i class="pi pi-spin pi-spinner"></i>
                        <span>Saindo...</span>
                      } @else {
                        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                        <span>Sair da turma</span>
                      }
                    </button>
                  </article>
                }
              </div>
              <app-pagination-controls
                [page]="classesPage.page"
                [size]="classesPage.size"
                [totalElements]="classesPage.totalElements"
                [totalPages]="classesPage.totalPages"
                [hasNext]="classesPage.hasNext"
                [hasPrevious]="classesPage.hasPrevious"
                itemNounSingular="schoolClass"
                itemNounPlural="school_classes"
                ariaLabel="Paginação das minhas turmas"
                [pageSizeOptions]="pageSizeOptions"
                (pageChange)="handlePageChange($event)"
                (sizeChange)="handleSizeChange($event)"
              ></app-pagination-controls>
            } @else {
              <div class="empty-state">
                <i class="fa-solid fa-chalkboard-user empty-state-icon"></i>
                <p class="empty-state-title">Você ainda não participa de nenhuma turma.</p>
                <p class="empty-state-text">
                  Peça o código ao professor e use o campo acima para entrar na turma.
                </p>
              </div>
            }
          }
        </section>
      </main>

      @if (feedbackMessage) {
        <div
          class="feedback-toast"
          [class.feedback-success]="isSuccess"
          [class.feedback-error]="!isSuccess"
        >
          {{ feedbackMessage }}
        </div>
      }
    </div>
  `,
  styles: [
    `
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
        padding: 32px 24px 64px 24px;
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

      .join-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      .join-form {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .join-field {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
      }

      .join-icon {
        position: absolute;
        left: 14px;
        color: #94a3b8;
        font-size: 0.85rem;
      }

      .join-input {
        width: 100%;
        height: 44px;
        padding: 0 14px 0 40px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #0f172a;
        background-color: #ffffff;
        box-sizing: border-box;
        text-transform: uppercase;
      }

      .join-input:focus {
        outline: none;
        border-color: #0099ff;
        box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
      }

      .primary-button {
        height: 44px;
        padding: 0 22px;
        border: none;
        border-radius: 10px;
        background-color: #0099ff;
        color: #ffffff;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-shrink: 0;
        transition: background-color 0.2s ease;
      }

      .primary-button:hover:not(:disabled) {
        background-color: #0088e6;
      }

      .primary-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .form-error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .filters-bar {
        display: flex;
        gap: 12px;
        align-items: center;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      .search-field {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 14px;
        color: #94a3b8;
        font-size: 0.85rem;
      }

      .search-input {
        width: 100%;
        height: 42px;
        padding: 0 14px 0 40px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.875rem;
        color: #0f172a;
        background-color: #ffffff;
        box-sizing: border-box;
      }

      .search-input:focus {
        outline: none;
        border-color: #0099ff;
        box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
      }

      .shift-select {
        height: 42px;
        padding: 0 34px 0 12px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        background-color: #ffffff;
        color: #334155;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
      }

      .shift-select:focus {
        outline: none;
        border-color: #0099ff;
        box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
      }
      .classes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        transition: opacity 0.2s ease;
      }

      .classes-grid.is-refreshing {
        opacity: 0.5;
      }

      .class-card {
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      .class-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .class-card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background-color: #e0f2fe;
        color: #0099ff;
        font-size: 1rem;
      }

      .code-badge {
        padding: 3px 8px;
        border-radius: 6px;
        background-color: #e0f2fe;
        color: #0369a1;
        font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      .class-card-title {
        margin: 0 0 8px 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
      }

      .class-card-meta {
        margin: 0 0 4px 0;
        font-size: 0.85rem;
        color: #475569;
      }

      .class-card-count {
        margin: 0 0 16px 0;
        font-size: 0.8rem;
        color: #64748b;
      }

      .leave-button {
        margin-top: auto;
        height: 42px;
        border: none;
        border-radius: 10px;
        background-color: #3f3f46;
        color: #ef4444;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background-color 0.15s ease;
      }

      .leave-button:hover:not(:disabled) {
        background-color: #27272a;
      }

      .leave-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

      .empty-state-icon {
        font-size: 1.75rem;
        color: #94a3b8;
        margin-bottom: 6px;
      }

      .empty-state-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 800;
        color: #0f172a;
      }

      .empty-state-text {
        margin: 0;
        font-size: 0.875rem;
        color: #475569;
      }

      .feedback-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        max-width: 420px;
        padding: 1rem 1.5rem;
        background-color: #1e293b;
        color: #ffffff;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
        z-index: 1100;
      }

      .feedback-toast.feedback-success {
        background-color: #10b981;
      }

      .feedback-toast.feedback-error {
        background-color: #dc2626;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 640px) {
        .content-container {
          padding: 20px 16px 40px 16px;
        }

        .page-title {
          font-size: 1.75rem;
        }

        .join-form,
        .filters-bar {
          flex-direction: column;
          align-items: stretch;
        }

        .feedback-toast {
          left: 16px;
          right: 16px;
          bottom: 16px;
        }
      }
    `,
  ],
})
export class MyClassesPageComponent implements OnInit, OnDestroy {
  private static readonly DEFAULT_PAGE_SIZE = 8;
  private static readonly SEARCH_DEBOUNCE_MILLISECONDS = 300;
  private static readonly FEEDBACK_TIMEOUT_MILLISECONDS = 4000;

  readonly pageSizeOptions: number[] = [8, 16, 32];
  readonly shiftOptions = SHIFT_OPTIONS;
  readonly shiftLabel = shiftLabel;

  myClassesPage$: Observable<PageResponse<ClassModel>>;

  isLoading = false;
  selectedShift: Shift | null = null;

  joinCode = '';
  isJoining = false;
  joinErrorMessage: string | null = null;

  leavingClassId: number | null = null;

  feedbackMessage = '';
  isSuccess = false;

  private readonly pageQuerySubject = new BehaviorSubject<ClassQuery>({
    search: '',
    shift: null,
    page: 0,
    size: MyClassesPageComponent.DEFAULT_PAGE_SIZE,
    sort: 'name,ASC',
  });
  private readonly searchInputSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly classService: ClassService) {
    this.myClassesPage$ = this.pageQuerySubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      switchMap((query) => this.loadMyClassesPage(query)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchInputSubject
      .pipe(
        debounceTime(MyClassesPageComponent.SEARCH_DEBOUNCE_MILLISECONDS),
        distinctUntilChanged(),
      )
      .subscribe((searchValue) => {
        this.pageQuerySubject.next({
          ...this.pageQuerySubject.getValue(),
          search: searchValue,
          page: 0,
        });
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.clearFeedbackTimeout();
  }

  handleJoinCodeInput(inputEvent: Event): void {
    const codeInput = inputEvent.target as HTMLInputElement;
    this.joinCode = codeInput.value.toUpperCase();
  }

  handleJoinSchoolClass(): void {
    if (this.isJoining) {
      return;
    }

    const normalizedCode = this.joinCode.trim();
    if (normalizedCode === '') {
      this.joinErrorMessage = 'Informe o código da turma.';
      return;
    }

    this.isJoining = true;
    this.joinErrorMessage = null;

    this.classService.joinClass(normalizedCode).subscribe({
      next: (joinedClass) => {
        this.isJoining = false;
        this.joinCode = '';
        this.showFeedback(
          `Você entrou na turma "${joinedClass.name}" (código ${joinedClass.code}).`,
          true,
        );
        this.pageQuerySubject.next({ ...this.pageQuerySubject.getValue(), page: 0 });
      },
      error: (error: HttpErrorResponse) => {
        this.isJoining = false;
        this.joinErrorMessage = this.buildErrorMessage(error, 'Não foi possível entrar na turma.');
      },
    });
  }

  handleSearchInput(inputEvent: Event): void {
    const searchInput = inputEvent.target as HTMLInputElement;
    this.searchInputSubject.next(searchInput.value);
  }

  handleShiftChange(changeEvent: Event): void {
    const shiftSelect = changeEvent.target as HTMLSelectElement;
    this.selectedShift = shiftSelect.value === '' ? null : (shiftSelect.value as Shift);
    this.pageQuerySubject.next({
      ...this.pageQuerySubject.getValue(),
      shift: this.selectedShift,
      page: 0,
    });
  }

  handlePageChange(targetPage: number): void {
    this.pageQuerySubject.next({ ...this.pageQuerySubject.getValue(), page: targetPage });
  }

  handleSizeChange(targetSize: number): void {
    this.pageQuerySubject.next({ ...this.pageQuerySubject.getValue(), page: 0, size: targetSize });
  }

  handleLeaveSchoolClass(schoolClass: ClassModel): void {
    if (this.leavingClassId !== null) {
      return;
    }

    this.leavingClassId = schoolClass.id;
    this.classService.leaveClass(schoolClass.id).subscribe({
      next: () => {
        this.leavingClassId = null;
        this.showFeedback(`Você saiu da turma "${schoolClass.name}".`, true);
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.leavingClassId = null;
        this.showFeedback(this.buildErrorMessage(error, 'Não foi possível sair da turma.'), false);
      },
    });
  }

  private loadMyClassesPage(query: ClassQuery): Observable<PageResponse<ClassModel>> {
    return this.classService.getMyClassesPage(query).pipe(
      tap(() => {
        this.isLoading = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível carregar as suas turmas.'),
          false,
        );
        return of(this.buildEmptyPage(query));
      }),
    );
  }

  private reloadCurrentPage(): void {
    this.pageQuerySubject.next({ ...this.pageQuerySubject.getValue() });
  }

  private buildEmptyPage(query: ClassQuery): PageResponse<ClassModel> {
    return {
      content: [],
      page: query.page,
      size: query.size,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
      sort: query.sort,
    };
  }

  private buildErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (error.status === 0) {
      return 'Não foi possível conectar a API de turmas. Verifique se o backend está em execução.';
    }
    if (error.status === 403) {
      return 'Acesso negado: você não tem permissão para executar esta ação.';
    }

    const apiError = error.error as { message?: string } | null;
    return apiError?.message ?? fallbackMessage;
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    this.feedbackMessage = message;
    this.isSuccess = isSuccess;
    this.clearFeedbackTimeout();

    this.feedbackTimeoutId = setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackTimeoutId = null;
    }, MyClassesPageComponent.FEEDBACK_TIMEOUT_MILLISECONDS);
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeoutId === null) {
      return;
    }
    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = null;
  }
}
