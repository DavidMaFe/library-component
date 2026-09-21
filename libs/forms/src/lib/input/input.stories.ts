import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcInput } from './input';

const meta: Meta<LcInput> = {
  title: 'Forms/Input',
  component: LcInput,
  decorators: [moduleMetadata({ imports: [LcInput] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
  },
  args: { size: 'md', invalid: false },
  render: (args) => ({
    props: args,
    template: `<input lc-input [size]="size" [invalid]="invalid" aria-label="Name" placeholder="Your name" />`,
  }),
};
export default meta;

type Story = StoryObj<LcInput>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `<input lc-input [size]="size" aria-label="Name" value="Read only value" disabled />`,
  }),
};

export const Textarea: Story = {
  render: (args) => ({
    props: args,
    template: `<textarea lc-input [size]="size" [invalid]="invalid" aria-label="Notes" placeholder="Allergies, requests..."></textarea>`,
  }),
};

export const Select: Story = {
  render: (args) => ({
    props: args,
    template: `
      <select lc-input [size]="size" [invalid]="invalid" aria-label="Course">
        <option>Starter</option>
        <option>Main</option>
        <option>Dessert</option>
      </select>`,
  }),
};

/** Every visual property can be tuned with `--lc-input-*` custom properties. */
export const CustomProperties: Story = {
  render: () => ({
    template: `<input lc-input aria-label="Name" placeholder="Rounded" style="--lc-input-radius:9999px;--lc-input-padding-x:1.25rem" />`,
  }),
};
