import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { LcThemeConfig } from './theme.types';

export const DEFAULT_LC_THEME_CONFIG: LcThemeConfig = {
  defaultPreference: 'system',
  storageKey: 'lc-theme',
  attribute: 'data-lc-theme',
};

export const LC_THEME_CONFIG = new InjectionToken<LcThemeConfig>(
  'LC_THEME_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_LC_THEME_CONFIG,
  },
);

/** Overrides the theme configuration. Every field is optional. */
export function provideLcTheme(
  config: Partial<LcThemeConfig> = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LC_THEME_CONFIG,
      useValue: { ...DEFAULT_LC_THEME_CONFIG, ...config },
    },
  ]);
}
