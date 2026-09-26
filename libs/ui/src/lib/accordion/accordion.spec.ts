import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcAccordion } from './accordion';
import { LcAccordionItem } from './accordion-item';

@Component({
  imports: [LcAccordion, LcAccordionItem],
  template: `
    <lc-accordion [multi]="multi()">
      <lc-accordion-item heading="Allergens" [(expanded)]="first"
        >Gluten, milk</lc-accordion-item
      >
      <lc-accordion-item heading="Opening hours" [headingLevel]="2"
        >9 to 5</lc-accordion-item
      >
      <lc-accordion-item heading="Delivery" disabled
        >Not available</lc-accordion-item
      >
    </lc-accordion>
  `,
})
class HostComponent {
  multi = signal(false);
  first = signal(false);
}

describe('LcAccordion', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const triggers = () =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('.trigger'));
    const panels = () =>
      Array.from(root.querySelectorAll<HTMLElement>('.panel'));
    return { fixture, host: fixture.componentInstance, root, triggers, panels };
  };

  it('should start collapsed', async () => {
    const { triggers, panels } = await setup();

    expect(triggers().map((t) => t.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
      'false',
    ]);
    expect(panels().every((panel) => panel.hidden)).toBe(true);
  });

  it('should expand and collapse a section with its header', async () => {
    const { fixture, triggers, panels } = await setup();

    triggers()[0].click();
    await fixture.whenStable();
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
    expect(panels()[0].hidden).toBe(false);

    triggers()[0].click();
    await fixture.whenStable();
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
    expect(panels()[0].hidden).toBe(true);
  });

  it('should close the other sections unless multi is set', async () => {
    const { fixture, triggers } = await setup();

    triggers()[0].click();
    await fixture.whenStable();
    triggers()[1].click();
    await fixture.whenStable();

    expect(triggers().map((t) => t.getAttribute('aria-expanded'))).toEqual([
      'false',
      'true',
      'false',
    ]);
  });

  it('should keep several sections open with multi', async () => {
    const { fixture, host, triggers } = await setup();
    host.multi.set(true);
    await fixture.whenStable();

    triggers()[0].click();
    triggers()[1].click();
    await fixture.whenStable();

    expect(triggers().map((t) => t.getAttribute('aria-expanded'))).toEqual([
      'true',
      'true',
      'false',
    ]);
  });

  it('should support two-way binding of expanded', async () => {
    const { fixture, host, triggers } = await setup();

    triggers()[0].click();
    await fixture.whenStable();
    expect(host.first()).toBe(true);

    host.first.set(false);
    await fixture.whenStable();
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should not open disabled sections', async () => {
    const { fixture, triggers } = await setup();

    expect(triggers()[2].disabled).toBe(true);
    triggers()[2].click();
    await fixture.whenStable();

    expect(triggers()[2].getAttribute('aria-expanded')).toBe('false');
  });

  it('should wire the header, panel and heading semantics', async () => {
    const { fixture, root, triggers, panels } = await setup();
    triggers()[0].click();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-controls')).toBe(panels()[0].id);
    expect(panels()[0].getAttribute('aria-labelledby')).toBe(triggers()[0].id);
    expect(panels()[0].getAttribute('role')).toBe('region');
    const levels = Array.from(root.querySelectorAll('[role="heading"]')).map(
      (h) => h.getAttribute('aria-level'),
    );
    expect(levels).toEqual(['3', '2', '3']);
  });

  it('should keep the chevron disc out of the accessible name', async () => {
    const { triggers } = await setup();

    const wrap = triggers()[0].querySelector('.chevron-wrap');
    expect(wrap?.getAttribute('aria-hidden')).toBe('true');
    expect(wrap?.querySelector('svg.chevron')).not.toBeNull();
    expect(triggers()[0].textContent?.trim()).toBe('Allergens');
  });

  it('should have no accessibility violations', async () => {
    const { fixture, triggers } = await setup();
    triggers()[0].click();
    await fixture.whenStable();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
