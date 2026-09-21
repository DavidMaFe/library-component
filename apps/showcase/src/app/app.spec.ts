import { TestBed } from '@angular/core/testing';
import { ThemeService } from '@lc/core';
import { App } from './app';
import { SHOWCASE_BRANDS } from './brands';

describe('App', () => {
  const root = document.documentElement;

  const setup = async () => {
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  };

  const button = (element: HTMLElement, label: string) =>
    Array.from(element.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === label,
    ) as HTMLButtonElement;

  afterEach(() => {
    root.removeAttribute('data-lc-theme');
    root.removeAttribute('style');
    localStorage.clear();
  });

  it('should render the token sections', async () => {
    const { element } = await setup();

    expect(element.querySelector('h1')?.textContent).toContain('design tokens');
    expect(element.querySelectorAll('section')).toHaveLength(6);
  });

  it('should switch the theme at runtime', async () => {
    const { fixture, element } = await setup();

    button(element, 'dark').click();
    await fixture.whenStable();

    expect(root.getAttribute('data-lc-theme')).toBe('dark');
    expect(button(element, 'dark').getAttribute('aria-pressed')).toBe('true');
    expect(button(element, 'light').getAttribute('aria-pressed')).toBe('false');
  });

  it('should apply a brand at runtime and restore the default one', async () => {
    const { fixture, element } = await setup();
    const service = TestBed.inject(ThemeService);

    button(element, SHOWCASE_BRANDS[1].label).click();
    await fixture.whenStable();
    expect(root.style.getPropertyValue('--lc-primary-600')).toBe('#b45309');
    expect(service.brand()).toEqual(SHOWCASE_BRANDS[1].overrides);

    button(element, SHOWCASE_BRANDS[0].label).click();
    await fixture.whenStable();
    expect(root.style.getPropertyValue('--lc-primary-600')).toBe('');
  });
});
