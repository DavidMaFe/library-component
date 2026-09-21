import { CdkAccordionItem } from '@angular/cdk/accordion';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { uniqueId } from '../shared/unique-id';

/**
 * A section of an `lc-accordion`. Use `[(expanded)]` to control it.
 * The header is a button, so it works with `Tab`, `Enter` and `Space`.
 */
@Component({
  selector: 'lc-accordion-item',
  templateUrl: './accordion-item.html',
  styleUrl: './accordion-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkAccordionItem,
      inputs: ['expanded', 'disabled'],
      outputs: ['expandedChange'],
    },
  ],
  host: {
    '[attr.data-expanded]': 'item.expanded || null',
  },
})
export class LcAccordionItem {
  readonly heading = input.required<string>();
  /** Level of the heading in the page outline (1-6). */
  readonly headingLevel = input(3, { transform: numberAttribute });

  protected readonly item = inject(CdkAccordionItem, { self: true });
  protected readonly triggerId = uniqueId('lc-accordion-trigger');
  protected readonly panelId = uniqueId('lc-accordion-panel');
}
