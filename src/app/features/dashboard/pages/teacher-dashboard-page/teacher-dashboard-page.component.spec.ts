import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeacherDashboardPageComponent } from './teacher-dashboard-page.component';
import { TeacherDashboardService } from '../../../../core/services/teacher-dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherDashboard } from '../../../../core/models/teacher-dashboard.model';

describe('TeacherDashboardPageComponent', () => {
  const dashboardService = { getDashboard: vi.fn() };
  const dashboard: TeacherDashboard = {
    generatedAt: '2026-10-31T12:00:00Z',
    classes: [
      { classId: 1, className: 'Mecânica A', classCode: 'MEC-AA', shift: 'MORNING', studentCount: 3,
        challengeCount: 2, activeStudents: 1, totalAttempts: 3, completedAssignments: 1,
        inProgressAssignments: 1, notStartedAssignments: 4, completionRate: 16.7 },
      { classId: 2, className: 'Mecânica B', classCode: 'MEC-BB', shift: 'EVENING', studentCount: 1,
        challengeCount: 1, activeStudents: 1, totalAttempts: 2, completedAssignments: 1,
        inProgressAssignments: 0, notStartedAssignments: 0, completionRate: 100 }
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    dashboardService.getDashboard.mockReturnValue(of(dashboard));
    TestBed.configureTestingModule({
      imports: [TeacherDashboardPageComponent],
      providers: [provideRouter([]), { provide: TeacherDashboardService, useValue: dashboardService },
        { provide: AuthService, useValue: { currentUser$: of(null), isAdmin$: of(false) } }]
    });
  });

  it('calculates a weighted completion rate and activity distribution', () => {
    const fixture = TestBed.createComponent(TeacherDashboardPageComponent);
    const component = fixture.componentInstance;
    expect(component.totals().students).toBe(4);
    expect(component.totals().expected).toBe(7);
    expect(component.totals().attempts).toBe(5);
    expect(component.completionRate()).toBeCloseTo(200 / 7);
    expect(component.progressData().datasets[0].data).toEqual([2, 1, 4]);
    fixture.destroy();
  });

  it('updates indicators and charts when a class is selected', () => {
    const fixture = TestBed.createComponent(TeacherDashboardPageComponent);
    const component = fixture.componentInstance;
    component.selectClass(2);
    expect(component.visibleClasses()).toHaveLength(1);
    expect(component.totals().students).toBe(1);
    expect(component.completionRate()).toBe(100);
    expect(component.comparisonData().labels).toEqual(['Mecânica B (MEC-BB)']);
    component.selectClass(null);
    expect(component.visibleClasses()).toHaveLength(2);
    fixture.destroy();
  });

  it('shows shared loading while the request is pending and prevents duplicate refreshes', async () => {
    const response = new Subject<TeacherDashboard>();
    dashboardService.getDashboard.mockReturnValue(response);
    const fixture = TestBed.createComponent(TeacherDashboardPageComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-loading')).not.toBeNull();
    fixture.componentInstance.loadDashboard();
    expect(dashboardService.getDashboard).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('handles a teacher with no classes without fabricating indicators', async () => {
    dashboardService.getDashboard.mockReturnValue(of({ ...dashboard, classes: [] }));
    const fixture = TestBed.createComponent(TeacherDashboardPageComponent);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('primeira turma');
    expect(fixture.componentInstance.completionRate()).toBe(0);
    expect(fixture.nativeElement.querySelector('p-chart')).toBeNull();
    fixture.destroy();
  });

  it('supports retry after an API failure', () => {
    dashboardService.getDashboard.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    const fixture = TestBed.createComponent(TeacherDashboardPageComponent);
    const component = fixture.componentInstance;
    expect(component.loadError()).toContain('conectar');
    expect(component.isLoading()).toBe(false);
    component.loadDashboard();
    expect(component.loadError()).toBe('');
    expect(component.dashboard()).toEqual(dashboard);
    fixture.destroy();
  });

  it('clears a class filter when the class disappears on refresh', () => {
    const fixture = TestBed.createComponent(TeacherDashboardPageComponent);
    const component = fixture.componentInstance;
    component.selectClass(2);
    dashboardService.getDashboard.mockReturnValue(of({ ...dashboard, classes: [dashboard.classes[0]] }));
    component.loadDashboard();
    expect(component.selectedClassId()).toBeNull();
    expect(component.visibleClasses()).toHaveLength(1);
    fixture.destroy();
  });
});
