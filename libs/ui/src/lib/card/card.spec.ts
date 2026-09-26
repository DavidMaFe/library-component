import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcCard, LcCardPadding, LcCardVariant } from './card';

@Component({
  imports: [LcCard],
  template: `
    <lc-card
      [variant]="variant()"
      [padding]="padding()"
      [interactive]="interactive()"
    >
      @if (withMedia()) {
        <img lcCardMedia src="dish.jpg" alt="Pasta" />
      }
      @if (withHeader()) {
        <h3 lcCardHeader>Pasta</h3>
      }
      Fresh tagliatelle
      @if (withFooter()) {
        <span lcCardFooter>12 €</span>
      }
    </lc-card>
  `,
})
class HostComponent {
  variant = signal<LcCardVariant>('outlined');
  padding = signal<LcCardPadding>('md');
  interactive = signal(false);
  withMedia = signal(true);
  withHeader = signal(true);
  withFooter = signal(true);
}

describe('LcCard', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const card = fixture.nativeElement.querySelector('lc-card') as HTMLElement;
    const slot = (name: string) =>
      card.querySelector(`.${name}`) as HTMLElement;
    return { fixture, host: fixture.componentInstance, card, slot };
  };

  it('should default to an outlined card with medium padding', async () => {
    const { card } = await setup();

    expect(card.getAttribute('data-variant')).toBe('outlined');
    expect(card.getAttribute('data-padding')).toBe('md');
  });

  it('should reflect variant and padding', async () => {
    const { fixture, host, card } = await setup();

    host.variant.set('elevated');
    host.padding.set('none');
    await fixture.whenStable();

    expect(card.getAttribute('data-variant')).toBe('elevated');
    expect(card.getAttribute('data-padding')).toBe('none');
  });

  it('should only mark the card as interactive when asked', async () => {
    const { fixture, host, card } = await setup();

    expect(card.hasAttribute('data-interactive')).toBe(false);

    host.interactive.set(true);
    await fixture.whenStable();

    expect(card.hasAttribute('data-interactive')).toBe(true);
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('tabindex')).toBeNull();
  });

  it('should project content into the matching slots', async () => {
    const { slot } = await setup();

    expect(slot('media').querySelector('img')).not.toBeNull();
    expect(slot('header').textContent).toContain('Pasta');
    expect(slot('body').textContent).toContain('Fresh tagliatelle');
    expect(slot('footer').textContent).toContain('12 €');
  });

  it('should leave unused slots empty so they can be hidden', async () => {
    const { fixture, host, slot } = await setup();

    host.withMedia.set(false);
    host.withHeader.set(false);
    host.withFooter.set(false);
    await fixture.whenStable();

    for (const name of ['media', 'header', 'footer']) {
      expect(slot(name).children).toHaveLength(0);
      expect(slot(name).textContent?.trim()).toBe('');
    }
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
