import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcSpinner } from './spinner';

const meta: Meta<LcSpinner> = {
  title: 'Primitives/Spinner',
  component: LcSpinner,
  decorators: [moduleMetadata({ imports: [LcSpinner] })],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { size: 'md', label: 'Loading', decorative: false },
};
export default meta;

type Story = StoryObj<LcSpinner>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

export const CustomColor: Story = {
  render: (args) => ({
    props: args,
    template: `<lc-spinner [size]="size" style="--lc-spinner-color:#b45309;--lc-spinner-thickness:4" />`,
  }),
};
