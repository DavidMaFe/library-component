import { DialogRef } from '@angular/cdk/dialog';
import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Closes the dialog it is inside of when clicked. Its value is the result.
 *
 * ```html
 * <button lc-button [lcDialogClose]="true">Confirm</button>
 * ```
 */
@Directive({
  selector: '[lcDialogClose]',
  host: { '(click)': 'close()' },
})
export class LcDialogClose {
  /** Value the dialog closes with. */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly result = input<unknown>(undefined, { alias: 'lcDialogClose' });

  readonly #dialogRef = inject(DialogRef);

  constructor() {
    // Buttons default to `submit`, which would submit a surrounding form.
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (element.tagName === 'BUTTON' && !element.hasAttribute('type')) {
      element.setAttribute('type', 'button');
    }
  }

  protected close(): void {
    this.#dialogRef.close(this.result() === '' ? undefined : this.result());
  }
}
