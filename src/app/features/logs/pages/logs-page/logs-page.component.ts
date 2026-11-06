import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
  switchMap,
  tap
} from 'rxjs';
import { AuditLogLevel, AuditLogModel, AuditLogQuery } from '../../../../core/models/audit-log.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [EmptyStateComponent, CommonModule, HeaderNavbarComponent, LoadingComponent, PaginationControlsComponent],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="mapa-page-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">ADMINISTRAÇÃO</span>
            <h1 class="mapa-page-title">Logs salvos</h1>
            <p class="page-subtitle">Histórico de ações dos usuários na plataforma.</p>
          </div>
        </section>

        <section class="filters-bar" aria-label="Filtros dos logs">
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
            <input
              type="search"
              class="search-input"
              placeholder="Buscar usuário ou ação..."
              aria-label="Buscar usuário ou ação"
              (input)="handleSearchInput($event)"
            />
          </div>

          <select
            class="level-select"
            aria-label="Filtrar por nível"
            [value]="selectedLevel"
            (change)="handleLevelChange($event)"
          >
            <option value="">Todos níveis</option>
            <option value="INFO">INFO</option>
            <option value="AVISO">AVISO</option>
            <option value="ERRO">ERRO</option>
          </select>
        </section>

        <section class="logs-section">
          @if (logsPage$ | async; as logsPage) {
            @if (logsPage.content.length > 0) {
              <div class="table-card" [class.is-refreshing]="isLoading">
                <div class="table-scroll">
                  <table class="logs-table">
                    <thead>
                      <tr>
                        <th scope="col">Data/hora</th>
                        <th scope="col">Usuário</th>
                        <th scope="col">Ação</th>
                        <th scope="col">Detalhe</th>
                        <th scope="col" class="level-column">Nível</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (log of logsPage.content; track log.id) {
                        <tr>
                          <td class="cell-date">{{ log.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
                          <td class="cell-user">{{ log.actorEmail ?? 'Sistema' }}</td>
                          <td class="cell-action">{{ log.actionLabel }}</td>
                          <td class="cell-detail">
                            <span class="detail-primary">{{ log.details || log.actionLabel }}</span>
                            @if (log.targetEmail) {
                              <span class="detail-target">{{ log.targetEmail }}</span>
                            }
                          </td>
                          <td class="cell-level">
                            <span class="level-badge" [ngClass]="'level-' + log.level.toLowerCase()">
                              {{ log.level }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <app-pagination-controls
                [page]="logsPage.page"
                [size]="logsPage.size"
                [totalElements]="logsPage.totalElements"
                [totalPages]="logsPage.totalPages"
                [hasNext]="logsPage.hasNext"
                [hasPrevious]="logsPage.hasPrevious"
                [pageSizeOptions]="pageSizeOptions"
                itemNounSingular="registro"
                itemNounPlural="registros"
                ariaLabel="Paginação dos logs de auditoria"
                (pageChange)="handlePageChange($event)"
                (sizeChange)="handleSizeChange($event)"
              ></app-pagination-controls>
            } @else {
              <app-empty-state icon="fa-solid fa-inbox" title="Nenhum log encontrado." description="Ajuste os filtros ou aguarde novas ações serem registradas na plataforma."></app-empty-state>
            }
          } @else {
            <app-loading message="Carregando registros..."></app-loading>
          }
        </section>
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
      margin-bottom: 28px;
    }

    .category-tag {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--mapa-gray-500);
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }

    .page-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: var(--mapa-gray-600);
      line-height: 1.5;
    }

    .filters-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .search-field {
      position: relative;
      flex: 0 1 360px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 0.85rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      height: 44px;
      padding: 0 14px 0 40px;
      border: 1px solid var(--mapa-gray-300);
      border-radius: 10px;
      background-color: var(--mapa-white);
      font-size: 0.875rem;
      color: var(--mapa-ink);
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .search-input::placeholder {
      color: #94a3b8;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--mapa-blue-500);
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .level-select {
      height: 44px;
      min-width: 170px;
      padding: 0 34px 0 14px;
      border: 1px solid var(--mapa-gray-300);
      border-radius: 10px;
      background-color: var(--mapa-white);
      color: var(--mapa-ink);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .level-select:focus {
      outline: none;
      border-color: var(--mapa-blue-500);
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .table-card {
      background-color: var(--mapa-white);
      border: 1px solid var(--mapa-gray-200);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      transition: opacity 0.2s ease;
    }

    .table-card.is-refreshing {
      opacity: 0.5;
    }

    .table-scroll {
      overflow-x: auto;
    }

    .logs-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 860px;
    }

    .logs-table th {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--mapa-gray-500);
      text-align: left;
      padding: 14px 20px;
      border-bottom: 1px solid var(--mapa-gray-200);
      background-color: var(--mapa-gray-50);
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
      white-space: nowrap;
    }

    .logs-table td {
      padding: 13px 20px;
      border-bottom: 1px solid var(--mapa-gray-100);
      font-size: 0.85rem;
      color: var(--mapa-gray-700);
      vertical-align: middle;
    }

    .logs-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .logs-table tbody tr:hover {
      background-color: var(--mapa-gray-50);
    }

    .logs-table tbody tr:last-child td {
      border-bottom: none;
    }

    .cell-date {
      font-size: 0.76rem;
      color: var(--mapa-gray-600);
      white-space: nowrap;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
    }

    .cell-user {
      font-weight: 700;
      color: var(--mapa-ink);
      white-space: nowrap;
    }

    .cell-action {
      font-weight: 600;
      color: var(--mapa-ink);
      white-space: nowrap;
    }

    .detail-primary {
      display: block;
      color: var(--mapa-gray-600);
    }

    .detail-target {
      display: block;
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 2px;
    }

    .level-column,
    .cell-level {
      text-align: right;
    }

    .level-badge {
      display: inline-block;
      min-width: 56px;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-align: center;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
    }

    .level-info {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .level-aviso {
      background-color: #fef3c7;
      color: #d97706;
    }

    .level-erro {
      background-color: #fee2e2;
      color: #dc2626;
    }

    @media (max-width: 640px) {
      .mapa-page-container {
        padding: 20px 16px 40px 16px;
      }
      .mapa-page-title {
        font-size: 1.75rem;
      }
      .search-field {
        flex: 1 1 100%;
      }
      .level-select {
        width: 100%;
      }
    }
  `]
})
export class LogsPageComponent implements OnInit, OnDestroy {
  private readonly feedbackService = inject(FeedbackService);
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly SEARCH_DEBOUNCE_MILLISECONDS = 300;

  readonly pageSizeOptions: number[] = [10, 20, 50];

  logsPage$!: Observable<PageResponse<AuditLogModel>>;
  isLoading = false;
  selectedLevel: AuditLogLevel | '' = '';

  private readonly pageQuerySubject = new BehaviorSubject<AuditLogQuery>({
    search: '',
    level: null,
    page: 0,
    size: LogsPageComponent.DEFAULT_PAGE_SIZE,
    sort: 'createdAt,DESC'
  });
  private readonly searchInputSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(private readonly auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.logsPage$ = this.pageQuerySubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      switchMap((query) => this.loadLogsPage(query))
    );

    this.searchSubscription = this.searchInputSubject
      .pipe(debounceTime(LogsPageComponent.SEARCH_DEBOUNCE_MILLISECONDS), distinctUntilChanged())
      .subscribe((searchTerm) => {
        const currentQuery = this.pageQuerySubject.getValue();
        this.pageQuerySubject.next({ ...currentQuery, search: searchTerm, page: 0 });
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  handleSearchInput(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    this.searchInputSubject.next(searchInput.value);
  }

  handleLevelChange(event: Event): void {
    const levelSelect = event.target as HTMLSelectElement;
    const nextLevel = levelSelect.value as AuditLogLevel | '';
    this.selectedLevel = nextLevel;

    const currentQuery = this.pageQuerySubject.getValue();
    this.pageQuerySubject.next({
      ...currentQuery,
      level: nextLevel === '' ? null : nextLevel,
      page: 0
    });
  }

  handlePageChange(targetPage: number): void {
    const currentQuery = this.pageQuerySubject.getValue();
    this.pageQuerySubject.next({ ...currentQuery, page: targetPage });
  }

  handleSizeChange(targetSize: number): void {
    const currentQuery = this.pageQuerySubject.getValue();
    this.pageQuerySubject.next({ ...currentQuery, page: 0, size: targetSize });
  }

  private loadLogsPage(query: AuditLogQuery): Observable<PageResponse<AuditLogModel>> {
    return this.auditLogService.getAuditLogsPage(query).pipe(
      switchMap((logsPage) => this.resolvePageBoundaries(logsPage, query)),
      tap(() => {
        this.isLoading = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível carregar os logs.'),
          false
        );
        return of(this.buildEmptyPage(query));
      })
    );
  }

  private resolvePageBoundaries(
    logsPage: PageResponse<AuditLogModel>,
    query: AuditLogQuery
  ): Observable<PageResponse<AuditLogModel>> {
    const isCurrentPageEmpty =
      logsPage.page > 0 && logsPage.content.length === 0 && logsPage.totalElements > 0;
    const lastAvailablePage = Math.max(logsPage.totalPages - 1, 0);

    if (isCurrentPageEmpty && lastAvailablePage !== logsPage.page) {
      setTimeout(() => this.handlePageChange(lastAvailablePage));
    }

    return of(logsPage);
  }

  private buildEmptyPage(query: AuditLogQuery): PageResponse<AuditLogModel> {
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
      sort: query.sort
    };
  }

  private buildErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (error.status === 0) {
      return 'Não foi possível conectar à API de auditoria. Verifique se o backend está em execução.';
    }

    if (error.status === 403) {
      return 'Acesso negado: apenas administradores podem consultar os logs.';
    }

    const apiError = error.error as { message?: string } | null;
    return apiError?.message ?? fallbackMessage;
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    if (isSuccess) this.feedbackService.showSuccess('Sucesso', message);
    else this.feedbackService.showError('Erro', message);
  }

}