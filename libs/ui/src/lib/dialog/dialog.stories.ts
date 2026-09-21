import { Component, inject } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcButton } from '../button/button';
import { LC_DIALOG_DATA, LcDialog } from './dialog';
import { LcDialogClose } from './dialog-close';
import { LcDialogPanel } from './dialog-panel';

@Component({
  imports: [LcDialogPanel, LcDialogClose, LcButton],
  template: `
    <lc-dialog-panel heading="Delete dish?" [size]="data.size">
      Remove <strong>{{ data.name }}</strong> from the menu? This cannot be
      undone.
      <div lcDialogActions>
        <button lc-button variant="secondary" [lcDialogClose]="false">
          Cancel
        </button>
        <button lc-button variant="danger" [lcDialogClose]="true">
          Delete
        </button>
      </div>
    </lc-dialog-panel>
  `,
})
class ConfirmDialog {
  protected readonly data = inject<{ name: string; size: 'sm' | 'md' | 'lg' }>(
    LC_DIALOG_DATA,
  );
}

@Component({
  selector: 'lc-dialog-demo',
  imports: [LcButton],
  template: `
    <button lc-button (click)="open()">Delete dish</button>
    <p>Last result: {{ result ?? 'none' }}</p>
  `,
})
class DialogDemo {
  private readonly dialog = inject(LcDialog);
  result: boolean | undefined;

  size: 'sm' | 'md' | 'lg' = 'md';
  disableClose = false;

  open(): void {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: { name: 'Tagliatelle al ragù', size: this.size },
      disableClose: this.disableClose,
    });
    ref.closed.subscribe((result) => (this.result = result));
  }
}

const meta: Meta<DialogDemo> = {
  title: 'Overlays/Dialog',
  component: DialogDemo,
  decorators: [moduleMetadata({ imports: [DialogDemo] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disableClose: { control: 'boolean' },
  },
  args: { size: 'md', disableClose: false },
};
export default meta;

type Story = StoryObj<DialogDemo>;

/** Focus is trapped inside, `Escape` and backdrop clicks close it, and focus returns to the button. */
export const Confirm: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const NotDismissible: Story = { args: { disableClose: true } };
