import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterFormComponent } from './register-form.component';
import { RegisterCredentials } from '../../../../core/models/auth.model';
import { UserProfileType } from '../../../../core/models/user-profile.enum';

describe('RegisterFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  const createForm = (): RegisterFormComponent => {
    const fixture = TestBed.createComponent(RegisterFormComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  const fillRequiredFields = (component: RegisterFormComponent): void => {
    component.registerForm.patchValue({
      fullName: 'Ana Silva',
      email: 'ana@email.com',
      password: 'senha123456',
      confirmPassword: 'senha123456',
      profileType: UserProfileType.STUDENT
    });
  };

  it('should start with the terms checkbox unchecked and the form invalid', () => {
    const component = createForm();

    expect(component.registerForm.get('acceptedTerms')?.value).toBe(false);
    expect(component.registerForm.get('acceptedTerms')?.hasError('required')).toBe(true);
    expect(component.registerForm.invalid).toBe(true);
  });

  it('should not emit the register payload while the terms are not accepted', () => {
    const component = createForm();
    const emissions: RegisterCredentials[] = [];
    component.submitRegisterForm.subscribe((credentials) => emissions.push(credentials));

    fillRequiredFields(component);
    component.handleFormSubmit();

    expect(emissions).toHaveLength(0);
    expect(component.registerForm.get('acceptedTerms')?.hasError('required')).toBe(true);
  });

  it('should emit the register payload with acceptedTerms when the terms are accepted', () => {
    const component = createForm();
    const emissions: RegisterCredentials[] = [];
    component.submitRegisterForm.subscribe((credentials) => emissions.push(credentials));

    fillRequiredFields(component);
    component.registerForm.get('acceptedTerms')?.setValue(true);
    component.handleFormSubmit();

    expect(emissions).toHaveLength(1);
    expect(emissions[0].acceptedTerms).toBe(true);
    expect(component.registerForm.valid).toBe(true);
  });

  it('should open and close the terms of use modal', () => {
    const component = createForm();

    expect(component.isTermsModalOpen).toBe(false);

    component.openTermsModal();
    expect(component.isTermsModalOpen).toBe(true);

    component.closeTermsModal();
    expect(component.isTermsModalOpen).toBe(false);
  });

  it('should render the terms link and the modal when it is open', () => {
    const fixture = TestBed.createComponent(RegisterFormComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const termsLink = Array.from(element.querySelectorAll<HTMLButtonElement>('button.terms-link'))
      .find((button) => button.textContent?.includes('Termos de Uso'));
    expect(termsLink).toBeDefined();
    expect(element.querySelector('app-terms-of-use-modal')).toBeNull();

    termsLink?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.isTermsModalOpen).toBe(true);
    expect(element.querySelector('app-terms-of-use-modal')).not.toBeNull();
  });

  it('should toggle profile dropdown and select a profile option', () => {
    const fixture = TestBed.createComponent(RegisterFormComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const element = fixture.nativeElement as HTMLElement;

    const triggerButton = element.querySelector<HTMLButtonElement>('#profileTypeSelect');
    expect(triggerButton).not.toBeNull();
    expect(component.isProfileDropdownOpen).toBe(false);

    triggerButton?.click();
    fixture.detectChanges();
    expect(component.isProfileDropdownOpen).toBe(true);
    expect(element.querySelector('.custom-dropdown-menu')).not.toBeNull();

    const teacherOption = Array.from(element.querySelectorAll<HTMLLIElement>('.custom-dropdown-option'))
      .find((option) => option.textContent?.includes('Professor'));
    expect(teacherOption).toBeDefined();

    teacherOption?.click();
    fixture.detectChanges();

    expect(component.isProfileDropdownOpen).toBe(false);
    expect(component.registerForm.get('profileType')?.value).toBe(UserProfileType.TEACHER);
    expect(component.selectedProfileLabel).toBe('Professor');
  });

  it('should close profile dropdown when clicking outside', () => {
    const fixture = TestBed.createComponent(RegisterFormComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.isProfileDropdownOpen = true;
    component.handleDocumentClick(new MouseEvent('click'));
    expect(component.isProfileDropdownOpen).toBe(false);
  });
});
