import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap } from 'rxjs';
import {
  EngineModel,
  EnginePageQuery,
  EnginePayload,
  PageResponse
} from '../../../../core/models/engine.model';
import { AuthService } from '../../../../core/services/auth.service';
import { EngineService } from '../../../../core/services/engine.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';
import { EngineCardComponent } from '../../components/engine-card/engine-card.component';
import { EngineFormModalComponent } from '../../components/engine-form-modal/engine-form-modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-garage-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderNavbarComponent,
    PaginationControlsComponent,
    EngineCardComponent,
    EngineFormModalComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">CATÁLOGO</span>
            <h1 class="page-title">Garagem de motores</h1>
            <p class="page-subtitle">
              Selecione a base mecânica. Os mapas voltam ao padrão de fábrica ao trocar de motor.
            </p>
          </div>

          @if (authService.isAdmin$ | async) {
            <button type="button" class="create-engine-button" (click)="handleOpenCreateForm()">
              <i class="fa-solid fa-plus"></i>
              <span>Cadastrar motor</span>
            </button>
          }
        </section>

        <section class="engines-grid-section">
          @if (enginesPage$ | async; as enginesPage) {
            @if (enginesPage.content.length > 0) {
              <div class="engines-grid" [class.is-refreshing]="isLoading">
                <app-engine-card
                  *ngFor="let engine of enginesPage.content; trackBy: trackByEngineId"
                  [engine]="engine"
                  [canManage]="(authService.isAdmin$ | async) ?? false"
                  (selectEngine)="handleSelectEngine($event)"
                  (editEngine)="handleOpenEditForm($event)"
                  (deleteEngine)="handleDeleteRequest($event)"
                ></app-engine-card>
              </div>
            } @else {
              <div class="empty-state">
                <i class="fa-solid fa-warehouse empty-state-icon"></i>
                <p class="empty-state-title">Nenhum motor por aqui.</p>
                <p class="empty-state-text">
                  Cadastre um novo motor para começar a montar o catálogo da turma.
                </p>
              </div>
            }

            <app-pagination-controls
              [page]="enginesPage.page"
              [size]="enginesPage.size"
              [totalElements]="enginesPage.totalElements"
              [totalPages]="enginesPage.totalPages"
              [hasNext]="enginesPage.hasNext"
              [hasPrevious]="enginesPage.hasPrevious"
              (pageChange)="handlePageChange($event)"
              (sizeChange)="handleSizeChange($event)"
            ></app-pagination-controls>
          }
        </section>
      </main>

      @if (isFormModalOpen) {
        <app-engine-form-modal
          [engine]="engineBeingEdited"
          [isSubmitting]="isSubmittingForm"
          [serverFieldErrors]="formServerFieldErrors"
          [errorMessage]="formErrorMessage"
          (submitEngineForm)="handleSubmitEngineForm($event)"
          (closeModal)="handleCloseFormModal()"
        ></app-engine-form-modal>
      }

      @if (isDeleteDialogOpen) {
        <app-confirm-dialog
          title="Excluir motor"
          [message]="deleteDialogMessage"
          confirmationLabel="Confirmo que desejo excluir este motor do catálogo. Esta ação não pode ser desfeita."
          [isConfirming]="isConfirmingDelete"
          [errorMessage]="deleteErrorMessage"
          (confirm)="handleConfirmDelete()"
          (cancel)="handleCancelDelete()"
        ></app-confirm-dialog>
      }

      @if (feedbackMessage) {
        <div class="feedback-toast" [class.feedback-success]="isSuccess" [class.feedback-error]="!isSuccess">
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
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 32px;
    }

    .page-header-text {
      max-width: 720px;
    }

    .create-engine-button {
      flex-shrink: 0;
      height: 44px;
      padding: 0 20px;
      border: none;
      border-radius: 10px;
      background-color: #0099ff;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0, 153, 255, 0.25);
      transition: background-color 0.2s ease, transform 0.1s ease;
    }

    .create-engine-button:hover {
      background-color: #0088e6;
    }

    .create-engine-button:active {
      transform: scale(0.99);
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

    .engines-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      transition: opacity 0.2s ease;
    }

    .engines-grid.is-refreshing {
      opacity: 0.5;
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

    @media (max-width: 1024px) {
      .engines-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .content-container {
        padding: 20px 16px 40px 16px;
      }
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }
      .create-engine-button {
        justify-content: center;
      }
      .page-title {
        font-size: 1.75rem;
      }
      .engines-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .feedback-toast {
        left: 16px;
        right: 16px;
        bottom: 16px;
      }
    }
  `]
})
export class GarageCatalogPageComponent implements OnInit, OnDestroy {
  private static readonly DEFAULT_PAGE_SIZE = 12;
  private static readonly FEEDBACK_TIMEOUT_MILLISECONDS = 4000;

  enginesPage$!: Observable<PageResponse<EngineModel>>;
  isLoading = false;
  feedbackMessage = '';
  isSuccess = false;

  isFormModalOpen = false;
  engineBeingEdited: EngineModel | null = null;
  isSubmittingForm = false;
  formErrorMessage: string | null = null;
  formServerFieldErrors: Record<string, string> | null = null;

  isDeleteDialogOpen = false;
  engineBeingDeleted: EngineModel | null = null;
  isConfirmingDelete = false;
  deleteErrorMessage: string | null = null;

  private readonly pageQuerySubject = new BehaviorSubject<EnginePageQuery>({
    page: 0,
    size: GarageCatalogPageComponent.DEFAULT_PAGE_SIZE,
    sort: 'id,ASC'
  });
  private hasAppliedInitialSelection = false;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly engineService: EngineService,
    readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.enginesPage$ = this.pageQuerySubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      switchMap((query) => this.loadEnginesPage(query))
    );
  }

  ngOnDestroy(): void {
    this.clearFeedbackTimeout();
  }

  get deleteDialogMessage(): string {
    if (this.engineBeingDeleted === null) {
      return '';
    }

    const { name, manufacturer } = this.engineBeingDeleted;
    return `Deseja realmente excluir o motor ${name} (${manufacturer}) do catálogo?`;
  }

  handleSelectEngine(engineId: string): void {
    this.engineService.selectEngine(engineId).subscribe({
      next: () => this.reloadCurrentPage(),
      error: (error: HttpErrorResponse) =>
        this.showFeedback(this.buildErrorMessage(error, 'Não foi possível selecionar o motor.'), false)
    });
  }

  handleOpenCreateForm(): void {
    if (!this.authService.isAdmin()) {
      return;
    }

    this.engineBeingEdited = null;
    this.formErrorMessage = null;
    this.formServerFieldErrors = null;
    this.isFormModalOpen = true;
  }

  handleOpenEditForm(engine: EngineModel): void {
    if (!this.authService.isAdmin()) {
      return;
    }

    this.engineBeingEdited = engine;
    this.formErrorMessage = null;
    this.formServerFieldErrors = null;
    this.isFormModalOpen = true;
  }

  handleCloseFormModal(): void {
    if (this.isSubmittingForm) {
      return;
    }

    this.isFormModalOpen = false;
    this.engineBeingEdited = null;
  }

  handleSubmitEngineForm(payload: EnginePayload): void {
    if (!this.authService.isAdmin()) {
      return;
    }

    const engineBeingEdited = this.engineBeingEdited;

    this.isSubmittingForm = true;
    this.formErrorMessage = null;
    this.formServerFieldErrors = null;

    const saveEngineRequest$ = engineBeingEdited
      ? this.engineService.updateEngine(engineBeingEdited.id.toString(), payload)
      : this.engineService.createEngine(payload);

    saveEngineRequest$.subscribe({
      next: (savedEngine) => {
        this.isSubmittingForm = false;
        this.isFormModalOpen = false;
        this.engineBeingEdited = null;

        this.showFeedback(
          engineBeingEdited
            ? `Motor "${savedEngine.name}" atualizado com sucesso.`
            : `Motor "${savedEngine.name}" cadastrado com sucesso.`,
          true
        );
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingForm = false;

        const serverFieldErrors = this.extractServerFieldErrors(error);
        this.formServerFieldErrors = serverFieldErrors;
        this.formErrorMessage = serverFieldErrors
          ? 'Um ou mais campos são inválidos. Revise os dados informados.'
          : this.buildErrorMessage(error, 'Não foi possível salvar o motor.');
      }
    });
  }

  handleDeleteRequest(engine: EngineModel): void {
    if (!this.authService.isAdmin()) {
      return;
    }

    this.engineBeingDeleted = engine;
    this.deleteErrorMessage = null;
    this.isDeleteDialogOpen = true;
  }

  handleCancelDelete(): void {
    if (this.isConfirmingDelete) {
      return;
    }

    this.isDeleteDialogOpen = false;
    this.engineBeingDeleted = null;
  }

  handleConfirmDelete(): void {
    if (!this.authService.isAdmin()) {
      return;
    }

    const engineBeingDeleted = this.engineBeingDeleted;

    if (engineBeingDeleted === null) {
      return;
    }

    this.isConfirmingDelete = true;
    this.deleteErrorMessage = null;

    this.engineService.deleteEngine(engineBeingDeleted.id.toString()).subscribe({
      next: () => {
        this.isConfirmingDelete = false;
        this.isDeleteDialogOpen = false;
        this.engineBeingDeleted = null;

        this.showFeedback(`Motor "${engineBeingDeleted.name}" excluído com sucesso.`, true);
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.isConfirmingDelete = false;
        this.deleteErrorMessage = this.buildErrorMessage(
          error,
          'Não foi possível excluir o motor.'
        );
      }
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

  trackByEngineId(enginePosition: number, engine: EngineModel): number {
    return engine.id;
  }

  private loadEnginesPage(query: EnginePageQuery): Observable<PageResponse<EngineModel>> {
    return this.engineService.getEnginesPage(query).pipe(
      switchMap((enginesPage) => this.resolveInitialSelection(enginesPage, query)),
      switchMap((enginesPage) => this.resolvePageBoundaries(enginesPage, query)),
      tap(() => {
        this.isLoading = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível carregar os motores.'),
          false
        );
        return of(this.buildEmptyPage(query));
      })
    );
  }

  private resolveInitialSelection(
    enginesPage: PageResponse<EngineModel>,
    query: EnginePageQuery
  ): Observable<PageResponse<EngineModel>> {
    const firstEngine = enginesPage.content[0];
    const shouldAutoSelect =
      !this.hasAppliedInitialSelection && query.page === 0 && firstEngine !== undefined;

    if (!shouldAutoSelect) {
      return of(enginesPage);
    }

    this.hasAppliedInitialSelection = true;

    return this.engineService.selectEngine(firstEngine.id.toString()).pipe(
      switchMap(() => this.engineService.getEnginesPage(query)),
      catchError(() => of(enginesPage))
    );
  }

  private resolvePageBoundaries(
    enginesPage: PageResponse<EngineModel>,
    query: EnginePageQuery
  ): Observable<PageResponse<EngineModel>> {
    const isCurrentPageEmpty =
      enginesPage.page > 0 && enginesPage.content.length === 0 && enginesPage.totalElements > 0;
    const lastAvailablePage = Math.max(enginesPage.totalPages - 1, 0);

    if (isCurrentPageEmpty && lastAvailablePage !== enginesPage.page) {
      setTimeout(() => this.handlePageChange(lastAvailablePage));
    }

    return of(enginesPage);
  }

  private reloadCurrentPage(): void {
    const currentQuery = this.pageQuerySubject.getValue();
    this.pageQuerySubject.next({ ...currentQuery });
  }

  private buildEmptyPage(query: EnginePageQuery): PageResponse<EngineModel> {
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
      return 'Não foi possível conectar ao serviço de motores. Verifique se a API está em execução.';
    }

    const apiError = error.error as { message?: string } | null;
    return apiError?.message ?? fallbackMessage;
  }

  private extractServerFieldErrors(error: HttpErrorResponse): Record<string, string> | null {
    const apiError = error.error as
      | { fieldErrors?: { field: string; message: string }[] }
      | null;
    const fieldErrors = apiError?.fieldErrors;

    if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
      return null;
    }

    return fieldErrors.reduce<Record<string, string>>((accumulator, fieldError) => {
      accumulator[fieldError.field] = fieldError.message;
      return accumulator;
    }, {});
  }

  private showFeedback(message: string, isSuccess: boolean): void {
    this.feedbackMessage = message;
    this.isSuccess = isSuccess;
    this.clearFeedbackTimeout();

    this.feedbackTimeoutId = setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackTimeoutId = null;
    }, GarageCatalogPageComponent.FEEDBACK_TIMEOUT_MILLISECONDS);
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeoutId === null) {
      return;
    }

    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = null;
  }
}
