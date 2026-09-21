import { TestBed } from '@angular/core/testing';
import { provideLcTheme } from './theme.config';
import { LC_THEME_STORAGE, LcThemeStorage } from './theme-storage';
import { ThemeService } from './theme.service';

class FakeStorage implements LcThemeStorage {
  readonly values = new Map<string, string>();
  get = (key: string) => this.values.get(key) ?? null;
  set = (key: string, value: string) => void this.values.set(key, value);
}

class FakeMediaQuery {
  private listeners = new Set<(event: MediaQueryListEvent) => void>();
  constructor(public matches: boolean) {}
  addEventListener = (
    _: string,
    listener: (event: MediaQueryListEvent) => void,
  ) => void this.listeners.add(listener);
  removeEventListener = (
    _: string,
    listener: (event: MediaQueryListEvent) => void,
  ) => void this.listeners.delete(listener);
  emit(matches: boolean) {
    this.matches = matches;
    this.listeners.forEach((listener) =>
      listener({ matches } as MediaQueryListEvent),
    );
  }
  get listenerCount() {
    return this.listeners.size;
  }
}

describe('ThemeService', () => {
  const root = document.documentElement;
  let storage: FakeStorage;
  let query: FakeMediaQuery;

  const setup = (
    options: { systemDark?: boolean; stored?: string; config?: object } = {},
  ) => {
    storage = new FakeStorage();
    if (options.stored) storage.values.set('lc-theme', options.stored);
    query = new FakeMediaQuery(options.systemDark ?? false);
    window.matchMedia = jest.fn().mockReturnValue(query);

    TestBed.configureTestingModule({
      providers: [
        { provide: LC_THEME_STORAGE, useValue: storage },
        ...(options.config ? [provideLcTheme(options.config)] : []),
      ],
    });
    return TestBed.inject(ThemeService);
  };

  afterEach(() => {
    root.removeAttribute('data-lc-theme');
    root.removeAttribute('data-brand-theme');
    root.removeAttribute('style');
  });

  describe('theme resolution', () => {
    it('should follow a light system by default', () => {
      const service = setup();

      expect(service.preference()).toBe('system');
      expect(service.theme()).toBe('light');
      expect(root.getAttribute('data-lc-theme')).toBe('light');
    });

    it('should follow a dark system by default', () => {
      const service = setup({ systemDark: true });

      expect(service.theme()).toBe('dark');
      expect(root.getAttribute('data-lc-theme')).toBe('dark');
    });

    it('should use the persisted preference', () => {
      const service = setup({ stored: 'dark' });

      expect(service.preference()).toBe('dark');
      expect(service.theme()).toBe('dark');
    });

    it('should ignore an invalid persisted preference', () => {
      const service = setup({ stored: 'purple' });

      expect(service.preference()).toBe('system');
    });

    it('should use the configured default preference', () => {
      const service = setup({ config: { defaultPreference: 'dark' } });

      expect(service.theme()).toBe('dark');
    });

    it('should use the configured attribute', () => {
      setup({ config: { attribute: 'data-brand-theme' } });

      expect(root.getAttribute('data-brand-theme')).toBe('light');
      expect(root.hasAttribute('data-lc-theme')).toBe(false);
    });

    it('should react to system theme changes while following the system', () => {
      const service = setup();

      query.emit(true);

      expect(service.theme()).toBe('dark');
      expect(root.getAttribute('data-lc-theme')).toBe('dark');
    });

    it('should ignore system theme changes when a theme is chosen explicitly', () => {
      const service = setup({ stored: 'light' });

      query.emit(true);

      expect(service.theme()).toBe('light');
      expect(root.getAttribute('data-lc-theme')).toBe('light');
    });

    it('should stop listening to the system when destroyed', () => {
      setup();
      expect(query.listenerCount).toBe(1);

      TestBed.resetTestingModule();

      expect(query.listenerCount).toBe(0);
    });

    it('should work when matchMedia is unavailable', () => {
      storage = new FakeStorage();
      (window as { matchMedia?: unknown }).matchMedia = undefined;
      TestBed.configureTestingModule({
        providers: [{ provide: LC_THEME_STORAGE, useValue: storage }],
      });

      expect(TestBed.inject(ThemeService).theme()).toBe('light');
    });
  });

  describe('setPreference', () => {
    it('should apply and persist the preference', () => {
      const service = setup();

      service.setPreference('dark');

      expect(service.theme()).toBe('dark');
      expect(root.getAttribute('data-lc-theme')).toBe('dark');
      expect(storage.values.get('lc-theme')).toBe('dark');
    });

    it('should return to the system theme', () => {
      const service = setup({ systemDark: true, stored: 'light' });

      service.setPreference('system');

      expect(service.theme()).toBe('dark');
    });
  });

  describe('toggle', () => {
    it('should switch from light to dark and back', () => {
      const service = setup({ stored: 'light' });

      service.toggle();
      expect(service.theme()).toBe('dark');

      service.toggle();
      expect(service.theme()).toBe('light');
    });

    it('should leave system mode using the opposite of the resolved theme', () => {
      const service = setup({ systemDark: true });

      service.toggle();

      expect(service.preference()).toBe('light');
    });
  });

  describe('applyBrand', () => {
    it('should set the token overrides on the root element', () => {
      const service = setup();

      service.applyBrand({
        '--lc-primary-600': '#b45309',
        '--lc-radius-md': '0px',
      });

      expect(root.style.getPropertyValue('--lc-primary-600')).toBe('#b45309');
      expect(root.style.getPropertyValue('--lc-radius-md')).toBe('0px');
      expect(service.brand()).toEqual({
        '--lc-primary-600': '#b45309',
        '--lc-radius-md': '0px',
      });
    });

    it('should replace the previous brand instead of accumulating it', () => {
      const service = setup();
      service.applyBrand({
        '--lc-primary-600': '#b45309',
        '--lc-radius-md': '0px',
      });

      service.applyBrand({ '--lc-primary-600': '#15803d' });

      expect(root.style.getPropertyValue('--lc-primary-600')).toBe('#15803d');
      expect(root.style.getPropertyValue('--lc-radius-md')).toBe('');
    });

    it('should reject tokens outside the library namespace and change nothing', () => {
      const service = setup();
      service.applyBrand({ '--lc-primary-600': '#b45309' });

      expect(() => service.applyBrand({ '--other': 'red' } as never)).toThrow(
        'Invalid design token "--other"',
      );

      expect(root.style.getPropertyValue('--lc-primary-600')).toBe('#b45309');
      expect(root.style.getPropertyValue('--other')).toBe('');
    });

    it('should keep the brand when the theme changes', () => {
      const service = setup();
      service.applyBrand({ '--lc-primary-600': '#b45309' });

      service.setPreference('dark');

      expect(root.style.getPropertyValue('--lc-primary-600')).toBe('#b45309');
    });
  });

  describe('clearBrand', () => {
    it('should remove every override', () => {
      const service = setup();
      service.applyBrand({ '--lc-primary-600': '#b45309' });

      service.clearBrand();

      expect(root.style.getPropertyValue('--lc-primary-600')).toBe('');
      expect(service.brand()).toEqual({});
    });
  });
});
