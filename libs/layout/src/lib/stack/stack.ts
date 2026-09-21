import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { LcSpace } from '../shared/layout.types';

export type LcStackDirection = 'column' | 'row';
export type LcStackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type LcStackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

/**
 * One-dimensional layout: children in a row or column separated by a gap
 * from the spacing scale.
 *
 * ```html
 * <lc-stack direction="row" gap="3" align="center" justify="between">...</lc-stack>
 * ```
 *
 * Customize with `--lc-stack-gap` (overrides `gap`).
 */
@Component({
  selector: 'lc-stack',
  template: '<ng-content />',
  styleUrl: './stack.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-direction]': 'direction()',
    '[attr.data-gap]': 'gap()',
    '[attr.data-align]': 'align()',
    '[attr.data-justify]': 'justify()',
    '[attr.data-wrap]': 'wrap() || null',
  },
})
export class LcStack {
  readonly direction = input<LcStackDirection>('column');
  readonly gap = input<LcSpace>('4');
  readonly align = input<LcStackAlign>('stretch');
  readonly justify = input<LcStackJustify>('start');
  readonly wrap = input(false, { transform: booleanAttribute });
}
