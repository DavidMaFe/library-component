import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcButton } from '../button/button';
import { LcMenu } from './menu';
import { LcMenuDivider } from './menu-divider';
import { LcMenuItem } from './menu-item';
import { LcMenuTrigger } from './menu-trigger';

const meta: Meta<LcMenu> = {
  title: 'Overlays/Menu',
  component: LcMenu,
  decorators: [
    moduleMetadata({
      imports: [LcMenu, LcMenuItem, LcMenuDivider, LcMenuTrigger, LcButton],
    }),
  ],
};
export default meta;

type Story = StoryObj<LcMenu>;

/** Arrow keys move between items, `Escape` closes and returns focus to the button. */
export const Default: Story = {
  render: () => ({
    template: `
      <button lc-button variant="secondary" [lcMenuTriggerFor]="menu">Options</button>
      <ng-template #menu>
        <lc-menu aria-label="Dish options">
          <button lc-menu-item>Edit</button>
          <button lc-menu-item>Duplicate</button>
          <lc-menu-divider />
          <button lc-menu-item variant="danger">Delete</button>
          <button lc-menu-item disabled>Archive (soon)</button>
        </lc-menu>
      </ng-template>`,
  }),
};

export const WithSubmenu: Story = {
  render: () => ({
    template: `
      <button lc-button [lcMenuTriggerFor]="menu">Categories</button>
      <ng-template #menu>
        <lc-menu aria-label="Categories">
          <button lc-menu-item>Starters</button>
          <button lc-menu-item [lcMenuTriggerFor]="mains">Mains ›</button>
          <button lc-menu-item>Desserts</button>
        </lc-menu>
      </ng-template>
      <ng-template #mains>
        <lc-menu aria-label="Mains">
          <button lc-menu-item>Pasta</button>
          <button lc-menu-item>Pizza</button>
        </lc-menu>
      </ng-template>`,
  }),
};
