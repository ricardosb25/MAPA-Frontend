import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { TeacherDashboard } from '../../../../core/models/teacher-dashboard.model';
import { TeacherDashboardService } from '../../../../core/services/teacher-dashboard.service';
import { shiftLabel } from '../../../../core/models/class.model';
import { HeaderNavbarComponent } from '../../../../shared/components/header-navbar/header-navbar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-teacher-dashboard-page',
  imports: [DatePipe, FormsModule, RouterLink, UIChart, ButtonModule, SelectModule, TableModule,
    ProgressBarModule, MessageModule, HeaderNavbarComponent, LoadingComponent],
  template: `
    <app-header-navbar />
    <main class="dashboard-shell">
      <header class="page-heading">
        <div><span class="eyebrow">ACOMPANHAMENTO PEDAGÓGICO</span>
          <h1>Desempenho das turmas</h1>
          <p>Uma visão do aprendizado, da primeira tentativa à conclusão.</p>
        </div>
        <p-button label="Atualizar" icon="pi pi-refresh" severity="secondary" [outlined]="true"
          [disabled]="isLoading()" (onClick)="loadDashboard()" />
      </header>

      @if (isLoading()) {
        <app-loading variant="page" message="Carregando desempenho das turmas..." />
      } @else if (loadError()) {
        <p-message severity="error">{{ loadError() }}</p-message>
        <p-button label="Tentar novamente" icon="pi pi-refresh" (onClick)="loadDashboard()" />
      } @else if (!dashboard()?.classes?.length) {
        <section class="empty-state">
          <i class="pi pi-users" aria-hidden="true"></i>
          <h2>O acompanhamento começa pela sua primeira turma</h2>
          <p>Crie uma turma, convide os alunos e atribua desafios para acompanhar os resultados aqui.</p>
          <p-button label="Gerenciar turmas" icon="pi pi-arrow-right" routerLink="/classes" />
        </section>
      } @else {
        <div class="scope-toolbar">
          <div class="scope-select"><label for="dashboard-class">Turma</label>
            <p-select inputId="dashboard-class" [options]="classOptions()" optionLabel="label" optionValue="value"
              [ngModel]="selectedClassId()" (ngModelChange)="selectClass($event)" [filter]="true"
              filterBy="label" [fluid]="true" emptyFilterMessage="Nenhuma turma encontrada" />
          </div>
          <span class="updated-at">Atualizado em {{ dashboard()?.generatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>

        <section class="metrics-grid" aria-label="Indicadores de desempenho">
          <article class="metric-card">
            <div class="metric-label"><span>Matrículas</span><i class="pi pi-users" aria-hidden="true"></i></div>
            <strong class="big-number">{{ countFormatter.format(totals().students) }}</strong>
            <span class="metric-detail">{{ totals().activeStudents }} com tentativas ou conclusão</span>
          </article>
          <article class="metric-card">
            <div class="metric-label"><span>Desafios</span><i class="pi pi-bullseye" aria-hidden="true"></i></div>
            <strong class="big-number">{{ countFormatter.format(totals().challenges) }}</strong>
            <span class="metric-detail">em {{ visibleClasses().length }} {{ visibleClasses().length === 1 ? 'turma' : 'turmas' }}</span>
          </article>
          <article class="metric-card">
            <div class="metric-label"><span>Tentativas</span><i class="pi pi-gauge" aria-hidden="true"></i></div>
            <strong class="big-number">{{ countFormatter.format(totals().attempts) }}</strong>
            <span class="metric-detail">registradas nos desafios</span>
          </article>
          <article class="metric-card metric-highlight">
            <div class="metric-label"><span>Taxa de conclusão</span><i class="pi pi-check-circle" aria-hidden="true"></i></div>
            <strong class="big-number">{{ percentFormatter.format(completionRate() / 100) }}</strong>
            <span class="metric-detail">{{ totals().completed }} de {{ totals().expected }} atividades concluídas</span>
          </article>
        </section>

        <section class="charts-grid" aria-label="Gráficos de desempenho">
          <article class="panel">
            <div class="panel-heading"><span class="section-index">01 / COMPARATIVO</span>
              <h2>Conclusão por turma</h2>
              <p>Até 12 turmas por taxa de conclusão. Use o filtro para ver qualquer turma.</p>
            </div>
            <p-chart type="bar" [data]="comparisonData()" [options]="comparisonOptions" height="300px"
              ariaLabel="Taxa de conclusão dos desafios por turma, em porcentagem" />
          </article>
          <article class="panel">
            <div class="panel-heading"><span class="section-index">02 / PROGRESSO</span>
              <h2>Onde estão os alunos?</h2><p>Atividades atribuídas aos alunos matriculados.</p>
            </div>
            @if (totals().expected > 0) {
              <p-chart type="doughnut" [data]="progressData()" [options]="progressOptions" height="250px"
                ariaLabel="Distribuição entre atividades concluídas, em andamento e não iniciadas" />
              <div class="progress-legend" aria-label="Valores do gráfico de progresso">
                <span><i class="legend-dot completed"></i>Concluídas <strong>{{ totals().completed }}</strong></span>
                <span><i class="legend-dot ongoing"></i>Em andamento <strong>{{ totals().inProgress }}</strong></span>
                <span><i class="legend-dot pending"></i>Não iniciadas <strong>{{ totals().notStarted }}</strong></span>
              </div>
            } @else {
              <div class="chart-empty"><i class="pi pi-chart-pie" aria-hidden="true"></i>
                <p>Adicione alunos e desafios à turma para acompanhar a distribuição do progresso.</p>
              </div>
            }
          </article>
        </section>

        <section class="panel class-table" aria-labelledby="class-table-title">
          <div class="table-heading"><div class="panel-heading"><span class="section-index">03 / DETALHAMENTO</span>
            <h2 id="class-table-title">Cada turma, de perto</h2><p>Compare participação e resultados sem perder o contexto.</p>
          </div><a routerLink="/challenges" class="text-link">Gerenciar desafios <i class="pi pi-arrow-up-right" aria-hidden="true"></i></a></div>
          <p-table [value]="visibleClasses()" dataKey="classId" [paginator]="visibleClasses().length > 10"
            [rows]="10" [rowsPerPageOptions]="[10, 20, 50]" [tableStyle]="{ 'min-width': '800px' }">
            <ng-template #header><tr>
              <th pSortableColumn="className">Turma <p-sortIcon field="className" /></th>
              <th pSortableColumn="studentCount">Matrículas <p-sortIcon field="studentCount" /></th>
              <th pSortableColumn="activeStudents">Alunos ativos <p-sortIcon field="activeStudents" /></th>
              <th pSortableColumn="challengeCount">Desafios <p-sortIcon field="challengeCount" /></th>
              <th pSortableColumn="totalAttempts">Tentativas <p-sortIcon field="totalAttempts" /></th>
              <th pSortableColumn="completionRate">Conclusão <p-sortIcon field="completionRate" /></th>
            </tr></ng-template>
            <ng-template #body let-classPerformance><tr>
              <td><strong class="class-name">{{ classPerformance.className }}</strong>
                <span class="class-meta">{{ classPerformance.classCode }} · {{ shiftLabel(classPerformance.shift) }}</span></td>
              <td>{{ classPerformance.studentCount }}</td><td>{{ classPerformance.activeStudents }}</td>
              <td>{{ classPerformance.challengeCount }}</td><td>{{ classPerformance.totalAttempts }}</td>
              <td><div class="completion-cell"><span>{{ percentFormatter.format(classPerformance.completionRate / 100) }}</span>
                <p-progressbar [value]="classPerformance.completionRate" [showValue]="false" [style]="{ height: '6px' }" />
                <small>{{ classPerformance.completedAssignments }} atividades concluídas</small>
              </div></td>
            </tr></ng-template>
          </p-table>
          <p class="data-note">Ativos: alunos com ao menos uma tentativa ou conclusão. A taxa considera todos os desafios
            atribuídos aos alunos atualmente matriculados. Um aluno em duas turmas conta como duas matrículas.</p>
        </section>
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .dashboard-shell { max-width: 1320px; margin: auto; padding: 36px 28px 56px; }
    .page-heading, .scope-toolbar, .table-heading { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
    .eyebrow, .section-index { font-family: 'Courier New', monospace; font-size: .68rem; letter-spacing: .1em; font-weight: 700; color: #0072c7; }
    h1 { margin: 8px 0; font-size: clamp(1.7rem, 3vw, 2.2rem); letter-spacing: -.045em; color: #0f172a; }
    h2 { color: #0f172a; font-size: 1.05rem; margin: 8px 0; }
    .page-heading p, .panel-heading p, .empty-state p { margin: 0; color: #64748b; font-size: .85rem; line-height: 1.65; }
    .scope-toolbar { margin: 30px 0 24px; padding: 18px 0; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
    .scope-select { width: min(100%, 370px); display: grid; gap: 8px; }
    label { font-size: .75rem; color: #334155; font-weight: 700; }
    .updated-at { font-size: .72rem; color: #64748b; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
    .metric-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 22px; display: grid; gap: 14px; }
    .metric-label { display: flex; justify-content: space-between; align-items: center; gap: 10px; color: #475569; font-size: .8rem; font-weight: 600; }
    .metric-label i { color: #0072c7; }
    .big-number { font-size: clamp(2rem, 3vw, 2.8rem); font-weight: 800; color: #0f172a; letter-spacing: -.06em; font-variant-numeric: tabular-nums; line-height: 1; }
    .metric-detail { font-size: .7rem; color: #64748b; line-height: 1.5; }
    .metric-highlight { background: #eef8ff; border-color: #8ed5ff; }
    .metric-highlight .big-number { color: #0072c7; }
    .charts-grid { display: grid; grid-template-columns: 1.25fr 1fr; gap: 24px; margin: 24px 0; }
    .panel { background: #f8fafc; border: 1px solid #cbd5e1; padding: 24px; border-radius: 12px; min-width: 0; }
    .panel-heading { margin-bottom: 24px; }
    .progress-legend { margin-top: 16px; display: grid; gap: 9px; }
    .progress-legend span { display: flex; align-items: center; gap: 8px; font-size: .76rem; color: #475569; }
    .progress-legend strong { margin-left: auto; color: #0f172a; font-variant-numeric: tabular-nums; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .completed { background: #0099ff; } .ongoing { background: #f59e0b; } .pending { background: #cbd5e1; }
    .chart-empty, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; color: #64748b; }
    .chart-empty { min-height: 280px; padding: 24px; font-size: .85rem; line-height: 1.7; }
    .chart-empty i, .empty-state > i { font-size: 2rem; color: #0099ff; }
    .empty-state { margin-top: 32px; padding: 64px 24px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; }
    .empty-state h2 { margin: 0; } .empty-state p { max-width: 480px; }
    .text-link { font-size: .78rem; color: #0072c7; text-decoration: none; white-space: nowrap; font-weight: 700; }
    .text-link i { margin-left: 6px; font-size: .7rem; }
    .class-name { display: block; color: #334155; font-size: .82rem; }
    .class-meta { display: block; font-size: .7rem; margin-top: 6px; color: #64748b; }
    .completion-cell { min-width: 120px; display: grid; gap: 6px; font-size: .8rem; font-weight: 700; }
    .completion-cell small { font-weight: 400; color: #64748b; font-size: .65rem; }
    .data-note { font-size: .72rem; color: #64748b; line-height: 1.7; margin: 20px 0 0; }
    @media (max-width: 1000px) { .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .charts-grid { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .dashboard-shell { padding: 24px 16px; } .page-heading, .scope-toolbar, .table-heading { align-items: flex-start; flex-direction: column; gap: 16px; } .metric-card { padding: 16px; } .panel { padding: 18px; } .metrics-grid { gap: 12px; } }
  `]
})
export class TeacherDashboardPageComponent {
  private readonly dashboardService = inject(TeacherDashboardService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dashboard = signal<TeacherDashboard | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly selectedClassId = signal<number | null>(null);
  readonly countFormatter = new Intl.NumberFormat('pt-BR');
  readonly percentFormatter = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
  readonly shiftLabel = shiftLabel;
  readonly classOptions = computed(() => [{ label: 'Todas as turmas', value: null as number | null },
    ...(this.dashboard()?.classes ?? []).map((classPerformance) => ({
      label: `${classPerformance.className} (${classPerformance.classCode})`, value: classPerformance.classId
    }))]);
  readonly visibleClasses = computed(() => (this.dashboard()?.classes ?? [])
    .filter((classPerformance) => this.selectedClassId() === null || classPerformance.classId === this.selectedClassId()));
  readonly totals = computed(() => this.visibleClasses().reduce((summary, classPerformance) => ({
    students: summary.students + classPerformance.studentCount,
    challenges: summary.challenges + classPerformance.challengeCount,
    activeStudents: summary.activeStudents + classPerformance.activeStudents,
    attempts: summary.attempts + classPerformance.totalAttempts,
    completed: summary.completed + classPerformance.completedAssignments,
    inProgress: summary.inProgress + classPerformance.inProgressAssignments,
    notStarted: summary.notStarted + classPerformance.notStartedAssignments,
    expected: summary.expected + classPerformance.studentCount * classPerformance.challengeCount
  }), { students: 0, challenges: 0, activeStudents: 0, attempts: 0, completed: 0, inProgress: 0, notStarted: 0, expected: 0 }));
  readonly completionRate = computed(() => this.totals().expected === 0 ? 0
    : this.totals().completed * 100 / this.totals().expected);
  readonly comparisonData = computed<ChartData<'bar'>>(() => {
    const chartClasses = [...this.visibleClasses()].sort((firstClass, secondClass) =>
      secondClass.completionRate - firstClass.completionRate || firstClass.className.localeCompare(secondClass.className)).slice(0, 12);
    return { labels: chartClasses.map((classPerformance) => `${classPerformance.className} (${classPerformance.classCode})`),
      datasets: [{ label: 'Conclusão (%)', data: chartClasses.map((classPerformance) => classPerformance.completionRate),
        backgroundColor: '#0099ff', borderRadius: 5, maxBarThickness: 24 }] };
  });
  readonly progressData = computed<ChartData<'doughnut'>>(() => ({
    labels: ['Concluídas', 'Em andamento', 'Não iniciadas'],
    datasets: [{ data: [this.totals().completed, this.totals().inProgress, this.totals().notStarted],
      backgroundColor: ['#0099ff', '#f59e0b', '#cbd5e1'], borderWidth: 0, hoverOffset: 4 }]
  }));
  readonly comparisonOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { min: 0, max: 100, ticks: { callback: (tickValue) => `${tickValue}%` } },
      y: { grid: { display: false }, ticks: { autoSkip: false } } }
  };
  readonly progressOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, cutout: '74%', plugins: { legend: { display: false } }
  };

  constructor() {
    this.loadDashboard();
  }

  selectClass(classId: number | null): void {
    this.selectedClassId.set(this.dashboard()?.classes.some((classPerformance) => classPerformance.classId === classId)
      ? classId : null);
  }

  loadDashboard(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.loadError.set('');
    this.dashboardService.getDashboard().pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.selectClass(this.selectedClassId());
      },
      error: (httpError: HttpErrorResponse) => this.loadError.set(httpError.status === 0
        ? 'Não foi possível conectar à API. Tente novamente.'
        : (httpError.error as { message?: string } | null)?.message ?? 'Não foi possível carregar o desempenho das turmas.')
    });
  }
}
