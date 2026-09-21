import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { axe } from 'jest-axe';
import { LcFormField } from '../form-field/form-field';
import { LcFormSize } from '../shared/forms.types';
import { LcInput } from './input';

@Component({
  imports: [LcInput, FormsModule],
  template: `
    <input
      lc-input
      id="plain"
      [size]="size()"
      [invalid]="invalid()"
      aria-label="Plain"
      [(ngModel)]="value"
    />
    <textarea lc-input aria-label="Notes"></textarea>
    <select lc-input aria-label="Dish">
      <option>Pizza</option>
    </select>
  `,
})
class StandaloneHost {
  size = signal<LcFormSize>('md');
  invalid = signal(false);
  value = 'hello';
}

@Component({
  imports: [LcInput, LcFormField],
  template: `
    <lc-form-field label="Name" hint="Full name">
      <input lc-input aria-describedby="external" />
    </lc-form-field>
    <p id="external">External help</p>
  `,
})
class FieldHost {}

@Component({
  imports: [LcInput, LcFormField],
  template: `
    <lc-form-field label="Phone">
      <input lc-input id="my-phone" />
    </lc-form-field>
  `,
})
class ExplicitIdHost {}

describe('LcInput', () => {
  describe('standalone', () => {
    const setup = async () => {
      const fixture = TestBed.createComponent(StandaloneHost);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      return {
        fixture,
        host: fixture.componentInstance,
        input: root.querySelector('input') as HTMLInputElement,
        textarea: root.querySelector('textarea') as HTMLTextAreaElement,
        select: root.querySelector('select') as HTMLSelectElement,
      };
    };

    it('should work on input, textarea and select', async () => {
      const { input, textarea, select } = await setup();

      for (const element of [input, textarea, select]) {
        expect(element.getAttribute('data-size')).toBe('md');
      }
    });

    it('should keep native behavior such as ngModel', async () => {
      const { fixture, input } = await setup();
      expect(input.value).toBe('hello');

      input.value = 'changed';
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();

      expect(fixture.componentInstance.value).toBe('changed');
    });

    it('should keep an explicit id when there is no form field', async () => {
      const { input } = await setup();

      expect(input.id).toBe('plain');
    });

    it('should reflect the size', async () => {
      const { fixture, host, input } = await setup();

      host.size.set('lg');
      await fixture.whenStable();

      expect(input.getAttribute('data-size')).toBe('lg');
    });

    it('should flag the invalid state from the invalid input', async () => {
      const { fixture, host, input } = await setup();
      expect(input.hasAttribute('aria-invalid')).toBe(false);

      host.invalid.set(true);
      await fixture.whenStable();

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.hasAttribute('data-invalid')).toBe(true);
    });

    it('should have no accessibility violations', async () => {
      const { fixture } = await setup();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });

  describe('inside a form field', () => {
    it('should get an id from the field and keep the explicit aria-describedby', async () => {
      const fixture = TestBed.createComponent(FieldHost);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const input = root.querySelector('input') as HTMLInputElement;
      const label = root.querySelector('label') as HTMLLabelElement;
      const hint = root.querySelector('.hint') as HTMLElement;

      expect(input.id).toBeTruthy();
      expect(label.getAttribute('for')).toBe(input.id);
      expect(input.getAttribute('aria-describedby')).toBe(
        `external ${hint.id}`,
      );
    });

    it('should keep an explicit id and point the label at it', async () => {
      const fixture = TestBed.createComponent(ExplicitIdHost);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;

      expect(root.querySelector('input')?.id).toBe('my-phone');
      expect(root.querySelector('label')?.getAttribute('for')).toBe('my-phone');
    });

    it('should have no accessibility violations', async () => {
      const fixture = TestBed.createComponent(FieldHost);
      await fixture.whenStable();

      expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
  });
});
