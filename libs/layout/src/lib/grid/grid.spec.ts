import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LcSpace } from '../shared/layout.types';
import { LcGrid } from './grid';

@Component({
  imports: [LcGrid],
  template: `
    <lc-grid [columns]="columns()" [minItemWidth]="min()" [gap]="gap()"
      ><span>A</span></lc-grid
    >
  `,
})
class HostComponent {
  columns = signal<number | undefined>(undefined);
  min = signal('16rem');
  gap = signal<LcSpace>('4');
}

describe('LcGrid', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      grid: fixture.nativeElement.querySelector('lc-grid') as HTMLElement,
    };
  };

  it('should fit as many columns as possible by default', async () => {
    const { grid } = await setup();

    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(min(16rem, 100%), 1fr))',
    );
  });

  it('should honor the minimum item width', async () => {
    const { fixture, host, grid } = await setup();

    host.min.set('10rem');
    await fixture.whenStable();

    expect(grid.style.gridTemplateColumns).toContain('min(10rem, 100%)');
  });

  it('should use a fixed number of columns', async () => {
    const { fixture, host, grid } = await setup();

    host.columns.set(3);
    await fixture.whenStable();

    expect(grid.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('should keep the column count between 1 and 12', async () => {
    const { fixture, host, grid } = await setup();

    host.columns.set(40);
    await fixture.whenStable();
    expect(grid.style.gridTemplateColumns).toBe('repeat(12, minmax(0, 1fr))');

    host.columns.set(-2);
    await fixture.whenStable();
    expect(grid.style.gridTemplateColumns).toBe('repeat(1, minmax(0, 1fr))');
  });

  it('should reflect the gap', async () => {
    const { fixture, host, grid } = await setup();

    host.gap.set('6');
    await fixture.whenStable();

    expect(grid.getAttribute('data-gap')).toBe('6');
  });
});
