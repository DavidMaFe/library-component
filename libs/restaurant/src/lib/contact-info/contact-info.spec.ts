import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { ContactDetails, telHref } from './contact-info.types';
import { LcContactInfo } from './contact-info';

@Component({
  imports: [LcContactInfo],
  template: `<lc-contact-info [contact]="contact()" />`,
})
class HostComponent {
  contact = signal<ContactDetails>({
    name: 'Trattoria Rossi',
    address: {
      street: 'Via Roma 1',
      postalCode: '00100',
      city: 'Roma',
      country: 'Italia',
    },
    phone: '+39 06 1234 5678',
    email: 'ciao@rossi.example',
    website: 'https://rossi.example/',
    mapUrl: 'https://maps.example/rossi',
    social: [
      { network: 'Instagram', url: 'https://instagram.example/rossi' },
      { network: 'Facebook', url: 'https://facebook.example/rossi' },
    ],
  });
}

describe('telHref', () => {
  it('should keep digits and the plus sign', () => {
    expect(telHref('+39 (06) 1234-5678')).toBe('tel:+390612345678');
  });
});

describe('LcContactInfo', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      link: (text: string) =>
        Array.from(root.querySelectorAll<HTMLAnchorElement>('a')).find((a) =>
          a.textContent?.includes(text),
        ),
    };
  };

  it('should use a semantic address element', async () => {
    const { root } = await setup();

    expect(root.querySelector('address')).not.toBeNull();
    expect(root.querySelector('.name')?.textContent).toBe('Trattoria Rossi');
  });

  it('should render the full postal address', async () => {
    const { root } = await setup();

    const text = root
      .querySelector('address')
      ?.textContent?.replace(/\s+/g, ' ');
    expect(text).toContain('Via Roma 1 00100 Roma Italia');
  });

  it('should link the phone and email with tel and mailto', async () => {
    const { link } = await setup();

    expect(link('+39 06')?.getAttribute('href')).toBe('tel:+390612345678');
    expect(link('ciao@rossi.example')?.getAttribute('href')).toBe(
      'mailto:ciao@rossi.example',
    );
  });

  it('should show the website without protocol or trailing slash', async () => {
    const { root } = await setup();

    const website = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a'),
    ).find((a) => a.getAttribute('href') === 'https://rossi.example/');
    expect(website?.textContent?.trim()).toMatch(/^rossi\.example\b/);
  });

  it('should open external links in a new tab with noopener and warn screen readers', async () => {
    const { root } = await setup();

    const external = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
    );
    expect(external).toHaveLength(4);
    for (const anchor of external) {
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      expect(anchor.textContent).toContain('(opens in a new tab)');
    }
  });

  it('should list the social networks in a labelled list', async () => {
    const { root } = await setup();

    const list = root.querySelector('.social') as HTMLElement;
    expect(list.getAttribute('aria-label')).toBe('Social media');
    expect(
      Array.from(list.querySelectorAll('li')).map((li) =>
        li.textContent?.replace(/\s*\(opens in a new tab\)\s*/, '').trim(),
      ),
    ).toEqual(['Instagram', 'Facebook']);
  });

  it('should leave out what is missing', async () => {
    const { fixture, host, root } = await setup();

    host.contact.set({ email: 'a@b.example' });
    await fixture.whenStable();

    expect(root.querySelector('.name')).toBeNull();
    expect(root.querySelectorAll('.item')).toHaveLength(1);
    expect(root.querySelector('.social')).toBeNull();
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
