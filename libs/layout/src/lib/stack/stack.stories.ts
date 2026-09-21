import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcStack } from './stack';

const box = `style="padding:0.75rem 1rem;background:var(--lc-color-action-subtle);border-radius:var(--lc-radius-md)"`;

const meta: Meta<LcStack> = {
  title: 'Layout/Stack',
  component: LcStack,
  decorators: [moduleMetadata({ imports: [LcStack] })],
  argTypes: {
    direction: { control: 'inline-radio', options: ['column', 'row'] },
    gap: {
      control: 'select',
      options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around'],
    },
    wrap: { control: 'boolean' },
  },
  args: {
    direction: 'column',
    gap: '4',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <lc-stack [direction]="direction" [gap]="gap" [align]="align" [justify]="justify" [wrap]="wrap">
        <div ${box}>One</div><div ${box}>Two</div><div ${box}>Three</div>
      </lc-stack>`,
  }),
};
export default meta;

type Story = StoryObj<LcStack>;

export const Column: Story = {};
export const Row: Story = { args: { direction: 'row', gap: '3' } };
export const SpaceBetween: Story = {
  args: { direction: 'row', justify: 'between', align: 'center' },
};
