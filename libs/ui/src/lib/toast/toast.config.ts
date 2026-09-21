import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { LcToastConfig } from './toast.types';

export const DEFAULT_LC_TOAST_CONFIG: LcToastConfig = {
  position: 'bottom-right',
  duration: 5000,
  maxVisible: 4,
  dismissLabel: 'Dismiss',
  regionLabel: 'Notifications',
};

export const LC_TOAST_CONFIG = new InjectionToken<LcToastConfig>(
  'LC_TOAST_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_LC_TOAST_CONFIG,
  },
);

/** Overrides the toast configuration. Every field is optional. */
export function provideLcToast(
  config: Partial<LcToastConfig> = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LC_TOAST_CONFIG,
      useValue: { ...DEFAULT_LC_TOAST_CONFIG, ...config },
    },
  ]);
}
