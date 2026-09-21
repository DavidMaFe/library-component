import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LcCardVariant = 'outlined' | 'elevated';
export type LcCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Surface that groups related content. Content slots:
 *
 * - `[lcCardMedia]`: full-bleed media on top (images, videos)
 * - `[lcCardHeader]`, default content, `[lcCardFooter]`
 *
 * ```html
 * <lc-card variant="elevated">
 *   <img lcCardMedia src="dish.jpg" alt="Pasta" />
 *   <h3 lcCardHeader>Pasta</h3>
 *   Fresh tagliatelle
 *   <button lcCardFooter lc-button>Order</button>
 * </lc-card>
 * ```
 *
 * Customize with `--lc-card-bg`, `-border-color`, `-radius`, `-shadow`,
 * `-padding` and `-gap`.
 */
@Component({
  selector: 'lc-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-padding]': 'padding()',
  },
})
export class LcCard {
  readonly variant = input<LcCardVariant>('outlined');
  readonly padding = input<LcCardPadding>('md');
}
