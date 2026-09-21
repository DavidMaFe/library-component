import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from 'jest-axe';
import { LcSwitch } from './switch';

@Component({
  imports: [LcSwitch, ReactiveFormsModule],
  template: `<lc-switch [formControl]="control">Home delivery</lc-switch>`,
})
class HostComponent {
  control = new FormControl(false);
}

describe('LcSwitch', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      input: root.querySelector('input') as HTMLInputElement,
      element: root.querySelector('lc-switch') as HTMLElement,
    };
  };

  it('should expose the switch role with its label', async () => {
    const { input, element } = await setup();

    expect(input.getAttribute('role')).toBe('switch');
    expect(element.textContent).toContain('Home delivery');
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
  });

  it('should be disabled from the form', async () => {
    const { fixture, host, input, element } = await setup();

    host.control.disable();
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
    expect(element.hasAttribute('data-disabled')).toBe(true);
  });

  it('should mark the control as touched on blur', async () => {
    const { host, input } = await setup();

    input.dispatchEvent(new Event('blur'));

    expect(host.control.touched).toBe(true);
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
