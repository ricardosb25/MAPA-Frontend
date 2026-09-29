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
  switchMap,
  tap
} from 'rxjs';
import { AuditLogLevel, AuditLogModel, AuditLogQuery } from '../../../../core/models/audit-log.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, HeaderNavbarComponent, PaginationControlsComponent],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">ADMINISTRAÇÃO</span>
            <h1 class="page-title">Logs salvos</h1>
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
              <div class="empty-state">
                <i class="fa-solid fa-inbox empty-state-icon"></i>
                <p class="empty-state-title">Nenhum log encontrado.</p>
                <p class="empty-state-text">
                  Ajuste os filtros ou aguarde novas ações serem registradas na plataforma.
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
      padding: 32px 24px 64px 24px;
      box-sizing: border-box;
    }

    .page-header {
      margin-bottom: 28px;
    }

    .category-tag {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #64748b;
      text-transform: uppercase;
      display: block;
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
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background-color: #ffffff;
      font-size: 0.875rem;
      color: #0f172a;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .search-input::placeholder {
      color: #94a3b8;
    }

    .search-input:focus {
      outline: none;
      border-color: #0099ff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .level-select {
      height: 44px;
      min-width: 170px;
      padding: 0 34px 0 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      background-color: #ffffff;
      color: #0f172a;
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
      border-color: #0099ff;
      box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
    }

    .table-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
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
      color: #64748b;
      text-align: left;
      padding: 14px 20px;
      border-bottom: 1px solid #e2e8f0;
      background-color: #f8fafc;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
      white-space: nowrap;
    }

    .logs-table td {
      padding: 13px 20px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.85rem;
      color: #334155;
      vertical-align: middle;
    }

    .logs-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .logs-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .logs-table tbody tr:last-child td {
      border-bottom: none;
    }

    .cell-date {
      font-size: 0.76rem;
      color: #475569;
      white-space: nowrap;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
    }

    .cell-user {
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    .cell-action {
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
    }

    .detail-primary {
      display: block;
      color: #475569;
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
      .search-field {
        flex: 1 1 100%;
      }
      .level-select {
        width: 100%;
      }
      .feedback-toast {
        left: 16px;
        right: 16px;
        bottom: 16px;
      }
    }
  `]
})
export class LogsPageComponent implements OnInit, OnDestroy {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly SEARCH_DEBOUNCE_MILLISECONDS = 300;
  private static readonly FEEDBACK_TIMEOUT_MILLISECONDS = 4000;

  readonly pageSizeOptions: number[] = [10, 20, 50];

  logsPage$!: Observable<PageResponse<AuditLogModel>>;
  isLoading = false;
  selectedLevel: AuditLogLevel | '' = '';
  feedbackMessage = '';
  isSuccess = false;

  private readonly pageQuerySubject = new BehaviorSubject<AuditLogQuery>({
    search: '',
    level: null,
    page: 0,
    size: LogsPageComponent.DEFAULT_PAGE_SIZE,
    sort: 'createdAt,DESC'
  });
  private readonly searchInputSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
    this.clearFeedbackTimeout();
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
    this.feedbackMessage = message;
    this.isSuccess = isSuccess;
    this.clearFeedbackTimeout();

    this.feedbackTimeoutId = setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackTimeoutId = null;
    }, LogsPageComponent.FEEDBACK_TIMEOUT_MILLISECONDS);
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeoutId === null) {
      return;
    }

    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = null;
  }
}