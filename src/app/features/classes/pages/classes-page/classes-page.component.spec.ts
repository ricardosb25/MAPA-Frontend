import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClassesPageComponent } from './classes-page.component';
import { ClassService } from '../../../../core/services/class.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PageResponse } from '../../../../core/models/pagination.model';
import {
  ClassDetailModel,
  ClassModel,
  ClassPayload,
  ClassQuery,
} from '../../../../core/models/class.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';
import { UserModel } from '../../../../core/models/auth.model';

const buildClass = (overrides: Partial<ClassModel> = {}): ClassModel => ({
  id: 1,
  name: 'Turma A',
  code: 'TUR-1A',
  shift: 'EVENING',
  professorName: 'Ricardo Bissaco',
  studentCount: 1,
  createdAt: '2026-02-01T00:00:00Z',
  ...overrides,
});

const buildClassDetail = (overrides: Partial<ClassDetailModel> = {}): ClassDetailModel => ({
  ...buildClass(),
  students: [
    {
      studentId: 11,
      fullName: 'Ana Lima',
      email: 'ana@student.mapa.edu',
      joinedAt: '2026-02-02T00:00:00Z',
    },
  ],
  ...overrides,
});

const buildClassesPage = (classes: ClassModel[]): PageResponse<ClassModel> => ({
  content: classes,
  page: 0,
  size: 6,
  totalElements: classes.length,
  totalPages: classes.length > 0 ? 1 : 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
  sort: 'name, ASC',
});

const buildClassServiceStub = (classes: ClassModel[], detail: ClassDetailModel) => {
  const receivedQueries: ClassQuery[] = [];
  const receivedDetailIds: (number | string)[] = [];
  const receivedCreatePayloads: ClassPayload[] = [];
  const receivedRegeneratedIds: (number | string)[] = [];
  return {
    receivedQueries,
    receivedDetailIds,
    receivedCreatePayloads,
    receivedRegeneratedIds,
    service: {
      getTeacherClassesPage: (query: ClassQuery) => {
        receivedQueries.push(query);
        return of(buildClassesPage(classes));
      },
      getClassDetail: (classId: number | string) => {
        receivedDetailIds.push(classId);
        return of(detail);
      },
      createClass: (payload: ClassPayload) => {
        receivedCreatePayloads.push(payload);
        return of(buildClass({ id: 7, name: payload.name, shift: payload.shift, code: 'NOV-7X' }));
      },
      updateClass: (classId: number | string, payload: ClassPayload) =>
        of(buildClass({ id: Number(classId), name: payload.name, shift: payload.shift })),
      deleteClass: () => of(undefined),
      regenerateClassCode: (classId: number | string) => {
        receivedRegeneratedIds.push(classId);
        return of(buildClass({ code: 'TUR-9Z' }));
      },
      removeStudent: () => of(undefined),
      getMyClassesPage: () => of(buildClassesPage(classes)),
      joinClass: () => of(buildClass()),
      leaveClass: () => of(undefined),
    },
  };
};

const buildAuthServiceStub = () => {
  const currentUser: UserModel = {
    id: '5',
    fullName: 'Ricardo Bissaco',
    email: 'professor@mapa.edu',
    role: UserProfileType.TEACHER,
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

describe('ClassesPageComponent', () => {
  const classes = [
    buildClass(),
    buildClass({ id: 2, name: 'Turma B', code: 'TUR-2B', shift: 'MORNING', studentCount: 0 }),
  ];

  const configureTestingModule = async (
    teacherClasses: ClassModel[],
    detail?: ClassDetailModel,
  ) => {
    const classServiceStub = buildClassServiceStub(teacherClasses, detail ?? buildClassDetail());
    await TestBed.configureTestingModule({
      imports: [ClassesPageComponent],
      providers: [
        provideRouter([]),
        { provide: ClassService, useValue: classServiceStub.service },
        { provide: AuthService, useValue: buildAuthServiceStub() },
      ],
    }).compileComponents();
    return classServiceStub;
  };

  const createPageFixture = async () => {
    const fixture = TestBed.createComponent(ClassesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should request the first page with the default query and render the teacher classes', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const listItems = element.querySelectorAll('.class-list-item');
    expect(listItems.length).toBe(2);
    expect(element.querySelector('.class-item-name')?.textContent).toContain('Turma A');
    expect(element.querySelector('.code-badge')?.textContent).toContain('TUR-1A');

    const firstQuery = classServiceStub.receivedQueries[0];
    expect(firstQuery.search).toBe('');
    expect(firstQuery.shift).toBeNull();
    expect(firstQuery.page).toBe(0);
    expect(firstQuery.size).toBe(6);
    expect(firstQuery.sort).toBe('name,ASC');
  });

  it('should request the first page filtered by shift when the shift select changes', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const shiftSelect = element.querySelector('.shift-select') as HTMLSelectElement;
    shiftSelect.value = 'MORNING';
    shiftSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const lastQuery = classServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.shift).toBe('MORNING');
    expect(lastQuery?.page).toBe(0);
  });

  it('should load and render the detail of the selected class', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const firstListItem = element.querySelector('.class-list-item') as HTMLButtonElement;
    firstListItem.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(classServiceStub.receivedDetailIds).toEqual([1]);
    expect(element.querySelector('.detail-code-label')?.textContent).toContain('TUR-1A');
    expect(element.querySelector('.student-name')?.textContent).toContain('Ana Lima');
  });

  it('should create a class with the informed name and shift', async () => {
    const classServiceStub = await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as ClassesPageComponent;

    component.createForm.setValue({ name: 'Turma Nova', shift: 'AFTERNOON' });
    fixture.detectChanges();

    const createForm = element.querySelector('.new-class-card form') as HTMLFormElement;
    createForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(classServiceStub.receivedCreatePayloads).toEqual([
      { name: 'Turma Nova', shift: 'AFTERNOON' },
    ]);
    expect(element.querySelector('.feedback-toast')?.textContent).toContain('criada com o código');
  });

  it('should ask for the name of the class when the create form is submitted empty', async () => {
    const classServiceStub = await configureTestingModule([]);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const createForm = element.querySelector('.new-class-card form') as HTMLFormElement;
    createForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(classServiceStub.receivedCreatePayloads.length).toBe(0);
    expect(element.querySelector('.new-class-card .field-error')?.textContent).toContain(
      'Informe o nome da turma',
    );
  });

  it('should regenerate the class code after the confirmation dialog is accepted', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.class-list-item') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const detailButtons = element.querySelectorAll('.detail-actions .secondary-button');
    (detailButtons[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('.dialog-message')?.textContent).toContain('TUR-1A');

    const confirmationCheckbox = element.querySelector(
      '.confirmation-checkbox',
    ) as HTMLInputElement;
    confirmationCheckbox.click();
    fixture.detectChanges();

    (element.querySelector('.danger-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(classServiceStub.receivedRegeneratedIds).toEqual([1]);
    expect(element.querySelector('.feedback-toast')?.textContent).toContain('Novo código gerado');
  });

  it('should keep the filters when the page size changes', async () => {
    const classServiceStub = await configureTestingModule(classes);
    const fixture = await createPageFixture();
    const element = fixture.nativeElement as HTMLElement;

    const shiftSelect = element.querySelector('.shift-select') as HTMLSelectElement;
    shiftSelect.value = 'AFTERNOON';
    shiftSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const component = fixture.componentInstance as ClassesPageComponent;
    component.handleSizeChange(12);
    fixture.detectChanges();

    const lastQuery = classServiceStub.receivedQueries.at(-1);
    expect(lastQuery?.shift).toBe('AFTERNOON');
    expect(lastQuery?.size).toBe(12);
    expect(lastQuery?.page).toBe(0);
  });
});
