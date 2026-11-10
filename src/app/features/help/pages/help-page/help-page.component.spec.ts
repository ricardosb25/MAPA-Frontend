import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { routes } from '../../../../app.routes';
import { AuthService } from '../../../../core/services/auth.service';
import { HelpPageComponent } from './help-page.component';

describe('HelpPageComponent', () => {
  it('opens a lesson by keyboard from the authenticated help route', async () => {
    const student = { fullName: 'Aluna de teste', role: 'STUDENT' };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideNoopAnimations(),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            getCurrentUser: () => of(student),
            currentUser$: of(student),
            isAdmin$: of(false)
          }
        }
      ]
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/help', HelpPageComponent);
    const page = harness.routeNativeElement!;
    expect(page.querySelector('a[href="/help"][aria-current="page"]')?.textContent).toContain('Ajuda');
    expect(page.querySelectorAll('p-accordion-header')).toHaveLength(15);

    const lessonHeader = page.querySelector<HTMLElement>('#matematica p-accordion-header')!;
    expect(lessonHeader.getAttribute('aria-expanded')).toBe('false');
    lessonHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    harness.detectChanges();

    expect(lessonHeader.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelector('#matematica .formula-panel')?.textContent).toContain('Avanço base');
  });
});
