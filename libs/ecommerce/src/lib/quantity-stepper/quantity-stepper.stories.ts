import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcQuantityStepper } from './quantity-stepper';

interface StepperArgs {
  min: number;
  max: number | undefined;
  disabled: boolean;
  size: 'md' | 'lg';
}

// `component` is deliberately not set: Storybook would overwrite the signal inputs.
const meta: Meta<StepperArgs> = {
  title: 'Ecommerce/Quantity stepper',
  decorators: [moduleMetadata({ imports: [LcQuantityStepper] })],
  argTypes: { size: { control: 'inline-radio', options: ['md', 'lg'] } },
  args: { min: 1, max: 5, disabled: false, size: 'md' },
  render: (args) => ({
    props: { ...args, value: 2 },
    template: `<lc-quantity-stepper label="Quantity of Ceramic mug" [(value)]="value" [min]="min" [max]="max" [disabled]="disabled" [size]="size" />`,
  }),
};
export default meta;

type Story = StoryObj<StepperArgs>;

export const Default: Story = {};
export const NoLimit: Story = { args: { max: undefined } };
export const Disabled: Story = { args: { disabled: true } };
/** 48px, to sit next to a large call-to-action button. */
export const Large: Story = { args: { size: 'lg' } };
