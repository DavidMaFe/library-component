import { DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { LcSize } from '../shared/ui.types';
import { uniqueId } from '../shared/unique-id';

/**
 * Standard dialog layout: a heading with a close button, scrollable content
 * and an actions area. It labels the dialog with its heading.
 *
 * ```html
 * <lc-dialog-panel heading="Delete dish?">
 *   This cannot be undone.
 *   <div lcDialogActions>
 *     <button lc-button variant="secondary" [lcDialogClose]="false">Cancel</button>
 *     <button lc-button variant="danger" [lcDialogClose]="true">Delete</button>
 *   </div>
 * </lc-dialog-panel>
 * ```
 *
 * Customize with `--lc-dialog-width`, `-bg`, `-radius`, `-shadow`, `-padding`
 * and `-max-height`.
 */
@Component({
  selector: 'lc-dialog-panel',
  templateUrl: './dialog-panel.html',
  styleUrl: './dialog-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class LcDialogPanel {
  readonly heading = input.required<string>();
  readonly size = input<LcSize>('md');
  /** Shows the close button in the header. Hidden anyway when the dialog was opened with `disableClose`. */
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closeLabel = input('Close');

  protected readonly headingId = uniqueId('lc-dialog-heading');
  protected readonly dialogRef = inject(DialogRef, { optional: true });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // The dialog role lives on the CDK container that wraps this panel.
    afterNextRender(() => {
      element
        .closest('[role="dialog"], [role="alertdialog"]')
        ?.setAttribute('aria-labelledby', this.headingId);
    });
  }

  protected get canDismiss(): boolean {
    return this.dismissible() && !this.dialogRef?.disableClose;
  }

  protected close(): void {
    this.dialogRef?.close();
  }
}
