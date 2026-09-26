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
    expect(element.querySelectorAll('section')).toHaveLength(7);
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
    expect(root.style.getPropertyValue('--lc-primary-600')).toBe('#9f3320');
    expect(root.style.getPropertyValue('--lc-accent-950')).toBe('#262a10');
    expect(service.brand()).toEqual(SHOWCASE_BRANDS[1].overrides);

    button(element, SHOWCASE_BRANDS[0].label).click();
    await fixture.whenStable();
    expect(root.style.getPropertyValue('--lc-primary-600')).toBe('');
  });

  it('should offer the four Lienzo brands, each within the brand contract', () => {
    expect(SHOWCASE_BRANDS.map((brand) => brand.label)).toEqual([
      'Lienzo',
      'Trattoria',
      'Nómada',
      'Atlas',
    ]);
    const allowed =
      /^--lc-(primary|accent)-(50|[1-9]00|950)$|^--lc-font-(family|weight)-heading$|^--lc-heading-tracking$|^--lc-radius-(sm|md|lg|xl)$/;
    for (const brand of SHOWCASE_BRANDS) {
      for (const name of Object.keys(brand.overrides)) {
        expect(name).toMatch(allowed);
      }
    }
  });
});
