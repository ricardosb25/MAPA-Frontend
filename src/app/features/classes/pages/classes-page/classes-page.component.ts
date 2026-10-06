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
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PageResponse } from '../../../../core/models/pagination.model';
import {
  SHIFT_OPTIONS,
  ClassEnrollmentModel,
  ClassDetailModel,
  ClassModel,
  ClassPayload,
  ClassQuery,
  Shift,
  shiftLabel,
} from '../../../../core/models/class.model';
import { ClassService } from '../../../../core/services/class.service';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { PaginationControlsComponent } from '../../../../shared/components/pagination-controls/pagination-controls.component';
import { ConfirmDialogComponent } from '../../../garage/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-classes-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderNavbarComponent,
    PaginationControlsComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="page-layout">
      <app-header-navbar></app-header-navbar>

      <main class="content-container">
        <section class="page-header">
          <div class="page-header-text">
            <span class="category-tag">PROFESSOR</span>
            <h1 class="page-title">Gerenciar turmas</h1>
            <p class="page-subtitle">Crie turmas, compartilhe o código e acompanhe os alunos.</p>
          </div>
        </section>

        <section class="filters-bar" aria-label="Busca e filtros de turmas">
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
            <input
              type="search"
              class="search-input"
              placeholder="Buscar por nome ou código..."
              aria-label="Buscar turmas"
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

        <section class="classes-layout">
          <div class="classes-column">
            <div class="new-class-card">
              <span class="card-tag">NOVA TURMA</span>
              <form [formGroup]="createForm" (ngSubmit)="handleCreateSchoolClass()" novalidate>
                <input
                  type="text"
                  class="form-input"
                  formControlName="name"
                  placeholder="Nome da turma"
                  maxlength="100"
                  aria-label="Nome da turma"
                />
                @if (isCreateFieldInvalid('name')) {
                  <span class="field-error">Informe o nome da turma.</span>
                }

                <select class="form-input" formControlName="shift" aria-label="Turno da turma">
                  @for (option of shiftOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>

                @if (createErrorMessage) {
                  <div class="form-error-banner">{{ createErrorMessage }}</div>
                }

                <button type="submit" class="primary-button" [disabled]="isSubmittingCreate">
                  @if (isSubmittingCreate) {
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Criando...</span>
                  } @else {
                    <i class="fa-solid fa-plus"></i>
                    <span>Criar turma</span>
                  }
                </button>
              </form>
            </div>

            @if (classesPage$ | async; as classesPage) {
              @if (classesPage.content.length > 0) {
                <div class="class-list" [class.is-refreshing]="isLoading">
                  @for (schoolClass of classesPage.content; track schoolClass.id) {
                    <button
                      type="button"
                      class="class-list-item"
                      [class.selected]="schoolClass.id === selectedClassId"
                      (click)="handleSelectClass(schoolClass.id)"
                    >
                      <div class="class-item-text">
                        <span class="class-item-name">{{ schoolClass.name }}</span>
                        <span class="class-item-meta">
                          {{ shiftLabel(schoolClass.shift) }} ·
                          {{ schoolClass.studentCount }} aluno(s)
                        </span>
                      </div>
                      <span class="code-badge">{{ schoolClass.code }}</span>
                    </button>
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
                  ariaLabel="Paginação das turmas"
                  [pageSizeOptions]="pageSizeOptions"
                  (pageChange)="handlePageChange($event)"
                  (sizeChange)="handleSizeChange($event)"
                ></app-pagination-controls>
              } @else {
                <div class="empty-state">
                  <i class="fa-solid fa-chalkboard-user empty-state-icon"></i>
                  <p class="empty-state-title">Nenhuma turma por aqui.</p>
                  <p class="empty-state-text">
                    Crie a sua primeira turma e compartilhe o código com os alunos.
                  </p>
                </div>
              }
            }
          </div>
          <div class="detail-column">
            @if (selectedClass$ | async; as schoolClass) {
              <div class="detail-card" [class.is-refreshing]="isLoadingDetail">
                <header class="detail-header">
                  <div class="detail-header-text">
                    <span class="detail-code-label">CÓDIGO {{ schoolClass.code }}</span>
                    <h2 class="detail-title">{{ schoolClass.name }}</h2>
                    <span class="detail-meta"
                      >{{ shiftLabel(schoolClass.shift) }} · Prof.
                      {{ schoolClass.professorName }}</span
                    >
                  </div>
                  <div class="detail-actions">
                    <button type="button" class="secondary-button" (click)="handleOpenEdit()">
                      Editar
                    </button>
                    <button type="button" class="secondary-button" (click)="handleOpenRegenerate()">
                      Gerar novo código
                    </button>
                    <button
                      type="button"
                      class="delete-class-button"
                      (click)="handleDeleteRequest()"
                    >
                      <i class="fa-solid fa-trash" aria-hidden="true"></i>
                      <span>Excluir turma</span>
                    </button>
                  </div>
                </header>

                @if (isEditMode) {
                  <form
                    [formGroup]="editForm"
                    (ngSubmit)="handleSaveEdit()"
                    class="edit-form"
                    novalidate
                  >
                    <input
                      type="text"
                      class="form-input"
                      formControlName="name"
                      placeholder="Nome da turma"
                      maxlength="100"
                      aria-label="Nome da turma"
                    />
                    @if (isEditFieldInvalid('name')) {
                      <span class="field-error">Informe o nome da turma.</span>
                    }

                    <select class="form-input" formControlName="shift" aria-label="Turno da turma">
                      @for (option of shiftOptions; track option.value) {
                        <option [value]="option.value">{{ option.label }}</option>
                      }
                    </select>

                    @if (editErrorMessage) {
                      <div class="form-error-banner">{{ editErrorMessage }}</div>
                    }

                    <div class="edit-actions">
                      <button type="button" class="secondary-button" (click)="handleCancelEdit()">
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        class="primary-button save-button"
                        [disabled]="isSubmittingEdit"
                      >
                        @if (isSubmittingEdit) {
                          <i class="pi pi-spin pi-spinner"></i>
                          <span>Salvando...</span>
                        } @else {
                          <span>Salvar alterações</span>
                        }
                      </button>
                    </div>
                  </form>
                }

                <div class="students-section">
                  <div class="students-header">
                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                    <span>Alunos ({{ schoolClass.students.length }})</span>
                  </div>

                  @if (schoolClass.students.length > 0) {
                    <div class="students-list">
                      @for (student of schoolClass.students; track student.studentId) {
                        <div class="student-row">
                          <div class="student-info">
                            <span class="student-name">{{ student.fullName }}</span>
                            <span class="student-email">{{ student.email }}</span>
                          </div>
                          <button
                            type="button"
                            class="remove-student-button"
                            [disabled]="removingStudentId === student.studentId"
                            (click)="handleRemoveStudent(student)"
                          >
                            @if (removingStudentId === student.studentId) {
                              <i class="pi pi-spin pi-spinner"></i>
                            } @else {
                              <i class="fa-solid fa-user-minus" aria-hidden="true"></i>
                            }
                            <span>Remover</span>
                          </button>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="students-empty">
                      Nenhum aluno matriculado ainda. Compartilhe o código
                      {{ schoolClass.code }} para os alunos entrarem.
                    </p>
                  }
                </div>
              </div>
            } @else {
              <div class="detail-placeholder">
                <i class="fa-solid fa-chalkboard-user empty-state-icon"></i>
                <p class="empty-state-title">Selecione uma turma</p>
                <p class="empty-state-text">
                  Escolha uma turma na lista para ver o código e os alunos matriculados.
                </p>
              </div>
            }
          </div>
        </section>
      </main>

      @if (isDeleteDialogOpen) {
        <app-confirm-dialog
          title="Excluir turma"
          [message]="deleteDialogMessage"
          confirmationLabel="Confirmo que desejo excluir esta turma e todas as matrículas. Esta ação não pode ser desfeita."
          confirmButtonLabel="Excluir schoolClass"
          [isConfirming]="isConfirmingDelete"
          [errorMessage]="deleteErrorMessage"
          (confirm)="handleConfirmDelete()"
          (cancel)="handleCancelDelete()"
        ></app-confirm-dialog>
      }

      @if (isRegenerateDialogOpen) {
        <app-confirm-dialog
          title="Gerar novo código"
          [message]="regenerateDialogMessage"
          confirmationLabel="Confirmo que desejo substituir o código atual desta turma."
          confirmButtonLabel="Gerar novo código"
          confirmingLabel="Gerando..."
          [isConfirming]="isConfirmingRegenerate"
          [errorMessage]="regenerateErrorMessage"
          (confirm)="handleConfirmRegenerate()"
          (cancel)="handleCancelRegenerate()"
        ></app-confirm-dialog>
      }

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

      .page-header-text {
        max-width: 720px;
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

      .classes-layout {
        display: grid;
        grid-template-columns: minmax(300px, 380px) 1fr;
        gap: 24px;
        align-items: start;
      }

      .classes-column {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      .new-class-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      .card-tag {
        display: block;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #64748b;
        margin-bottom: 12px;
        font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
      }

      .form-input {
        width: 100%;
        height: 42px;
        padding: 0 12px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.875rem;
        color: #0f172a;
        background-color: #ffffff;
        box-sizing: border-box;
        margin-bottom: 10px;
      }

      .form-input:focus {
        outline: none;
        border-color: #0099ff;
        box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
      }

      .field-error {
        display: block;
        color: #dc2626;
        font-size: 0.75rem;
        font-weight: 600;
        margin: -4px 0 10px;
      }

      .form-error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 10px;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .primary-button {
        width: 100%;
        height: 44px;
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
        transition: background-color 0.2s ease;
      }

      .primary-button:hover:not(:disabled) {
        background-color: #0088e6;
      }

      .primary-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .class-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: opacity 0.2s ease;
      }

      .class-list.is-refreshing {
        opacity: 0.5;
      }

      .class-list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .class-list-item:hover {
        border-color: #93c5fd;
      }

      .class-list-item.selected {
        border-color: #0099ff;
        box-shadow: 0 0 0 3px rgba(0, 153, 255, 0.15);
      }

      .class-item-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .class-item-name {
        font-weight: 700;
        font-size: 0.95rem;
        color: #0f172a;
      }

      .class-item-meta {
        font-size: 0.75rem;
        color: #64748b;
      }

      .code-badge {
        flex-shrink: 0;
        padding: 3px 8px;
        border-radius: 6px;
        background-color: #e0f2fe;
        color: #0369a1;
        font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      .empty-state,
      .detail-placeholder {
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

      .detail-column {
        min-width: 0;
      }

      .detail-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
        transition: opacity 0.2s ease;
      }

      .detail-card.is-refreshing {
        opacity: 0.5;
      }

      .detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding-bottom: 18px;
        border-bottom: 1px solid #f1f5f9;
      }

      .detail-code-label {
        display: block;
        font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #64748b;
        margin-bottom: 6px;
      }

      .detail-title {
        margin: 0 0 6px 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
      }

      .detail-meta {
        font-size: 0.85rem;
        color: #475569;
      }

      .detail-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .secondary-button {
        height: 38px;
        padding: 0 14px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        background-color: #ffffff;
        color: #334155;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .secondary-button:hover:not(:disabled) {
        background-color: #f1f5f9;
      }

      .delete-class-button {
        height: 38px;
        padding: 0 14px;
        border: none;
        border-radius: 10px;
        background-color: #3f3f46;
        color: #ef4444;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.15s ease;
      }

      .delete-class-button:hover {
        background-color: #27272a;
      }

      .edit-form {
        padding: 18px 0;
        border-bottom: 1px solid #f1f5f9;
      }

      .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .save-button {
        width: auto;
        height: 42px;
        padding: 0 18px;
      }

      .students-section {
        margin-top: 18px;
      }

      .students-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 12px;
      }

      .students-list {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
      }

      .student-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #f1f5f9;
      }

      .student-row:last-child {
        border-bottom: none;
      }

      .student-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .student-name {
        font-size: 0.9rem;
        font-weight: 700;
        color: #0f172a;
      }

      .student-email {
        font-size: 0.78rem;
        color: #64748b;
        font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
        word-break: break-all;
      }

      .remove-student-button {
        border: none;
        background: none;
        color: #dc2626;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        border-radius: 8px;
        transition: background-color 0.15s ease;
      }

      .remove-student-button:hover:not(:disabled) {
        background-color: #fef2f2;
      }

      .remove-student-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .students-empty {
        margin: 0;
        padding: 16px;
        font-size: 0.85rem;
        color: #64748b;
        background-color: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 10px;
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

      @media (max-width: 992px) {
        .classes-layout {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .content-container {
          padding: 20px 16px 40px 16px;
        }

        .page-title {
          font-size: 1.75rem;
        }

        .filters-bar {
          flex-direction: column;
          align-items: stretch;
        }

        .detail-header {
          flex-direction: column;
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
export class ClassesPageComponent implements OnInit, OnDestroy {
  private static readonly DEFAULT_PAGE_SIZE = 6;
  private static readonly SEARCH_DEBOUNCE_MILLISECONDS = 300;
  private static readonly FEEDBACK_TIMEOUT_MILLISECONDS = 4000;

  readonly pageSizeOptions: number[] = [6, 12, 24];
  readonly shiftOptions = SHIFT_OPTIONS;
  readonly shiftLabel = shiftLabel;

  classesPage$: Observable<PageResponse<ClassModel>>;
  selectedClass$: Observable<ClassDetailModel | null>;

  isLoading = false;
  isLoadingDetail = false;
  selectedClassId: number | null = null;
  selectedShift: Shift | null = null;

  isSubmittingCreate = false;
  createErrorMessage: string | null = null;

  isEditMode = false;
  isSubmittingEdit = false;
  editErrorMessage: string | null = null;

  isDeleteDialogOpen = false;
  isConfirmingDelete = false;
  deleteErrorMessage: string | null = null;
  deleteDialogMessage = '';

  isRegenerateDialogOpen = false;
  isConfirmingRegenerate = false;
  regenerateErrorMessage: string | null = null;
  regenerateDialogMessage = '';

  removingStudentId: number | null = null;

  feedbackMessage = '';
  isSuccess = false;

  readonly createForm: FormGroup<{ name: FormControl<string>; shift: FormControl<string> }>;
  readonly editForm: FormGroup<{ name: FormControl<string>; shift: FormControl<string> }>;

  private readonly pageQuerySubject = new BehaviorSubject<ClassQuery>({
    search: '',
    shift: null,
    page: 0,
    size: ClassesPageComponent.DEFAULT_PAGE_SIZE,
    sort: 'name,ASC',
  });
  private readonly searchInputSubject = new Subject<string>();
  private readonly selectedClassSubject = new BehaviorSubject<ClassDetailModel | null>(null);
  private searchSubscription: Subscription | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly classService: ClassService,
    private readonly formBuilder: NonNullableFormBuilder,
  ) {
    this.createForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      shift: ['EVENING', Validators.required],
    });
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      shift: ['EVENING', Validators.required],
    });

    this.classesPage$ = this.pageQuerySubject.pipe(
      tap(() => {
        this.isLoading = true;
      }),
      switchMap((query) => this.loadClassesPage(query)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.selectedClass$ = this.selectedClassSubject.asObservable();
  }
  ngOnInit(): void {
    this.searchSubscription = this.searchInputSubject
      .pipe(debounceTime(ClassesPageComponent.SEARCH_DEBOUNCE_MILLISECONDS), distinctUntilChanged())
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

  handleSelectClass(classId: number): void {
    if (classId === this.selectedClassId) {
      return;
    }
    this.loadDetail(classId);
  }

  isCreateFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return field !== null && field.invalid && field.touched;
  }

  isEditFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return field !== null && field.invalid && field.touched;
  }

  handleCreateSchoolClass(): void {
    if (this.isSubmittingCreate) {
      return;
    }
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.getRawValue();
    const payload: ClassPayload = { name: formValue.name.trim(), shift: formValue.shift as Shift };

    this.isSubmittingCreate = true;
    this.createErrorMessage = null;

    this.classService.createClass(payload).subscribe({
      next: (createdClass) => {
        this.isSubmittingCreate = false;
        this.createForm.reset({ name: '', shift: 'EVENING' });
        this.selectedClassId = createdClass.id;
        this.showFeedback(
          `Turma "${createdClass.name}" criada com o código ${createdClass.code}.`,
          true,
        );
        this.loadDetail(createdClass.id);
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingCreate = false;
        this.createErrorMessage = this.buildErrorMessage(error, 'Não foi possível criar a turma.');
      },
    });
  }

  handleOpenEdit(): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null) {
      return;
    }
    this.isEditMode = true;
    this.editErrorMessage = null;
    this.editForm.setValue({ name: selectedClass.name, shift: selectedClass.shift });
  }

  handleCancelEdit(): void {
    if (this.isSubmittingEdit) {
      return;
    }
    this.isEditMode = false;
    this.editErrorMessage = null;
  }

  handleSaveEdit(): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null || this.isSubmittingEdit) {
      return;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();
    const payload: ClassPayload = { name: formValue.name.trim(), shift: formValue.shift as Shift };

    this.isSubmittingEdit = true;
    this.editErrorMessage = null;

    this.classService.updateClass(selectedClass.id, payload).subscribe({
      next: (updatedClass) => {
        this.isSubmittingEdit = false;
        this.isEditMode = false;
        this.selectedClassSubject.next({
          ...selectedClass,
          ...updatedClass,
          students: selectedClass.students,
        });
        this.showFeedback(`Turma "${updatedClass.name}" atualizada com sucesso.`, true);
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingEdit = false;
        this.editErrorMessage = this.buildErrorMessage(
          error,
          'Não foi possível salvar as alterações.',
        );
      },
    });
  }

  handleDeleteRequest(): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null) {
      return;
    }
    this.deleteDialogMessage =
      `Deseja realmente excluir a turma "${selectedClass.name}"? ` +
      'Todos os alunos perdem o vínculo e o código deixa de funcionar.';
    this.deleteErrorMessage = null;
    this.isDeleteDialogOpen = true;
  }

  handleCancelDelete(): void {
    if (this.isConfirmingDelete) {
      return;
    }
    this.isDeleteDialogOpen = false;
    this.deleteErrorMessage = null;
  }

  handleConfirmDelete(): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null || this.isConfirmingDelete) {
      return;
    }

    this.isConfirmingDelete = true;
    this.deleteErrorMessage = null;

    this.classService.deleteClass(selectedClass.id).subscribe({
      next: () => {
        this.isConfirmingDelete = false;
        this.isDeleteDialogOpen = false;
        this.selectedClassId = null;
        this.selectedClassSubject.next(null);
        this.isEditMode = false;
        this.showFeedback(`Turma "${selectedClass.name}" excluída com sucesso.`, true);
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.isConfirmingDelete = false;
        this.deleteErrorMessage = this.buildErrorMessage(
          error,
          'Não foi possível excluir a turma.',
        );
      },
    });
  }

  handleOpenRegenerate(): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null) {
      return;
    }
    this.regenerateDialogMessage =
      `O código atual ${selectedClass.code} da turma "${selectedClass.name}" deixará de valer imediatamente. ` +
      'Use esta ação apenas em caso de vazamento do código.';
    this.regenerateErrorMessage = null;
    this.isRegenerateDialogOpen = true;
  }

  handleCancelRegenerate(): void {
    if (this.isConfirmingRegenerate) {
      return;
    }
    this.isRegenerateDialogOpen = false;
    this.regenerateErrorMessage = null;
  }

  handleConfirmRegenerate(): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null || this.isConfirmingRegenerate) {
      return;
    }

    this.isConfirmingRegenerate = true;
    this.regenerateErrorMessage = null;

    this.classService.regenerateClassCode(selectedClass.id).subscribe({
      next: (regeneratedClass) => {
        this.isConfirmingRegenerate = false;
        this.isRegenerateDialogOpen = false;
        this.selectedClassSubject.next({
          ...selectedClass,
          ...regeneratedClass,
          students: selectedClass.students,
        });
        this.showFeedback(
          `Novo código gerado: ${regeneratedClass.code}. O código anterior deixou de valer.`,
          true,
        );
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.isConfirmingRegenerate = false;
        this.regenerateErrorMessage = this.buildErrorMessage(
          error,
          'Não foi possível gerar um novo código.',
        );
      },
    });
  }

  handleRemoveStudent(student: ClassEnrollmentModel): void {
    const selectedClass = this.selectedClassSubject.getValue();
    if (selectedClass === null || this.removingStudentId !== null) {
      return;
    }

    this.removingStudentId = student.studentId;
    this.classService.removeStudent(selectedClass.id, student.studentId).subscribe({
      next: () => {
        this.removingStudentId = null;
        this.showFeedback(`Aluno "${student.fullName}" removido da turma.`, true);
        this.loadDetail(selectedClass.id);
        this.reloadCurrentPage();
      },
      error: (error: HttpErrorResponse) => {
        this.removingStudentId = null;
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível remover o aluno.'),
          false,
        );
      },
    });
  }

  private loadClassesPage(query: ClassQuery): Observable<PageResponse<ClassModel>> {
    return this.classService.getTeacherClassesPage(query).pipe(
      tap((classesPage) => {
        this.isLoading = false;
        this.resolveSelection(classesPage);
      }),
      catchError((error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível carregar as turmas.'),
          false,
        );
        return of(this.buildEmptyPage(query));
      }),
    );
  }

  private resolveSelection(classesPage: PageResponse<ClassModel>): void {
    if (this.selectedClassId !== null) {
      return;
    }
    const firstClass = classesPage.content[0];
    if (firstClass !== undefined) {
      this.loadDetail(firstClass.id);
    }
  }

  private loadDetail(classId: number): void {
    this.isLoadingDetail = true;
    this.classService.getClassDetail(classId).subscribe({
      next: (classDetail) => {
        this.isLoadingDetail = false;
        this.selectedClassId = classDetail.id;
        this.selectedClassSubject.next(classDetail);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingDetail = false;
        this.selectedClassId = null;
        this.selectedClassSubject.next(null);
        this.showFeedback(
          this.buildErrorMessage(error, 'Não foi possível carregar os detalhes da turma.'),
          false,
        );
      },
    });
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
    }, ClassesPageComponent.FEEDBACK_TIMEOUT_MILLISECONDS);
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeoutId === null) {
      return;
    }
    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = null;
  }
}
