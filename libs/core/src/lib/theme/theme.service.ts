import { DOCUMENT } from '@angular/common';
import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { isLcTokenName, LcBrandOverrides } from '@lc/tokens';
import { LC_THEME_CONFIG } from './theme.config';
import { LC_THEME_STORAGE } from './theme-storage';
import { LcTheme, LcThemePreference } from './theme.types';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const PREFERENCES: readonly LcThemePreference[] = ['light', 'dark', 'system'];

/**
 * Applies the active theme to the document root and lets consumers rebrand
 * the library at runtime by overriding design tokens.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly #document = inject(DOCUMENT);
  readonly #config = inject(LC_THEME_CONFIG);
  readonly #storage = inject(LC_THEME_STORAGE);

  readonly #preference = signal<LcThemePreference>(this.#readPreference());
  readonly #systemPrefersDark = signal(false);
  readonly #brand = signal<LcBrandOverrides>({});

  /** What the user chose (`system` follows the OS). */
  readonly preference = this.#preference.asReadonly();
  /** The theme actually applied. */
  readonly theme = computed<LcTheme>(() => {
    const preference = this.#preference();
    if (preference === 'system')
      return this.#systemPrefersDark() ? 'dark' : 'light';
    return preference;
  });
  /** Token overrides currently applied. */
  readonly brand = this.#brand.asReadonly();

  constructor() {
    this.#watchSystemTheme();
    this.#applyTheme();
  }

  setPreference(preference: LcThemePreference): void {
    this.#preference.set(preference);
    this.#storage.set(this.#config.storageKey, preference);
    this.#applyTheme();
  }

  /** Switches between light and dark, leaving `system` mode. */
  toggle(): void {
    this.setPreference(this.theme() === 'dark' ? 'light' : 'dark');
  }

  /**
   * Replaces the current brand with the given token overrides.
   * @throws if a key does not start with `--lc-`.
   */
  applyBrand(overrides: LcBrandOverrides): void {
    const entries = Object.entries(overrides);
    const invalid = entries.find(([name]) => !isLcTokenName(name));
    if (invalid) {
      throw new Error(
        `Invalid design token "${invalid[0]}": names must start with "--lc-".`,
      );
    }

    this.#clearBrandStyles();
    const root = this.#root();
    for (const [name, value] of entries) {
      if (value !== undefined) root.style.setProperty(name, value);
    }
    this.#brand.set({ ...overrides });
  }

  /** Removes every brand override, restoring the default tokens. */
  clearBrand(): void {
    this.#clearBrandStyles();
    this.#brand.set({});
  }

  #root(): HTMLElement {
    return this.#document.documentElement;
  }

  #applyTheme(): void {
    this.#root().setAttribute(this.#config.attribute, this.theme());
  }

  #clearBrandStyles(): void {
    const root = this.#root();
    for (const name of Object.keys(this.#brand()))
      root.style.removeProperty(name);
  }

  #readPreference(): LcThemePreference {
    const stored = this.#storage.get(this.#config.storageKey);
    return (
      PREFERENCES.find((preference) => preference === stored) ??
      this.#config.defaultPreference
    );
  }

  #watchSystemTheme(): void {
    const query = this.#document.defaultView?.matchMedia?.(DARK_QUERY);
    if (!query) return;

    this.#systemPrefersDark.set(query.matches);
    const listener = (event: MediaQueryListEvent) => {
      this.#systemPrefersDark.set(event.matches);
      this.#applyTheme();
    };
    query.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() =>
      query.removeEventListener('change', listener),
    );
  }
}
