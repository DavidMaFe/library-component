import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';
import { ContactDetails, telHref } from './contact-info.types';

/**
 * Address, phone, email, website and social links, marked up as a semantic
 * `<address>` with real `tel:` and `mailto:` links.
 *
 * ```html
 * <lc-contact-info [contact]="contact" />
 * ```
 *
 * Customize with `--lc-contact-gap` and `--lc-contact-link-color`.
 */
@Component({
  selector: 'lc-contact-info',
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcContactInfo {
  readonly contact = input.required<ContactDetails>();

  protected readonly labels = inject(LC_RESTAURANT_LABELS);
  protected readonly tel = telHref;

  /** The website without protocol and trailing slash, for display. */
  protected displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}
