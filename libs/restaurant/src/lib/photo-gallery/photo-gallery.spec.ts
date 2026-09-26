import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcDialog } from '@lc/ui';
import { provideLcRestaurantLabels } from '../labels/restaurant-labels';
import { LcPhotoGallery } from './photo-gallery';
import { GalleryPhoto } from './photo-gallery.types';

const photos: GalleryPhoto[] = [
  { src: 'a.jpg', alt: 'Dining room', caption: 'Our dining room' },
  { src: 'b.jpg', alt: 'Wood oven' },
  { src: 'c.jpg', alt: 'Terrace' },
];

@Component({
  imports: [LcPhotoGallery],
  template: `<lc-photo-gallery [photos]="photos()" />`,
})
class HostComponent {
  photos = signal<GalleryPhoto[]>(photos);
}

const settle = async () => {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
};

const query = <T extends Element>(selector: string) =>
  document.querySelector(selector) as T | null;
const press = (key: string, target: Element = document.body) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
    }),
  );

describe('LcPhotoGallery', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      thumbs: () =>
        Array.from(root.querySelectorAll<HTMLButtonElement>('.thumb')),
    };
  };

  afterEach(() => {
    TestBed.inject(LcDialog).closeAll();
    document.body.innerHTML = '';
  });

  describe('thumbnails', () => {
    it('should render one button per photo with a descriptive name', async () => {
      const { thumbs } = await setup();

      expect(thumbs().map((thumb) => thumb.getAttribute('aria-label'))).toEqual(
        [
          'Open photo 1 of 3: Dining room',
          'Open photo 2 of 3: Wood oven',
          'Open photo 3 of 3: Terrace',
        ],
      );
    });

    it('should not repeat the description on the image itself', async () => {
      const { thumbs } = await setup();

      expect(thumbs()[0].querySelector('img')?.getAttribute('alt')).toBe('');
      expect(thumbs()[0].querySelector('img')?.getAttribute('loading')).toBe(
        'lazy',
      );
    });

    it('should use translated labels', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideLcRestaurantLabels({
            galleryOpen: (n, total, alt) =>
              `Abrir foto ${n} de ${total}: ${alt}`,
          }),
        ],
      });
      const { thumbs } = await setup();

      expect(thumbs()[1].getAttribute('aria-label')).toBe(
        'Abrir foto 2 de 3: Wood oven',
      );
    });
  });

  describe('lightbox', () => {
    it('should open the clicked photo in a dialog', async () => {
      const { thumbs } = await setup();

      thumbs()[1].click();
      await settle();

      expect(query('[role="dialog"]')).not.toBeNull();
      expect(query('lc-gallery-lightbox img')?.getAttribute('alt')).toBe(
        'Wood oven',
      );
      expect(query('lc-gallery-lightbox img')?.getAttribute('src')).toBe(
        'b.jpg',
      );
      expect(query('lc-dialog-panel h2')?.textContent).toContain(
        'Photo 2 of 3',
      );
    });

    it('should always show the viewer on a dark surface', async () => {
      const { thumbs } = await setup();

      thumbs()[0].click();
      await settle();

      expect(query('lc-dialog-panel')?.getAttribute('data-lc-theme')).toBe(
        'dark',
      );
    });

    it('should show the caption when there is one', async () => {
      const { thumbs } = await setup();

      thumbs()[0].click();
      await settle();
      expect(query('lc-gallery-lightbox figcaption')?.textContent).toContain(
        'Our dining room',
      );

      TestBed.inject(LcDialog).closeAll();
      await settle();
      thumbs()[1].click();
      await settle();
      expect(query('lc-gallery-lightbox figcaption')).toBeNull();
    });

    it('should move between photos with the buttons, wrapping around', async () => {
      const { thumbs } = await setup();
      thumbs()[2].click();
      await settle();
      const next = query<HTMLButtonElement>('button[aria-label="Next photo"]');
      const previous = query<HTMLButtonElement>(
        'button[aria-label="Previous photo"]',
      );

      next?.click();
      await settle();
      expect(query('lc-gallery-lightbox img')?.getAttribute('alt')).toBe(
        'Dining room',
      );

      previous?.click();
      await settle();
      expect(query('lc-gallery-lightbox img')?.getAttribute('alt')).toBe(
        'Terrace',
      );
    });

    it('should move between photos with the arrow keys', async () => {
      const { thumbs } = await setup();
      thumbs()[0].click();
      await settle();
      const image = query('lc-gallery-lightbox img') as Element;

      press('ArrowRight', image);
      await settle();
      expect(query('lc-gallery-lightbox img')?.getAttribute('alt')).toBe(
        'Wood oven',
      );

      press('ArrowLeft', image);
      await settle();
      expect(query('lc-gallery-lightbox img')?.getAttribute('alt')).toBe(
        'Dining room',
      );
    });

    it('should update the counter as photos change', async () => {
      const { thumbs } = await setup();
      thumbs()[0].click();
      await settle();

      query<HTMLButtonElement>('button[aria-label="Next photo"]')?.click();
      await settle();

      expect(query('lc-dialog-panel h2')?.textContent).toContain(
        'Photo 2 of 3',
      );
    });

    it('should close with Escape and return focus to the thumbnail', async () => {
      const { thumbs } = await setup();
      thumbs()[1].focus();
      thumbs()[1].click();
      await settle();

      document.body.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true,
        }),
      );
      await settle();

      expect(query('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(thumbs()[1]);
    });

    it('should close with the close button', async () => {
      const { thumbs } = await setup();
      thumbs()[0].click();
      await settle();

      query<HTMLButtonElement>('lc-dialog-panel .close')?.click();
      await settle();

      expect(query('[role="dialog"]')).toBeNull();
    });

    it('should hide navigation for a single photo', async () => {
      const { host, fixture, thumbs } = await setup();
      host.photos.set([photos[0]]);
      await fixture.whenStable();

      thumbs()[0].click();
      await settle();

      expect(query('button[aria-label="Next photo"]')).toBeNull();
    });

    it('should have no accessibility violations with the lightbox open', async () => {
      const { thumbs } = await setup();
      thumbs()[0].click();
      await settle();

      expect(
        await axe(document.body, { rules: { region: { enabled: false } } }),
      ).toHaveNoViolations();
    });
  });

  it('should have no accessibility violations', async () => {
    const { fixture } = await setup();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
