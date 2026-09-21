import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcPagination } from './pagination';

@Component({
  imports: [LcPagination],
  template: `
    <lc-pagination
      [total]="total()"
      [pageSize]="pageSize()"
      [(page)]="page"
      [pageLabel]="pageLabel"
      previousLabel="Anterior"
      nextLabel="Siguiente"
    />
  `,
})
class HostComponent {
  total = signal(200);
  pageSize = signal(10);
  page = signal(1);
  pageLabel = (page: number) => `Página ${page}`;
}

describe('LcPagination', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = () =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
    const byLabel = (label: string) =>
      buttons().find((b) => b.getAttribute('aria-label') === label);
    return { fixture, host: fixture.componentInstance, root, buttons, byLabel };
  };

  it('should be a labelled navigation landmark', async () => {
    const { root } = await setup();

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Pagination',
    );
  });

  it('should show the page buttons with translated labels', async () => {
    const { byLabel } = await setup();

    expect(byLabel('Página 1')).toBeDefined();
    expect(byLabel('Página 20')).toBeDefined();
    expect(byLabel('Anterior')).toBeDefined();
    expect(byLabel('Siguiente')).toBeDefined();
  });

  it('should mark the current page', async () => {
    const { byLabel } = await setup();

    expect(byLabel('Página 1')?.getAttribute('aria-current')).toBe('page');
    expect(byLabel('Página 2')?.hasAttribute('aria-current')).toBe(false);
  });

  it('should disable previous on the first page', async () => {
    const { byLabel } = await setup();

    expect(byLabel('Anterior')?.disabled).toBe(true);
    expect(byLabel('Siguiente')?.disabled).toBe(false);
  });

  it('should go to a page when its button is clicked', async () => {
    const { fixture, host, byLabel } = await setup();

    byLabel('Página 3')?.click();
    await fixture.whenStable();

    expect(host.page()).toBe(3);
    expect(byLabel('Página 3')?.getAttribute('aria-current')).toBe('page');
  });

  it('should move with next and previous', async () => {
    const { fixture, host, byLabel } = await setup();

    byLabel('Siguiente')?.click();
    byLabel('Siguiente')?.click();
    await fixture.whenStable();
    expect(host.page()).toBe(3);

    byLabel('Anterior')?.click();
    await fixture.whenStable();
    expect(host.page()).toBe(2);
  });

  it('should disable next on the last page', async () => {
    const { fixture, host, byLabel } = await setup();

    host.page.set(20);
    await fixture.whenStable();

    expect(byLabel('Siguiente')?.disabled).toBe(true);
    expect(byLabel('Anterior')?.disabled).toBe(false);
  });

  it('should show ellipses for long ranges and hide them from assistive technology', async () => {
    const { fixture, host, root } = await setup();

    host.page.set(10);
    await fixture.whenStable();

    const ellipses = root.querySelectorAll('.ellipsis');
    expect(ellipses).toHaveLength(2);
    expect(ellipses[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('should recompute the page count from total and page size', async () => {
    const { fixture, host, byLabel } = await setup();

    host.total.set(25);
    host.pageSize.set(10);
    await fixture.whenStable();

    expect(byLabel('Página 3')).toBeDefined();
    expect(byLabel('Página 4')).toBeUndefined();
  });

  it('should clamp a page beyond the last one', async () => {
    const { fixture, host, byLabel } = await setup();

    host.total.set(25);
    host.page.set(99);
    await fixture.whenStable();

    expect(byLabel('Página 3')?.getAttribute('aria-current')).toBe('page');
  });

  it('should render a single page for an empty list', async () => {
    const { fixture, host, buttons } = await setup();

    host.total.set(0);
    await fixture.whenStable();

    expect(buttons().filter((b) => b.disabled)).toHaveLength(2);
    expect(buttons()).toHaveLength(3);
  });

  it('should have no accessibility violations', async () => {
    const { fixture, host } = await setup();
    host.page.set(10);
    await fixture.whenStable();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
