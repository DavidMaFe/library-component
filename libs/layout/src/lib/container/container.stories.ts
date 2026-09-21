import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcContainer } from './container';

const meta: Meta<LcContainer> = {
  title: 'Layout/Container',
  component: LcContainer,
  decorators: [moduleMetadata({ imports: [LcContainer] })],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
  args: { size: 'lg' },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: args,
    template: `
      <lc-container [size]="size" style="background:var(--lc-color-action-subtle)">
        <p style="margin:0;padding:2rem 0">Centered content with a maximum width and responsive gutters.</p>
      </lc-container>`,
  }),
};
export default meta;

type Story = StoryObj<LcContainer>;

export const Large: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Full: Story = { args: { size: 'full' } };
