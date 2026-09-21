import { ComponentType } from '@angular/cdk/overlay';
import {
  Dialog,
  DIALOG_DATA,
  DialogConfig,
  DialogRef,
} from '@angular/cdk/dialog';
import { inject, Injectable, TemplateRef } from '@angular/core';

/** Handle to an open dialog: close it, or wait for its result. */
export type LcDialogRef<Result = unknown, Component = unknown> = DialogRef<
  Result,
  Component
>;

/** Options for opening a dialog. Everything is optional. */
export type LcDialogConfig<
  Data = unknown,
  Result = unknown,
  Component = unknown,
> = Partial<DialogConfig<Data, LcDialogRef<Result, Component>>>;

/** Injection token to read the `data` passed to `LcDialog.open`. */
export const LC_DIALOG_DATA = DIALOG_DATA;

/**
 * Opens modal dialogs. Focus is trapped inside, `Escape` and backdrop clicks
 * close it, and focus returns to the element that opened it.
 *
 * ```ts
 * const ref = inject(LcDialog).open(ConfirmDialog, { data: { name: 'Pizza' } });
 * ref.closed.subscribe((confirmed) => ...);
 * ```
 *
 * Use `lc-dialog-panel` inside your dialog component for the standard layout.
 * Requires the overlay styles: `@use '@lc/ui/styles/overlay';`.
 */
@Injectable({ providedIn: 'root' })
export class LcDialog {
  readonly #dialog = inject(Dialog);

  open<Result = unknown, Data = unknown, Component = unknown>(
    content: ComponentType<Component> | TemplateRef<Component>,
    config: LcDialogConfig<Data, Result, Component> = {},
  ): LcDialogRef<Result, Component> {
    return this.#dialog.open<Result, Data, Component>(content, {
      role: 'dialog',
      ariaModal: true,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      closeOnNavigation: true,
      maxWidth: '90vw',
      ...config,
    });
  }

  /** Closes every open dialog. */
  closeAll(): void {
    this.#dialog.closeAll();
  }
}
