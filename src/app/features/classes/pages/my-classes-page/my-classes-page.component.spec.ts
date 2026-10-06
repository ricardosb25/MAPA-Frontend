import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MyClassesPageComponent } from './my-classes-page.component';
import { ClassService } from '../../../../core/services/class.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PageResponse } from '../../../../core/models/pagination.model';
import { ClassDetailModel, ClassModel, ClassQuery } from '../../../../core/models/class.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';
import { UserModel } from '../../../../core/models/auth.model';

const buildClass = (overrides: Partial<ClassModel> = {}): ClassModel => ({
  id: 1,
  name: 'Turma A',
  code: 'TUR-1A',
  shift: 'EVENING',
  professorName: 'Ricardo Bissaco',
  studentCount: 2,
  createdAt: '2026-02-01T00:00:00Z',
  ...overrides,
});

const buildClassDetail = (schoolClass: ClassModel): ClassDetailModel => ({
  ...schoolClass,
  students: [
    {
      studentId: 11,
      fullName: 'Ana Lima',
      email: 'ana@student.mapa.edu',
      joinedAt: '2026-02-02T00:00:00Z',
    },
  ],
});

const buildClassesPage = (classes: ClassModel[]): PageResponse<ClassModel> => ({
  content: classes,
  page: 0,
  size: 8,
  totalElements: classes.length,
  totalPages: classes.length > 0 ? 1 : 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
  sort: 'name, ASC',
});

const buildClassServiceStub = (classes: ClassModel[], joinedClass: ClassModel) => {
  const receivedQueries: ClassQuery[] = [];
  const receivedJoinCodes: string[] = [];
  const receivedLeaveIds: (number | string)[] = [];
  return {
    receivedQueries,
    receivedJoinCodes,
    receivedLeaveIds,
    service: {
      getMyClassesPage: (query: ClassQuery) => {
        receivedQueries.push(query);
        return of(buildClassesPage(classes));
      },
      joinClass: (code: string) => {
        receivedJoinCodes.push(code);
        return of(joinedClass);
      },
      leaveClass: (classId: number | string) => {
        receivedLeaveIds.push(classId);
        return of(undefined);
      },
      getTeacherClassesPage: () => of(buildClassesPage(classes)),
      getClassDetail: (classId: number | string) =>
        of(buildClassDetail(buildClass({ id: Number(classId) }))),
      createClass: () => of(buildClass()),
      updateClass: () => of(buildClass()),
      deleteClass: () => of(undefined),
      regenerateClassCode: () => of(buildClass()),
      removeStudent: () => of(undefined),
    },
  };
};

const buildAuthServiceStub = () => {
  const currentUser: UserModel = {
    id: '3',
    fullName: 'Ana Lima',
    email: 'ana@student.mapa.edu',
    role: UserProfileType.STUDENT,
    active: true,
  };
  return {
    currentUser$: of(currentUser),
    isAdmin$: of(false),
    isAdmin: () => false,
    getToken: () => 'token',
    isAuthenticated: () => true,
    logout: () => undefined,
  };
};

describe('MyClassesPageComponent', () => {
  const classes = [
    buildClass(),
    buildClass({ id: 2, name: 'Turma B', code: 'TUR-2B', shift: 'MORNING', studentCount: 0 }),
  ];

  const configureTestingModule = async (myClasses: ClassModel[]) => {
    const classServiceStub = buildClassServiceStub(
      myClasses,
      buildClass({ id: 5, name: 'Turma Nova' }),
    );
    await TestBed.configureTestingModule({
      imports: [MyClassesPageComponent],
      providers: [
        provideRouter([]),
        { provide: ClassService, useValue: classServiceStub.service },
        { provide: AuthService, useValue: buildAuthServiceStub() },
      ],
    }).compileComponents();
    return classServiceStub;
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(MyClassesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should request the first page with the default query and render the student classes', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.class-card').length).toBe(2);
    expect(element.querySelector('.class-card-title')?.textContent).toContain('Turma A');
    expect(element.querySelector('.class-card-count')?.textContent).toContain('2 aluno(s)');

    const firstQuery = classServiceStub.receivedQueries[0];
    expect(firstQuery.search).toBe('');
    expect(firstQuery.shift).toBeNull();
    expect(firstQuery.page).toBe(0);
    expect(firstQuery.size).toBe(8);
    expect(firstQuery.sort).toBe('name,ASC');
  });

  it('should join a class using the informed code normalized to uppercase', async () => {
    const classServiceStub = await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const joinInput = element.querySelector('.join-input') as HTMLInputElement;
    joinInput.value = 'aut-2a';
    joinInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const joinForm = element.querySelector('.join-form') as HTMLFormElement;
    joinForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(classServiceStub.receivedJoinCodes).toEqual(['AUT-2A']);
    expect(element.querySelector('.feedback-toast')?.textContent).toContain('Você entrou na turma');
  });

  it('should ask for the class code when the join form is submitted empty', async () => {
    const classServiceStub = await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const joinForm = element.querySelector('.join-form') as HTMLFormElement;
    joinForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(classServiceStub.receivedJoinCodes.length).toBe(0);
    expect(element.querySelector('.form-error-banner')?.textContent).toContain(
      'Informe o código da turma',
    );
  });

  it('should leave the class when the leave button is clicked', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const leaveButton = element.querySelector('.leave-button') as HTMLButtonElement;
    leaveButton.click();
    fixture.detectChanges();

    expect(classServiceStub.receivedLeaveIds).toEqual([1]);
    expect(element.querySelector('.feedback-toast')?.textContent).toContain('Você saiu da turma');
  });

  it('should show the empty state when the student is not enrolled in any class', async () => {
    await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.classes-grid')).toBeNull();
    expect(element.querySelector('.empty-state-title')?.textContent).toContain(
      'Você ainda não participa',
    );
  });

  it('should keep the filters when navigating to another page', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const shiftSelect = element.querySelector('.shift-select') as HTMLSelectElement;
    shiftSelect.value = 'EVENING';
    shiftSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const component = fixture.componentInstance as MyClassesPageComponent;
    component.handlePageChange(1);
    fixture.detectChanges();

    const lastQuery = classServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.shift).toBe('EVENING');
    expect(lastQuery?.page).toBe(1);
  });
});
