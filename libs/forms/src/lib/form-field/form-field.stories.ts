import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcInput } from '../input/input';
import { LcFormField } from './form-field';

const meta: Meta<LcFormField> = {
  title: 'Forms/Form field',
  component: LcFormField,
  decorators: [
    moduleMetadata({ imports: [LcFormField, LcInput, ReactiveFormsModule] }),
  ],
  args: { label: 'Email', hint: 'We never share it' },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl('', [Validators.required, Validators.email]),
    },
    template: `
      <lc-form-field [label]="label" [hint]="hint" style="max-width:20rem">
        <input lc-input type="email" [formControl]="control" />
      </lc-form-field>`,
  }),
};
export default meta;

type Story = StoryObj<LcFormField>;

export const Default: Story = {};

/** Errors appear once the control is invalid and touched: click the field, then leave it. */
export const WithValidation: Story = {};

export const CustomMessages: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl('', Validators.required),
      messages: { required: 'Please tell us your email.' },
    },
    template: `
      <lc-form-field [label]="label" [errors]="messages" style="max-width:20rem">
        <input lc-input type="email" [formControl]="control" />
      </lc-form-field>`,
  }),
};
