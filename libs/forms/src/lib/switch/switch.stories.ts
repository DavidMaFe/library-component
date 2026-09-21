import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcSwitch } from './switch';

const meta: Meta<LcSwitch> = {
  title: 'Forms/Switch',
  component: LcSwitch,
  decorators: [moduleMetadata({ imports: [LcSwitch, ReactiveFormsModule] })],
  args: { disabled: false },
  render: (args) => ({
    props: { ...args, control: new FormControl(true) },
    template: `<lc-switch [formControl]="control" [disabled]="disabled">Home delivery</lc-switch>`,
  }),
};
export default meta;

type Story = StoryObj<LcSwitch>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
