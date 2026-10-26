import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChallengeModel, ChallengePerformanceModel, ChallengeStudentProgressModel } from '../../../../core/models/challenge.model';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-challenge-performance-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule, TagModule, LoadingComponent],
  template: `
    <p-dialog 
      [header]="'Desempenho: ' + challenge?.title" 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{ width: '800px' }" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="challenge-dialog"
      (onHide)="handleClose()"
    >
      @if (loading()) {
        <app-loading variant="inline" message="Carregando desempenho..."></app-loading>
      } @else {
        <p-table [value]="performance()?.students || []" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Aluno</th>
              <th class="col-center">Tentativas</th>
              <th class="col-center">Status</th>
              <th class="col-center">Melhor Potência</th>
              <th class="col-center">Critérios</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-student>
            <tr>
              <td>
                <div class="student-cell">
                  <span class="student-name">{{ student.fullName }}</span>
                  <span class="student-email">{{ student.email }}</span>
                </div>
              </td>
              <td class="col-center">{{ student.attempts }}</td>
              <td class="col-center">
                <p-tag
                  [value]="student.completed ? 'Concluído' : (student.selected ? 'Em andamento' : 'Não iniciado')"
                  [severity]="student.completed ? 'info' : 'secondary'"
                  [icon]="student.completed ? 'pi pi-check' : (student.selected ? 'pi pi-play' : 'pi pi-minus')"
                  styleClass="challenge-status-tag"
                ></p-tag>
              </td>
              <td class="col-center">
                {{ student.lastPeakPower ? student.lastPeakPower + ' cv' : '-' }}
              </td>
              <td class="col-center">
                <p-tag
                  [value]="student.completedCriteria + '/' + criteriaTotal"
                  [severity]="student.completedCriteria === criteriaTotal ? 'info' : 'secondary'"
                  styleClass="challenge-criteria-tag"
                ></p-tag>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="empty-cell">Nenhum aluno matriculado nesta turma.</td>
            </tr>
          </ng-template>
        </p-table>
      }
    </p-dialog>
  `,
  styles: [`
    .col-center {
      text-align: center;
    }

    .student-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .student-name {
      font-weight: 700;
      color: #0f172a;
    }

    .student-email {
      font-size: 0.72rem;
      color: #64748b;
    }

    .empty-cell {
      text-align: center;
      padding: 1.5rem;
      color: #475569;
    }
  `]
})
export class ChallengePerformanceModalComponent implements OnInit {
  @Input() challenge: ChallengeModel | null = null;
  @Input() visible = false;
  
  performance = signal<ChallengePerformanceModel | null>(null);
  loading = signal(false);

  get criteriaTotal(): number {
    return this.challenge?.criteria?.length ?? 2;
  }

  constructor(private readonly challengeService: ChallengeService) {}

  ngOnInit(): void {
    if (this.challenge && this.visible) {
      this.loadPerformance();
    }
  }

  loadPerformance(): void {
    if (!this.challenge) return;
    
    this.loading.set(true);
    this.challengeService.getChallengePerformance(this.challenge.id)
      .subscribe({
        next: (data) => {
          this.performance.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  handleClose(): void {
    this.performance.set(null);
  }
}
