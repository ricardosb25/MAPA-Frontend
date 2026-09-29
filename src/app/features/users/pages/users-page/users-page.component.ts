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
  take,
  tap
} from 'rxjs';
import { AdminUserModel, AdminUserQuery } from '../../../../core/models/admin-user.model';
import { PageResponse } from '../../../../core/models/pagination.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';
import { AdminUserService } from '../../../../core/services/admin-user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, HeaderNavbarComponent, PaginationControlsComponent],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">ADMINISTRAÇÃO</span>
            <h1 class="page-title">Todos os usuários</h1>
            <p class="page-subtitle">
              {{ (usersPage$ | async)?.totalElements ?? 0 }} contas cadastradas.
            </p>
          </div>
        </section>

        <section class="filters-bar" aria-label="Filtros de usuários">
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
            <input
              type="search"
              class="search-input"
              placeholder="Buscar nome ou e-mail..."
              aria-label="Buscar nome ou e-mail"
              (input)="handleSearchInput($event)"
            />
          </div>

          <select
            class="profile-select"
            aria-label="Filtrar por perfil"
            [value]="selectedRole"
            (change)="handleRoleChange($event)"
          >
            <option value="">Todos perfis</option>
            <option value="ADMIN">Administrador</option>
            <option value="TEACHER">Professor</option>
            <option value="STUDENT">Aluno</option>
          </select>
        </section>
        <section class="users-section">
          @if (usersPage$ | async; as usersPage) {
            @if (usersPage.content.length > 0) {
              <div class="table-card" [class.is-refreshing]="isLoading">
                <div class="table-scroll">
                  <table class="users-table">
                    <thead>
                      <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">E-mail</th>
                        <th scope="col">Perfil</th>
                        <th scope="col">Cadastro</th>
                        <th scope="col">Status</th>
                        <th scope="col" class="action-column">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (user of usersPage.content; track user.id) {
                        <tr>
                          <td class="cell-name">{{ user.fullName }}</td>
                          <td class="cell-email">{{ user.email }}</td>
                          <td class="cell-profile">
                            <span class="profile-badge" [ngClass]="'profile-' + user.role.toLowerCase()">
                              {{ getRoleLabel(user.role) }}
                            </span>
                          </td>
                          <td class="cell-date">{{ user.createdAt | date: 'yyyy-MM-dd' }}</td>
                          <td class="cell-status">
                            <span
                              class="status-badge"
                              [class.status-active]="user.active"
                              [class.status-inactive]="!user.active"
                            >
                              {{ user.active ? 'ativo' : 'inativo' }}
                            </span>
                          </td>
                          <td class="cell-action">
                            <button
                              type="button"
                              class="toggle-button"
                              [class.toggle-activate]="!user.active"
                              [disabled]="isToggling || isOwnAccount(user)"
                              [attr.title]="isOwnAccount(user) ? 'Você não pode alterar a própria conta' : null"
                              (click)="handleToggleActive(user)"
                            >
                              {{ user.active ? 'Desativar' : 'Ativar' }}
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <app-pagination-controls
                [page]="usersPage.page"
                [size]="usersPage.size"
                [totalElements]="usersPage.totalElements"
                [totalPages]="usersPage.totalPages"
                [hasNext]="usersPage.hasNext"
                [hasPrevious]="usersPage.hasPrevious"
                [pageSizeOptions]="pageSizeOptions"
                itemNounSingular="conta"
                itemNounPlural="contas"
                ariaLabel="Paginação dos usuários"
                (pageChange)="handlePageChange($event)"
                (sizeChange)="handleSizeChange($event)"
              ></app-pagination-controls>
            } @else {
              <div class="empty-state">
                <i class="fa-solid fa-user-slash empty-state-icon"></i>
                <p class="empty-state-title">Nenhum usuário encontrado.</p>
                <p class="empty-state-text">Ajuste a busca ou o filtro de perfil para encontrar contas.</p>
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

    .profile-select {
      height: 44px;
      min-width: 180px;
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

    .profile-select:focus {
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

    .users-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
    }

    .users-table th {
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

    .users-table td {
      padding: 13px 20px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.85rem;
      color: #334155;
      vertical-align: middle;
    }

    .users-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .users-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .users-table tbody tr:last-child td {
      border-bottom: none;
    }

    .action-column,
    .cell-action {
      text-align: right;
    }

    .cell-name {
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    .cell-email {
      color: #475569;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
      font-size: 0.78rem;
    }

    .cell-date {
      font-size: 0.76rem;
      color: #475569;
      white-space: nowrap;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
    }

    .profile-badge,
    .status-badge {
      display: inline-block;
      min-width: 56px;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-align: center;
      font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
      white-space: nowrap;
    }

    .profile-admin {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .profile-teacher {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .profile-student {
      background-color: #334155;
      color: #f8fafc;
    }

    .status-active {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .status-inactive {
      background-color: #fef3c7;
      color: #d97706;
    }

    .toggle-button {
      border: none;
      background: none;
      padding: 4px 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #0099ff;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .toggle-button:hover:not(:disabled) {
      background-color: #e0f2fe;
    }

    .toggle-button.toggle-activate {
      color: #16a34a;
    }

    .toggle-button.toggle-activate:hover:not(:disabled) {
      background-color: #dcfce7;
    }

    .toggle-button:disabled {
      opacity: 0.45;
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
      .search-field {
        flex: 1 1 100%;
      }
      .profile-select {
        width: 100%;
      }
      .feedback-toast {
        left: 16px;
        right: 16px;
        bottom: 16px;
      }
    }


    `
  ]
})
export class UsersPageComponent implements OnInit, OnDestroy {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly SEARCH_DEBOUNCE_MILLISECONDS = 300;
  private static readonly FEEDBACK_TIMEOUT_MILLISECONDS = 4000;

  readonly pageSizeOptions: number[] = [10, 20, 50];

  usersPage$!: Observable<PageResponse<AdminUserModel>>;
  isLoading = false;
  isToggling = false;
  selectedRole: UserProfileType | '' = '';
  feedbackMessage = '';
  isSuccess = false;

  private currentUserId: string | null = null;
  private readonly pageQuerySubject = new BehaviorSubject<AdminUserQuery>({
    search: '',
    role: null,
    page: 0,
    size: UsersPageComponent.DEFAULT_PAGE_SIZE,
    sort: 'createdAt,ASC'
  });
  private readonly searchInputSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usersPage$ = this.pageQuerySubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      switchMap((query) => this.loadUsersPage(query)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.searchSubscription = this.searchInputSubject
      .pipe(debounceTime(UsersPageComponent.SEARCH_DEBOUNCE_MILLISECONDS), distinctUntilChanged())
      .subscribe((searchTerm) => {
        const currentQuery = this.pageQuerySubject.getValue();
        this.pageQuerySubject.next({ ...currentQuery, search: searchTerm, page: 0 });
      });

    this.authService.currentUser$.pipe(take(1)).subscribe((currentUser) => {
      this.currentUserId = currentUser?.id ?? null;
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.clearFeedbackTimeout();
  }

  getRoleLabel(role: UserProfileType): string {
    if (role === UserProfileType.ADMIN) {
      return 'Administrador';
    }

    if (role === UserProfileType.TEACHER) {
      return 'Professor';
    }

    return 'Aluno';
  }

  isOwnAccount(user: AdminUserModel): boolean {
    return this.currentUserId !== null && String(user.id) === String(this.currentUserId);
  }

  handleSearchInput(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    this.searchInputSubject.next(searchInput.value);
  }

  handleRoleChange(event: Event): void {
    const roleSelect = event.target as HTMLSelectElement;
    const nextRole = roleSelect.value as UserProfileType | '';
    this.selectedRole = nextRole;

    const currentQuery = this.pageQuerySubject.getValue();
    this.pageQuerySubject.next({
      ...currentQuery,
      role: nextRole === '' ? null : nextRole,
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

  handleToggleActive(user: AdminUserModel): void {
    if (this.isToggling || this.isOwnAccount(user)) {
      return;
    }

    const nextActiveState = !user.active;
    this.isToggling = true;

    this.adminUserService
      .updateUser(user.id, {
        fullName: user.fullName,
        email: user.email,
        active: nextActiveState
      })
      .subscribe({
        next: () => {
          this.isToggling = false;
          this.showFeedback(
            `Conta de ${user.fullName} ${nextActiveState ? 'ativada' : 'desativada'} com sucesso.`,
            true
          );
          this.pageQuerySubject.next(this.pageQuerySubject.getValue());
        },
        error: (error: HttpErrorResponse) => {
          this.isToggling = false;
          this.showFeedback(
            this.buildErrorMessage(error, 'Não foi possível atualizar a situação da conta.'),
            false
          );
        }
      });
  }

  private loadUsersPage(query: AdminUserQuery): Observable<PageResponse<AdminUserModel>> {
    return this.adminUserService.getUsersPage(query).pipe(
      switchMap((usersPage) => this.resolvePageBoundaries(usersPage, query)),
      tap(() => {
        this.isLoading = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível carregar os usuários.'),
          false
        );
        return of(this.buildEmptyPage(query));
      })
    );
  }

  private resolvePageBoundaries(
    usersPage: PageResponse<AdminUserModel>,
    query: AdminUserQuery
  ): Observable<PageResponse<AdminUserModel>> {
    const isCurrentPageEmpty =
      usersPage.page > 0 && usersPage.content.length === 0 && usersPage.totalElements > 0;
    const lastAvailablePage = Math.max(usersPage.totalPages - 1, 0);

    if (isCurrentPageEmpty && lastAvailablePage !== usersPage.page) {
      setTimeout(() => this.handlePageChange(lastAvailablePage));
    }

    return of(usersPage);
  }

  private buildEmptyPage(query: AdminUserQuery): PageResponse<AdminUserModel> {
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
      return 'Não foi possível conectar à API de usuários. Verifique se o backend está em execução.';
    }

    if (error.status === 403) {
      return 'Acesso negado: apenas administradores podem gerenciar usuários.';
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
    }, UsersPageComponent.FEEDBACK_TIMEOUT_MILLISECONDS);
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeoutId === null) {
      return;
    }

    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = null;
  }
}


