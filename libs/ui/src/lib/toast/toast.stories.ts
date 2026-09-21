import { Component, inject } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcButton } from '../button/button';
import { LcToast } from './toast';

@Component({
  selector: 'lc-toast-demo',
  imports: [LcButton],
  template: `
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button
        lc-button
        variant="secondary"
        (click)="toast.info('Menu updated')"
      >
        Info
      </button>
      <button
        lc-button
        variant="secondary"
        (click)="toast.success('Order placed', { title: 'Thank you' })"
      >
        Success
      </button>
      <button
        lc-button
        variant="secondary"
        (click)="toast.warning('Only 2 portions left')"
      >
        Warning
      </button>
      <button
        lc-button
        variant="secondary"
        (click)="toast.danger('Payment failed')"
      >
        Danger
      </button>
      <button lc-button (click)="withAction()">With action</button>
      <button lc-button variant="ghost" (click)="toast.dismissAll()">
        Dismiss all
      </button>
    </div>
  `,
})
class ToastDemo {
  protected readonly toast = inject(LcToast);

  protected withAction(): void {
    this.toast.show({
      message: 'Dish removed',
      action: {
        label: 'Undo',
        handler: () => this.toast.success('Dish restored'),
      },
    });
  }
}

const meta: Meta<ToastDemo> = {
  title: 'Overlays/Toast',
  component: ToastDemo,
  decorators: [moduleMetadata({ imports: [ToastDemo] })],
};
export default meta;

type Story = StoryObj<ToastDemo>;

/** Toasts pause while hovered or focused, and stack up to a configurable maximum. */
export const Playground: Story = {};
