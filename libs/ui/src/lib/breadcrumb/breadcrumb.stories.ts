import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcBreadcrumb } from './breadcrumb';
import { LcBreadcrumbItem } from './breadcrumb-item';

const meta: Meta<LcBreadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: LcBreadcrumb,
  decorators: [moduleMetadata({ imports: [LcBreadcrumb, LcBreadcrumbItem] })],
  render: () => ({
    template: `
      <lc-breadcrumb>
        <li lc-breadcrumb-item><a href="#home">Home</a></li>
        <li lc-breadcrumb-item><a href="#menu">Menu</a></li>
        <li lc-breadcrumb-item><a href="#pasta">Pasta</a></li>
        <li lc-breadcrumb-item current>Tagliatelle al ragù</li>
      </lc-breadcrumb>`,
  }),
};
export default meta;

type Story = StoryObj<LcBreadcrumb>;

export const Default: Story = {};
