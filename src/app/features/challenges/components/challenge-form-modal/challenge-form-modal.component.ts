import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { 
  ChallengeModel, 
  ChallengePayload, 
  CHALLENGE_DIFFICULTY_OPTIONS,
  ENGINE_STATUS_OPTIONS
} from '../../../../core/models/challenge.model';
import { EngineService } from '../../../../core/services/engine.service';
import { ClassService } from '../../../../core/services/class.service';
import { EngineModel } from '../../../../core/models/engine.model';
import { ClassModel } from '../../../../core/models/class.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-challenge-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    MessageModule
  ],
  template: `
    <p-dialog 
      [header]="challenge ? 'Editar Desafio' : 'Novo Desafio'" 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{ width: '560px' }" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="challenge-dialog"
      (onHide)="handleClose()"
    >
      <form [formGroup]="challengeForm" (ngSubmit)="handleSubmit()" class="challenge-form">
        <div class="form-fields">
          <div class="field">
            <label for="title" class="field-label">Título *</label>
            <input 
              id="title" 
              type="text" 
              pInputText 
              formControlName="title" 
              placeholder="Ex: Falta de potência em alta rotação"
            />
            @if (isFieldInvalid('title')) {
              <p-message severity="info" size="small" variant="simple" styleClass="field-message">
                Título é obrigatório (máx 120 chars).
              </p-message>
            }
          </div>

          <div class="field">
            <label for="description" class="field-label">Descrição *</label>
            <textarea 
              id="description" 
              pTextarea 
              formControlName="description" 
              rows="3" 
              placeholder="Descreva os objetivos do desafio..."
            ></textarea>
            @if (isFieldInvalid('description')) {
              <p-message severity="info" size="small" variant="simple" styleClass="field-message">
                Descrição é obrigatória (máx 255 chars).
              </p-message>
            }
          </div>

          <div class="form-row">
            <div class="form-col">
              <div class="field">
                <label for="difficulty" class="field-label">Dificuldade *</label>
                <p-select 
                  id="difficulty" 
                  [options]="difficultyOptions" 
                  formControlName="difficulty" 
                  optionLabel="label" 
                  optionValue="value"
                  placeholder="Selecione"
                ></p-select>
              </div>
            </div>
            <div class="form-col">
              <div class="field">
                <label for="goalPowerCv" class="field-label">Meta de Potência (cv) *</label>
                <p-inputNumber 
                  id="goalPowerCv" 
                  formControlName="goalPowerCv" 
                  [min]="1" 
                  placeholder="Ex: 103"
                ></p-inputNumber>
                @if (isFieldInvalid('goalPowerCv')) {
                  <p-message severity="info" size="small" variant="simple" styleClass="field-message">
                    Meta deve ser maior que zero.
                  </p-message>
                }
              </div>
            </div>
          </div>

          <div class="field">
            <label for="requiredEngineStatus" class="field-label">Status do motor *</label>
            <p-select
              id="requiredEngineStatus"
              [options]="engineStatusOptions"
              formControlName="requiredEngineStatus"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione o status final"
            ></p-select>
            <small class="field-hint">
              Critério de conclusão: o aluno precisa atingir a meta de potência e terminar o teste com este status.
            </small>
            @if (isFieldInvalid('requiredEngineStatus')) {
              <p-message severity="info" size="small" variant="simple" styleClass="field-message">
                Selecione o status final do motor.
              </p-message>
            }
          </div>

          <div class="field">
            <label for="motorId" class="field-label">Motor *</label>
            <p-select 
              id="motorId" 
              [options]="motors()" 
              formControlName="motorId" 
              optionLabel="displayName" 
              optionValue="id"
              placeholder="Selecione o motor"
              [filter]="true"
              filterBy="displayName"
            ></p-select>
            @if (isFieldInvalid('motorId')) {
              <p-message severity="info" size="small" variant="simple" styleClass="field-message">
                Selecione um motor.
              </p-message>
            }
          </div>

          <div class="field">
            <label for="classId" class="field-label">Turma *</label>
            <p-select 
              id="classId" 
              [options]="classes()" 
              formControlName="classId" 
              optionLabel="displayName" 
              optionValue="id"
              placeholder="Selecione a turma"
            ></p-select>
            @if (isFieldInvalid('classId')) {
              <p-message severity="info" size="small" variant="simple" styleClass="field-message">
                Selecione uma turma.
              </p-message>
            }
          </div>
        </div>

        <div class="form-actions">
          <p-button
            label="Cancelar"
            severity="secondary"
            [text]="true"
            styleClass="challenge-cancel-button"
            (onClick)="handleClose()"
          ></p-button>
          <p-button
            type="submit"
            [label]="challenge ? 'Salvar' : 'Criar'"
            [loading]="loading"
            [disabled]="challengeForm.invalid"
            styleClass="challenge-primary-button"
          ></p-button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .challenge-form {
      padding-top: 0.25rem;
    }

    .challenge-form .field-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 6px;
    }

    .field {
      margin-bottom: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-col {
      min-width: 0;
    }

    .challenge-form .p-inputtext,
    .challenge-form .p-textarea {
      width: 100%;
    }

    :host ::ng-deep .challenge-form .p-select,
    :host ::ng-deep .challenge-form .p-inputnumber,
    :host ::ng-deep .challenge-form .p-inputnumber-input {
      width: 100%;
    }

    :host ::ng-deep .field-message {
      display: flex;
      margin-top: 0.5rem;
      font-weight: 600;
    }

    .field-hint {
      display: block;
      margin-top: 4px;
      color: #64748b;
      line-height: 1.4;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ChallengeFormModalComponent implements OnInit {
  @Input() challenge: ChallengeModel | null = null;
  @Input() visible = false;
  @Input() loading = false;
  
  @Output() save = new EventEmitter<ChallengePayload>();
  @Output() close = new EventEmitter<void>();

  challengeForm: FormGroup;
  difficultyOptions = CHALLENGE_DIFFICULTY_OPTIONS;
  engineStatusOptions = ENGINE_STATUS_OPTIONS;
  
  motors = signal<{ id: number; displayName: string }[]>([]);
  classes = signal<{ id: number; displayName: string }[]>([]);

  constructor(
    private readonly fb: FormBuilder,
    private readonly engineService: EngineService,
    private readonly classService: ClassService
  ) {
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      difficulty: ['MEDIUM', Validators.required],
      motorId: [null, Validators.required],
      classId: [null, Validators.required],
      goalPowerCv: [null, [Validators.required, Validators.min(1)]],
      requiredEngineStatus: ['INTEGRO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    if (this.challenge) {
      this.challengeForm.patchValue({
        title: this.challenge.title,
        description: this.challenge.description,
        difficulty: this.challenge.difficulty,
        motorId: this.challenge.motorId,
        classId: this.challenge.classId,
        goalPowerCv: this.challenge.goalPowerCv,
        requiredEngineStatus: this.challenge.requiredEngineStatus ?? 'INTEGRO'
      });
    }
  }

  private loadInitialData(): void {
    this.engineService.getEnginesPage({ page: 0, size: 100, sort: 'name,ASC' })
      .pipe(map(page => page.content.map(m => ({ 
        id: m.id, 
        displayName: `${m.manufacturer} ${m.name}` 
      }))))
      .subscribe(data => this.motors.set(data));

    this.classService.getTeacherClassesPage({ page: 0, size: 100, sort: 'name,ASC', search: '', shift: null })
      .pipe(map(page => page.content.map(c => ({ 
        id: c.id, 
        displayName: `${c.name} (${c.code})` 
      }))))
      .subscribe(data => this.classes.set(data));
  }

  isFieldInvalid(name: string): boolean {
    const control = this.challengeForm.get(name);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  handleSubmit(): void {
    if (this.challengeForm.valid) {
      this.save.emit(this.challengeForm.value);
    }
  }

  handleClose(): void {
    this.close.emit();
  }
}
