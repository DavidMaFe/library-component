import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcIconButton } from './icon-button';

const cart = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>`;

const meta: Meta<LcIconButton> = {
  title: 'Primitives/Icon button',
  component: LcIconButton,
  decorators: [moduleMetadata({ imports: [LcIconButton] })],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    shape: { control: 'inline-radio', options: ['square', 'round'] },
  },
  args: {
    label: 'Add to cart',
    variant: 'secondary',
    size: 'md',
    shape: 'square',
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `<button lc-icon-button [label]="label" [variant]="variant" [size]="size" [shape]="shape" [disabled]="disabled" [loading]="loading">${cart}</button>`,
  }),
};
export default meta;

type Story = StoryObj<LcIconButton>;

export const Default: Story = {};
export const Round: Story = { args: { shape: 'round', variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
