import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcFormField } from '../form-field/form-field';
import { LcRadio } from './radio';
import { LcRadioGroup } from './radio-group';

const meta: Meta<LcRadioGroup> = {
  title: 'Forms/Radio group',
  component: LcRadioGroup,
  decorators: [
    moduleMetadata({
      imports: [LcRadioGroup, LcRadio, LcFormField, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
  },
  args: { orientation: 'vertical', disabled: false },
  render: (args) => ({
    props: { ...args, control: new FormControl('m') },
    template: `
      <lc-form-field label="Pizza size">
        <lc-radio-group [formControl]="control" [orientation]="orientation" [disabled]="disabled">
          <lc-radio value="s">Small</lc-radio>
          <lc-radio value="m">Medium</lc-radio>
          <lc-radio value="l">Large</lc-radio>
          <lc-radio value="xl" disabled>Family (sold out)</lc-radio>
        </lc-radio-group>
      </lc-form-field>`,
  }),
};
export default meta;

type Story = StoryObj<LcRadioGroup>;

export const Vertical: Story = {};
export const Horizontal: Story = { args: { orientation: 'horizontal' } };
export const Disabled: Story = { args: { disabled: true } };
