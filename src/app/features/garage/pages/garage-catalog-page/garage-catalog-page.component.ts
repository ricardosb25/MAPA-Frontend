import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FeedbackService } from '../../../../shared/services/feedback.service';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, switchMap, take, tap } from 'rxjs';
import {
  EngineModel,
  EnginePageQuery,
  EnginePayload,
  PageResponse
} from '../../../../core/models/engine.model';
import { AuthService } from '../../../../core/services/auth.service';
import { EngineService } from '../../../../core/services/engine.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';
import { EngineCardComponent } from '../../components/engine-card/engine-card.component';
import { EngineFormModalComponent } from '../../components/engine-form-modal/engine-form-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-garage-catalog-page',
  standalone: true,
  imports: [EmptyStateComponent, 
    CommonModule,
    HeaderNavbarComponent,
    LoadingComponent,
    PaginationControlsComponent,
    EngineCardComponent,
    EngineFormModalComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="mapa-page-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">CATÁLOGO</span>
            <h1 class="mapa-page-title">Garagem de motores</h1>
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
              <app-empty-state icon="fa-solid fa-warehouse" title="Nenhum motor por aqui." description="Cadastre um novo motor para começar a montar o catálogo da turma."></app-empty-state>
            }

            <app-pagination-controls itemNounSingular="motor" itemNounPlural="motores" ariaLabel="Paginação do catálogo de motores"
              [page]="enginesPage.page"
              [size]="enginesPage.size"
              [totalElements]="enginesPage.totalElements"
              [totalPages]="enginesPage.totalPages"
              [hasNext]="enginesPage.hasNext"
              [hasPrevious]="enginesPage.hasPrevious"
              (pageChange)="handlePageChange($event)"
              (sizeChange)="handleSizeChange($event)"
            ></app-pagination-controls>
          } @else {
            <app-loading message="Carregando motores..."></app-loading>
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
        <app-confirm-dialog confirmButtonLabel="Excluir motor" confirmingLabel="Excluindo..."
          title="Excluir motor"
          [message]="deleteDialogMessage"
          confirmationLabel="Confirmo que desejo excluir este motor do catálogo. Esta ação não pode ser desfeita."
          [isConfirming]="isConfirmingDelete"
          [errorMessage]="deleteErrorMessage"
          (confirm)="handleConfirmDelete()"
          (cancel)="handleCancelDelete()"
        ></app-confirm-dialog>
      }
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
      background-color: var(--mapa-blue-500);
      color: var(--mapa-white);
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
      background-color: var(--mapa-blue-600);
    }

    .create-engine-button:active {
      transform: scale(0.99);
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

    .engines-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      transition: opacity 0.2s ease;
    }

    .engines-grid.is-refreshing {
      opacity: 0.5;
    }

    @media (max-width: 1024px) {
      .engines-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .mapa-page-container {
        padding: 20px 16px 40px 16px;
      }
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }
      .create-engine-button {
        justify-content: center;
      }
      .mapa-page-title {
        font-size: 1.75rem;
      }
      .engines-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class GarageCatalogPageComponent implements OnInit {
  private readonly feedbackService = inject(FeedbackService);
  private static readonly DEFAULT_PAGE_SIZE = 12;

  enginesPage$!: Observable<PageResponse<EngineModel>>;
  isLoading = false;

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

    return this.engineService.getSelectedEngine().pipe(
      take(1),
      switchMap((selectedEngine) =>
        selectedEngine !== null
          ? this.engineService.getEnginesPage(query)
          : this.engineService.selectEngine(firstEngine.id.toString()).pipe(
              switchMap(() => this.engineService.getEnginesPage(query)),
              catchError(() => of(enginesPage))
            )
      )
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
    if (isSuccess) this.feedbackService.showSuccess('Sucesso', message);
    else this.feedbackService.showError('Erro', message);
  }

}
