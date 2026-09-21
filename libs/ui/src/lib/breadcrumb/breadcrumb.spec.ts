import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcBreadcrumb } from './breadcrumb';
import { LcBreadcrumbItem } from './breadcrumb-item';

@Component({
  imports: [LcBreadcrumb, LcBreadcrumbItem],
  template: `
    <lc-breadcrumb [label]="label()">
      <li lc-breadcrumb-item><a href="/">Home</a></li>
      <li lc-breadcrumb-item><a href="/menu">Menu</a></li>
      <li lc-breadcrumb-item current>Pasta</li>
    </lc-breadcrumb>
  `,
})
class HostComponent {
  label = signal('Breadcrumb');
}

describe('LcBreadcrumb', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, root };
  };

  it('should be a labelled navigation landmark with an ordered list', async () => {
    const { root } = await setup();

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Breadcrumb',
    );
    expect(root.querySelectorAll('nav > ol > li')).toHaveLength(3);
  });

  it('should allow a translated label', async () => {
    const { fixture, host, root } = await setup();

    host.label.set('Ruta de navegación');
    await fixture.whenStable();

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Ruta de navegación',
    );
  });

  it('should render links for ancestors', async () => {
    const { root } = await setup();

    expect(
      Array.from(root.querySelectorAll('a')).map((a) => a.textContent),
    ).toEqual(['Home', 'Menu']);
  });

  it('should mark the current page', async () => {
    const { root } = await setup();

    const current = root.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Pasta');
    expect(root.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
