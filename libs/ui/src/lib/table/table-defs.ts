import { Directive, inject, input, TemplateRef } from '@angular/core';
import { LcTableCellContext, LcTableHeaderContext } from './table.types';

/**
 * Replaces the content of a column's cells.
 *
 * ```html
 * <ng-template lcCell="price" let-row let-value="value">{{ value | currency }}</ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[lcCell]' })
export class LcCellDef {
  /** Key of the column this template renders. */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly key = input.required<string>({ alias: 'lcCell' });
  readonly template =
    inject<TemplateRef<LcTableCellContext<unknown>>>(TemplateRef);
}

/** Replaces the content of a column header (the sort button is kept). */
@Directive({ selector: 'ng-template[lcHeader]' })
export class LcHeaderDef {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly key = input.required<string>({ alias: 'lcHeader' });
  readonly template =
    inject<TemplateRef<LcTableHeaderContext<unknown>>>(TemplateRef);
}

/** Content shown when the table has no rows. */
@Directive({ selector: 'ng-template[lcEmpty]' })
export class LcEmptyDef {
  readonly template = inject(TemplateRef);
}
