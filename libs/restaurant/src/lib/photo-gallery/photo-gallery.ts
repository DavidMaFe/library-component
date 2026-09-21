import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { LcGrid } from '@lc/layout';
import { LcDialog } from '@lc/ui';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';
import { LcGalleryLightbox } from './gallery-lightbox';
import { GalleryPhoto } from './photo-gallery.types';

/**
 * Grid of photos that open in a lightbox. The lightbox is a dialog: focus is
 * trapped, `Escape` closes it, and the arrow keys move between photos.
 *
 * ```html
 * <lc-photo-gallery [photos]="photos" />
 * ```
 *
 * Customize with `--lc-gallery-ratio` and `--lc-gallery-radius`.
 */
@Component({
  selector: 'lc-photo-gallery',
  imports: [LcGrid],
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcPhotoGallery {
  readonly photos = input.required<readonly GalleryPhoto[]>();
  readonly minItemWidth = input('12rem');

  protected readonly labels = inject(LC_RESTAURANT_LABELS);
  readonly #dialog = inject(LcDialog);

  protected open(index: number): void {
    this.#dialog.open(LcGalleryLightbox, {
      data: { photos: this.photos(), index },
      width: 'min(90vw, 56rem)',
    });
  }
}
