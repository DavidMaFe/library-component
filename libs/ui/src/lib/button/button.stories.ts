import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcButton } from './button';

const meta: Meta<LcButton> = {
  title: 'Primitives/Button',
  component: LcButton,
  decorators: [moduleMetadata({ imports: [LcButton] })],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
  },
  render: (args) => ({
    props: args,
    template: `<button lc-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" [block]="block">Book a table</button>`,
  }),
};
export default meta;

type Story = StoryObj<LcButton>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Block: Story = { args: { block: true } };

export const AsLink: Story = {
  render: (args) => ({
    props: args,
    template: `<a lc-button [variant]="variant" [size]="size" href="#menu">See the menu</a>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:1rem;align-items:center">
        <button lc-button size="sm">Small</button>
        <button lc-button size="md">Medium</button>
        <button lc-button size="lg">Large</button>
      </div>`,
  }),
};

/** Every visual property can be tuned with `--lc-button-*` custom properties. */
export const CustomProperties: Story = {
  render: () => ({
    template: `
      <button
        lc-button
        style="--lc-button-bg:#b45309;--lc-button-bg-hover:#92400e;--lc-button-radius:9999px;--lc-button-padding-x:2rem"
      >
        Custom brand
      </button>`,
  }),
};
