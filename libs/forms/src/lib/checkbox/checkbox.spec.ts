import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { axe } from 'jest-axe';
import { LcFormField } from '../form-field/form-field';
import { LcCheckbox } from './checkbox';

@Component({
  imports: [LcCheckbox, LcFormField, ReactiveFormsModule],
  template: `
    <lc-form-field hint="Required to continue">
      <lc-checkbox [formControl]="control" [indeterminate]="indeterminate()"
        >I accept the terms</lc-checkbox
      >
    </lc-form-field>
  `,
})
class HostComponent {
  control = new FormControl(false, Validators.requiredTrue);
  indeterminate = signal(false);
}

describe('LcCheckbox', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      input: root.querySelector('input') as HTMLInputElement,
      checkbox: root.querySelector('lc-checkbox') as HTMLElement,
    };
  };

  it('should render a native checkbox with the projected label', async () => {
    const { input, checkbox } = await setup();

    expect(input.type).toBe('checkbox');
    expect(checkbox.textContent).toContain('I accept the terms');
    expect(input.closest('label')?.textContent).toContain('I accept the terms');
  });

  it('should reflect the form value', async () => {
    const { fixture, host, input } = await setup();

    host.control.setValue(true);
    await fixture.whenStable();

    expect(input.checked).toBe(true);
  });

  it('should write user changes to the form', async () => {
    const { fixture, host, input } = await setup();

    input.click();
    await fixture.whenStable();

    expect(host.control.value).toBe(true);
    expect(host.control.dirty).toBe(true);
  });

  it('should treat null as unchecked when the form resets', async () => {
    const { fixture, host, input } = await setup();
    host.control.setValue(true);
    await fixture.whenStable();

    host.control.reset();
    await fixture.whenStable();

    expect(input.checked).toBe(false);
  });

  it('should mark the control as touched on blur', async () => {
    const { host, input } = await setup();

    input.dispatchEvent(new Event('blur'));

    expect(host.control.touched).toBe(true);
  });

  it('should be disabled from the form', async () => {
    const { fixture, host, input, checkbox } = await setup();

    host.control.disable();
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
    expect(checkbox.hasAttribute('data-disabled')).toBe(true);
  });

  it('should show the mixed state', async () => {
    const { fixture, host, input } = await setup();

    host.indeterminate.set(true);
    await fixture.whenStable();

    expect(input.indeterminate).toBe(true);
  });

  it('should take its id and descriptions from the form field', async () => {
    const { fixture, host, root, input } = await setup();
    const hint = root.querySelector('.hint') as HTMLElement;
    expect(input.id).toBe(
      root.querySelector('lc-form-field')?.querySelector('input')?.id,
    );
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);

    host.control.markAsTouched();
    await fixture.whenStable();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(
      root.querySelector('.error')?.id,
    );
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
