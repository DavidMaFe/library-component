import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcGrid } from './grid';

const cards = Array.from(
  { length: 6 },
  (_, i) =>
    `<div style="padding:2rem;background:var(--lc-color-action-subtle);border-radius:var(--lc-radius-md)">Card ${i + 1}</div>`,
).join('');

const meta: Meta<LcGrid> = {
  title: 'Layout/Grid',
  component: LcGrid,
  decorators: [moduleMetadata({ imports: [LcGrid] })],
  argTypes: {
    gap: {
      control: 'select',
      options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'],
    },
    columns: { control: 'number' },
  },
  args: { gap: '4', minItemWidth: '12rem' },
  render: (args) => ({
    props: args,
    template: `<lc-grid [columns]="columns" [minItemWidth]="minItemWidth" [gap]="gap">${cards}</lc-grid>`,
  }),
};
export default meta;

type Story = StoryObj<LcGrid>;

/** Resize the window: columns fit automatically. */
export const AutoFit: Story = {};
export const ThreeColumns: Story = { args: { columns: 3 } };
