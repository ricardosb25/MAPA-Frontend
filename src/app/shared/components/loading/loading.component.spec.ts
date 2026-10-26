import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent]
    }).compileComponents();
  });

  it('should render the default message with a status role', () => {
    const fixture = TestBed.createComponent(LoadingComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const container = element.querySelector('[role="status"]');

    expect(container).not.toBeNull();
    expect(container?.textContent).toContain('Carregando...');
  });

  it('should render a custom message', () => {
    const fixture = TestBed.createComponent(LoadingComponent);
    fixture.componentRef.setInput('message', 'Carregando motores...');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Carregando motores...');
  });

  it('should apply the inline layout when variant is inline', () => {
    const fixture = TestBed.createComponent(LoadingComponent);
    fixture.componentRef.setInput('variant', 'inline');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const container = element.querySelector('.loading-container');

    expect(container?.classList.contains('loading-inline')).toBe(true);
  });
});
