import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcDivider } from './divider';

const meta: Meta<LcDivider> = {
  title: 'Primitives/Divider',
  component: LcDivider,
  decorators: [moduleMetadata({ imports: [LcDivider] })],
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
  args: { orientation: 'horizontal', decorative: false },
};
export default meta;

type Story = StoryObj<LcDivider>;

export const Horizontal: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:20rem">Starters<lc-divider [orientation]="orientation" [decorative]="decorative" />Mains</div>`,
  }),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    props: args,
    template: `<div style="display:flex;align-items:center;height:2rem">Menu<lc-divider [orientation]="orientation" [decorative]="decorative" />Wine list</div>`,
  }),
};
