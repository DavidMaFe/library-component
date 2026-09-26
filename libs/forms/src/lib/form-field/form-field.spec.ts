import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { axe } from 'jest-axe';
import { LcInput } from '../input/input';
import { LcRadio } from '../radio/radio';
import { LcRadioGroup } from '../radio/radio-group';
import { LcErrorMessages, provideLcErrorMessages } from './form-error-messages';
import { LcFormField } from './form-field';

@Component({
  imports: [LcFormField, LcInput, ReactiveFormsModule],
  template: `
    <lc-form-field
      [label]="label"
      [hint]="hint"
      [errors]="errors"
      [required]="required"
    >
      <input lc-input type="text" [formControl]="control" />
    </lc-form-field>
  `,
})
class TextFieldHost {
  label = 'Email';
  hint = '';
  errors: LcErrorMessages = {};
  required: boolean | undefined = undefined;
  control = new FormControl('', [Validators.required, Validators.email]);
}

@Component({
  imports: [LcFormField, LcRadioGroup, LcRadio, ReactiveFormsModule],
  template: `
    <lc-form-field label="Size">
      <lc-radio-group [formControl]="control">
        <lc-radio value="s">Small</lc-radio>
        <lc-radio value="l">Large</lc-radio>
      </lc-radio-group>
    </lc-form-field>
  `,
})
class GroupFieldHost {
  control = new FormControl<string | null>(null, Validators.required);
}

describe('LcFormField', () => {
  const setup = async (
    configure: (host: TextFieldHost) => void = () => undefined,
  ) => {
    const fixture = TestBed.createComponent(TextFieldHost);
    configure(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      input: root.querySelector('input') as HTMLInputElement,
      label: () => root.querySelector('label'),
      error: () => root.querySelector('.error') as HTMLElement,
    };
  };

  describe('label', () => {
    it('should associate the label with the control', async () => {
      const { input, label } = await setup();

      expect(label()?.textContent).toContain('Email');
      expect(input.id).toBeTruthy();
      expect(label()?.getAttribute('for')).toBe(input.id);
    });

    it('should not render a label without text', async () => {
      const { label } = await setup((host) => (host.label = ''));

      expect(label()).toBeNull();
    });

    it('should mark the field as required when the control has Validators.required', async () => {
      const { label } = await setup();

      expect(
        label()?.querySelector('.required')?.getAttribute('aria-hidden'),
      ).toBe('true');
    });

    it('should let the required input override the validators', async () => {
      const { label } = await setup((host) => (host.required = false));

      expect(label()?.querySelector('.required')).toBeNull();
    });
  });

  describe('hint', () => {
    it('should render the hint and describe the control with it', async () => {
      const { root, input } = await setup(
        (host) => (host.hint = 'We never share it'),
      );

      const hint = root.querySelector('.hint') as HTMLElement;
      expect(hint.textContent).toContain('We never share it');
      expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('should not describe the control when there is nothing to describe', async () => {
      const { input } = await setup();

      expect(input.hasAttribute('aria-describedby')).toBe(false);
    });
  });

  describe('errors', () => {
    it('should stay quiet until the control is touched', async () => {
      const { fixture, error, input } = await setup();

      expect(error().textContent?.trim()).toBe('');

      fixture.componentInstance.control.markAsDirty();
      await fixture.whenStable();

      expect(error().textContent?.trim()).toBe('');
      expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('should show the first error once the control is touched', async () => {
      const { fixture, host, error, input } = await setup();

      host.control.markAsTouched();
      await fixture.whenStable();

      expect(error().textContent).toContain('This field is required.');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(error().id);
    });

    it('should put a decorative alert icon in front of the error', async () => {
      const { fixture, host, error } = await setup();

      host.control.markAsTouched();
      await fixture.whenStable();

      const message = error().querySelector('p') as HTMLElement;
      const icon = message.firstElementChild;
      expect(icon?.tagName.toLowerCase()).toBe('svg');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(message.textContent).toBe('This field is required.');
    });

    it('should update the message as the value changes', async () => {
      const { fixture, host, error } = await setup();
      host.control.markAsTouched();
      host.control.setValue('nope');
      await fixture.whenStable();

      expect(error().textContent).toContain('Enter a valid email address.');

      host.control.setValue('a@b.com');
      await fixture.whenStable();

      expect(error().textContent?.trim()).toBe('');
    });

    it('should keep the error region as a polite live region', async () => {
      const { error } = await setup();

      expect(error().getAttribute('aria-live')).toBe('polite');
    });

    it('should describe the control with both hint and error', async () => {
      const { fixture, host, root, input } = await setup(
        (h) => (h.hint = 'Work email'),
      );

      host.control.markAsTouched();
      await fixture.whenStable();

      const hintId = root.querySelector('.hint')?.id;
      expect(input.getAttribute('aria-describedby')).toBe(
        `${hintId} ${root.querySelector('.error')?.id}`,
      );
    });

    it('should prefer per-field messages over global ones', async () => {
      const { fixture, host, error } = await setup(
        (h) => (h.errors = { required: 'Tell us your email.' }),
      );

      host.control.markAsTouched();
      await fixture.whenStable();

      expect(error().textContent).toContain('Tell us your email.');
    });

    it('should use globally provided messages', async () => {
      TestBed.configureTestingModule({
        providers: [provideLcErrorMessages({ required: 'Campo obligatorio.' })],
      });
      const { fixture, host, error } = await setup();

      host.control.markAsTouched();
      await fixture.whenStable();

      expect(error().textContent).toContain('Campo obligatorio.');
    });
  });

  describe('group controls', () => {
    it('should label groups with aria-labelledby instead of a for attribute', async () => {
      const fixture = TestBed.createComponent(GroupFieldHost);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const group = root.querySelector('lc-radio-group') as HTMLElement;
      const label = root.querySelector('.label') as HTMLElement;

      expect(root.querySelector('label.label')).toBeNull();
      expect(group.getAttribute('aria-labelledby')).toBe(label.id);
      expect(group.getAttribute('aria-required')).toBe('true');
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture, host } = await setup((h) => (h.hint = 'Work email'));
    host.control.markAsTouched();
    await fixture.whenStable();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
