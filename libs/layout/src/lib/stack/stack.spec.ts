import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LcSpace } from '../shared/layout.types';
import {
  LcStack,
  LcStackAlign,
  LcStackDirection,
  LcStackJustify,
} from './stack';

@Component({
  imports: [LcStack],
  template: `
    <lc-stack
      [direction]="direction()"
      [gap]="gap()"
      [align]="align()"
      [justify]="justify()"
      [wrap]="wrap()"
    >
      <span>A</span><span>B</span>
    </lc-stack>
  `,
})
class HostComponent {
  direction = signal<LcStackDirection>('column');
  gap = signal<LcSpace>('4');
  align = signal<LcStackAlign>('stretch');
  justify = signal<LcStackJustify>('start');
  wrap = signal(false);
}

describe('LcStack', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      stack: fixture.nativeElement.querySelector('lc-stack') as HTMLElement,
    };
  };

  it('should default to a column with a medium gap', async () => {
    const { stack } = await setup();

    expect(stack.getAttribute('data-direction')).toBe('column');
    expect(stack.getAttribute('data-gap')).toBe('4');
    expect(stack.getAttribute('data-align')).toBe('stretch');
    expect(stack.getAttribute('data-justify')).toBe('start');
    expect(stack.hasAttribute('data-wrap')).toBe(false);
  });

  it('should project its children', async () => {
    const { stack } = await setup();

    expect(stack.textContent).toBe('AB');
  });

  it('should reflect every option', async () => {
    const { fixture, host, stack } = await setup();

    host.direction.set('row');
    host.gap.set('8');
    host.align.set('center');
    host.justify.set('between');
    host.wrap.set(true);
    await fixture.whenStable();

    expect(stack.getAttribute('data-direction')).toBe('row');
    expect(stack.getAttribute('data-gap')).toBe('8');
    expect(stack.getAttribute('data-align')).toBe('center');
    expect(stack.getAttribute('data-justify')).toBe('between');
    expect(stack.hasAttribute('data-wrap')).toBe(true);
  });
});
