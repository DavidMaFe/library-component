import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcCheckbox } from './checkbox';

const meta: Meta<LcCheckbox> = {
  title: 'Forms/Checkbox',
  component: LcCheckbox,
  decorators: [moduleMetadata({ imports: [LcCheckbox, ReactiveFormsModule] })],
  args: { disabled: false, indeterminate: false },
  render: (args) => ({
    props: { ...args, control: new FormControl(false) },
    template: `<lc-checkbox [formControl]="control" [disabled]="disabled" [indeterminate]="indeterminate">Subscribe to the newsletter</lc-checkbox>`,
  }),
};
export default meta;

type Story = StoryObj<LcCheckbox>;

export const Default: Story = {};
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Disabled: Story = { args: { disabled: true } };
