import { CdkAccordion } from '@angular/cdk/accordion';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Group of expandable sections. Only one is open at a time unless `multi`
 * is set.
 *
 * ```html
 * <lc-accordion multi>
 *   <lc-accordion-item heading="Allergens">...</lc-accordion-item>
 *   <lc-accordion-item heading="Opening hours" expanded>...</lc-accordion-item>
 * </lc-accordion>
 * ```
 *
 * Customize with `--lc-accordion-border-color` and `--lc-accordion-radius`.
 */
@Component({
  selector: 'lc-accordion',
  template: '<ng-content />',
  styleUrl: './accordion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: CdkAccordion, inputs: ['multi'] }],
})
export class LcAccordion {}
