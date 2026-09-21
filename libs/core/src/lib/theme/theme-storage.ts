import { InjectionToken } from '@angular/core';

/** Port used to persist the theme preference. Replace it to use cookies, a backend, etc. */
export interface LcThemeStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

/** Default adapter: `localStorage`, tolerant to being unavailable (SSR, private mode). */
export const localThemeStorage: LcThemeStorage = {
  get(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Persisting is best effort.
    }
  },
};

export const LC_THEME_STORAGE = new InjectionToken<LcThemeStorage>(
  'LC_THEME_STORAGE',
  {
    providedIn: 'root',
    factory: () => localThemeStorage,
  },
);
