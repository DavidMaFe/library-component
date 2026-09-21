import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_LC_ERROR_MESSAGES,
  LC_ERROR_MESSAGES,
  provideLcErrorMessages,
  resolveErrorMessages,
} from './form-error-messages';

describe('resolveErrorMessages', () => {
  it('should return nothing without errors', () => {
    expect(resolveErrorMessages(null, DEFAULT_LC_ERROR_MESSAGES)).toEqual([]);
  });

  it('should use static messages', () => {
    expect(
      resolveErrorMessages({ required: true }, DEFAULT_LC_ERROR_MESSAGES),
    ).toEqual(['This field is required.']);
  });

  it('should build messages from the validator payload', () => {
    const errors = { minlength: { requiredLength: 5, actualLength: 2 } };

    expect(resolveErrorMessages(errors, DEFAULT_LC_ERROR_MESSAGES)).toEqual([
      'Enter at least 5 characters.',
    ]);
  });

  it('should prefer earlier sources', () => {
    const messages = resolveErrorMessages(
      { required: true },
      { required: 'Tell us your name.' },
      DEFAULT_LC_ERROR_MESSAGES,
    );

    expect(messages).toEqual(['Tell us your name.']);
  });

  it('should fall back to a string payload for custom validators', () => {
    expect(
      resolveErrorMessages({ taken: 'Email already registered.' }, {}),
    ).toEqual(['Email already registered.']);
  });

  it('should fall back to a generic message for unknown errors', () => {
    expect(resolveErrorMessages({ custom: true }, {})).toEqual([
      'This value is not valid.',
    ]);
  });

  it('should keep the order of the errors', () => {
    const messages = resolveErrorMessages(
      { email: true, required: true },
      DEFAULT_LC_ERROR_MESSAGES,
    );

    expect(messages).toEqual([
      'Enter a valid email address.',
      'This field is required.',
    ]);
  });
});

describe('provideLcErrorMessages', () => {
  it('should merge custom messages over the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideLcErrorMessages({ required: 'Campo obligatorio.' })],
    });

    const messages = TestBed.inject(LC_ERROR_MESSAGES);

    expect(messages['required']).toBe('Campo obligatorio.');
    expect(messages['email']).toBe(DEFAULT_LC_ERROR_MESSAGES['email']);
  });
});
