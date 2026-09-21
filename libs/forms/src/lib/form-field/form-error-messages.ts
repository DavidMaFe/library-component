import {
  InjectionToken,
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';

/** A message, or a function building it from the validator error payload. */
export type LcErrorMessage =
  string | ((error: ValidationErrors[string]) => string);

/** Messages keyed by validation error key (`required`, `minlength`...). */
export type LcErrorMessages = Readonly<Record<string, LcErrorMessage>>;

export const DEFAULT_LC_ERROR_MESSAGES: LcErrorMessages = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  minlength: (error) => `Enter at least ${error.requiredLength} characters.`,
  maxlength: (error) =>
    `Enter no more than ${error.requiredLength} characters.`,
  min: (error) => `Must be at least ${error.min}.`,
  max: (error) => `Must be at most ${error.max}.`,
  pattern: 'Enter a value in the expected format.',
};

const FALLBACK_MESSAGE = 'This value is not valid.';

/**
 * Port for translating validation errors. Override it with
 * `provideLcErrorMessages` to localize or reword messages.
 */
export const LC_ERROR_MESSAGES = new InjectionToken<LcErrorMessages>(
  'LC_ERROR_MESSAGES',
  {
    providedIn: 'root',
    factory: () => DEFAULT_LC_ERROR_MESSAGES,
  },
);

/** Adds or replaces messages on top of the defaults. */
export function provideLcErrorMessages(
  messages: LcErrorMessages,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LC_ERROR_MESSAGES,
      useValue: { ...DEFAULT_LC_ERROR_MESSAGES, ...messages },
    },
  ]);
}

/**
 * Turns validation errors into readable messages, in the order of the errors.
 * Sources are consulted in order and the first one defining the key wins.
 * A validator returning a string as its payload is used as its own message.
 */
export function resolveErrorMessages(
  errors: ValidationErrors | null,
  ...sources: readonly LcErrorMessages[]
): string[] {
  if (!errors) return [];

  return Object.entries(errors).map(([key, payload]) => {
    const message = sources.find((source) => key in source)?.[key];
    if (typeof message === 'function') return message(payload);
    if (message !== undefined) return message;
    return typeof payload === 'string' ? payload : FALLBACK_MESSAGE;
  });
}
