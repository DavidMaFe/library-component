import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcNavbar } from './navbar';

const meta: Meta<LcNavbar> = {
  title: 'Layout/Navbar',
  component: LcNavbar,
  decorators: [moduleMetadata({ imports: [LcNavbar] })],
  parameters: { layout: 'fullscreen' },
  args: { sticky: false },
  render: (args) => ({
    props: args,
    template: `
      <lc-navbar [sticky]="sticky" label="Main">
        <a lcNavbarBrand href="#" style="color:inherit;text-decoration:none">Trattoria</a>
        <a href="#menu">Menu</a>
        <a href="#book">Book a table</a>
        <a href="#about">About</a>
        <button lcNavbarActions type="button">Order</button>
      </lc-navbar>`,
  }),
};
export default meta;

type Story = StoryObj<LcNavbar>;

/** Resize below 768px: the links collapse behind the menu button. */
export const Default: Story = {};
