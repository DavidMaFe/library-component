import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LC_DIALOG_DATA, LcDialogPanel, LcIconButton } from '@lc/ui';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';
import { GalleryPhoto } from './photo-gallery.types';

export interface GalleryLightboxData {
  readonly photos: readonly GalleryPhoto[];
  readonly index: number;
}

/** Dialog content that shows one photo at a time. Opened by `lc-photo-gallery`. */
@Component({
  selector: 'lc-gallery-lightbox',
  imports: [LcDialogPanel, LcIconButton],
  templateUrl: './gallery-lightbox.html',
  styleUrl: './gallery-lightbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.arrowLeft)': 'previous()',
    '(keydown.arrowRight)': 'next()',
  },
})
export class LcGalleryLightbox {
  protected readonly data = inject<GalleryLightboxData>(LC_DIALOG_DATA);
  protected readonly labels = inject(LC_RESTAURANT_LABELS);

  protected readonly index = signal(this.data.index);
  protected readonly photo = computed(() => this.data.photos[this.index()]);
  protected readonly total = this.data.photos.length;

  protected previous(): void {
    this.index.update((index) => (index - 1 + this.total) % this.total);
  }

  protected next(): void {
    this.index.update((index) => (index + 1) % this.total);
  }
}
