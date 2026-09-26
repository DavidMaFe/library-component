import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { axe } from 'jest-axe';
import { LcRadio } from './radio';
import {
  LcRadioAppearance,
  LcRadioGroup,
  LcRadioOrientation,
} from './radio-group';

@Component({
  imports: [LcRadioGroup, LcRadio, ReactiveFormsModule],
  template: `
    <lc-radio-group
      [formControl]="control"
      [orientation]="orientation()"
      [appearance]="appearance()"
      aria-label="Size"
    >
      <lc-radio [value]="small">Small</lc-radio>
      <lc-radio [value]="large">Large</lc-radio>
      <lc-radio value="xl" disabled>Extra large</lc-radio>
    </lc-radio-group>
  `,
})
class HostComponent {
  small = { id: 1 };
  large = { id: 2 };
  orientation = signal<LcRadioOrientation>('vertical');
  appearance = signal<LcRadioAppearance>('default');
  control = new FormControl<unknown>(null);
}

describe('LcRadioGroup', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      group: root.querySelector('lc-radio-group') as HTMLElement,
      radios: Array.from(root.querySelectorAll('input')) as HTMLInputElement[],
    };
  };

  it('should expose the radiogroup role', async () => {
    const { group } = await setup();

    expect(group.getAttribute('role')).toBe('radiogroup');
  });

  it('should give every native radio the same name', async () => {
    const { radios } = await setup();

    expect(radios[0].name).toBeTruthy();
    expect(new Set(radios.map((radio) => radio.name)).size).toBe(1);
  });

  it('should start with nothing selected', async () => {
    const { radios } = await setup();

    expect(radios.map((radio) => radio.checked)).toEqual([false, false, false]);
  });

  it('should select the option matching the form value, whatever its type', async () => {
    const { fixture, host, radios } = await setup();

    host.control.setValue(host.large);
    await fixture.whenStable();

    expect(radios.map((radio) => radio.checked)).toEqual([false, true, false]);
  });

  it('should write the selected option value to the form', async () => {
    const { fixture, host, radios } = await setup();

    radios[0].click();
    await fixture.whenStable();

    expect(host.control.value).toBe(host.small);
    expect(host.control.dirty).toBe(true);
    expect(radios[0].checked).toBe(true);
  });

  it('should move the selection when another option is chosen', async () => {
    const { fixture, radios } = await setup();

    radios[0].click();
    radios[1].click();
    await fixture.whenStable();

    expect(radios.map((radio) => radio.checked)).toEqual([false, true, false]);
  });

  it('should disable individual options', async () => {
    const { radios } = await setup();

    expect(radios[2].disabled).toBe(true);
    expect(radios[0].disabled).toBe(false);
  });

  it('should disable every option when the form disables the group', async () => {
    const { fixture, host, group, radios } = await setup();

    host.control.disable();
    await fixture.whenStable();

    expect(radios.every((radio) => radio.disabled)).toBe(true);
    expect(group.getAttribute('aria-disabled')).toBe('true');
  });

  it('should mark the control as touched when focus leaves the group', async () => {
    const { host, group } = await setup();

    group.dispatchEvent(new Event('focusout'));

    expect(host.control.touched).toBe(true);
  });

  it('should reflect the orientation', async () => {
    const { fixture, host, group } = await setup();
    expect(group.getAttribute('data-orientation')).toBe('vertical');

    host.orientation.set('horizontal');
    await fixture.whenStable();

    expect(group.getAttribute('data-orientation')).toBe('horizontal');
  });

  describe('chip appearance', () => {
    const chips = async () => {
      const api = await setup();
      api.host.appearance.set('chip');
      await api.fixture.whenStable();
      const options = Array.from(
        (api.fixture.nativeElement as HTMLElement).querySelectorAll('lc-radio'),
      );
      return { ...api, options };
    };

    it('should default to the classic appearance', async () => {
      const { group } = await setup();

      expect(group.getAttribute('data-appearance')).toBe('default');
    });

    it('should mark the group and every option as chips', async () => {
      const { group, options } = await chips();

      expect(group.getAttribute('data-appearance')).toBe('chip');
      expect(
        options.map((option) => option.getAttribute('data-appearance')),
      ).toEqual(['chip', 'chip', 'chip']);
    });

    it('should flag the selected chip and keep native radios', async () => {
      const { fixture, host, options, radios } = await chips();

      host.control.setValue(host.large);
      await fixture.whenStable();

      expect(
        options.map((option) => option.hasAttribute('data-checked')),
      ).toEqual([false, true, false]);
      expect(radios.every((radio) => radio.type === 'radio')).toBe(true);
      expect(radios[1].checked).toBe(true);
    });

    it('should select a chip by clicking its label', async () => {
      const { fixture, host, options } = await chips();

      (options[0].querySelector('label') as HTMLElement).click();
      await fixture.whenStable();

      expect(host.control.value).toBe(host.small);
    });

    it('should have no accessibility violations', async () => {
      const { fixture } = await chips();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
