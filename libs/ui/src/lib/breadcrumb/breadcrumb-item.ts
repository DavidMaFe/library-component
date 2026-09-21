import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

/** One step of an `lc-breadcrumb`. Mark the last one as `current`. */
@Component({
  // Must be a list item to keep valid list semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[lc-breadcrumb-item]',
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (current()) {
      <span class="current" aria-current="page"
        ><ng-container *ngTemplateOutlet="content"
      /></span>
    } @else {
      <ng-container *ngTemplateOutlet="content" />
    }
  `,
  styleUrl: './breadcrumb-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcBreadcrumbItem {
  readonly current = input(false, { transform: booleanAttribute });
}
