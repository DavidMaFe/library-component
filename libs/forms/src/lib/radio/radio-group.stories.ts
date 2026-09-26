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

/** Tiles for sizes, time slots or shipping methods; sold-out options are struck through. */
export const Chips: Story = {
  render: () => ({
    props: { size: new FormControl('m'), time: new FormControl('14:00') },
    template: `
      <div style="display:grid;gap:1.25rem">
        <lc-form-field label="Size">
          <lc-radio-group [formControl]="size" appearance="chip">
            <lc-radio value="xs">XS</lc-radio>
            <lc-radio value="s">S</lc-radio>
            <lc-radio value="m">M</lc-radio>
            <lc-radio value="l">L</lc-radio>
            <lc-radio value="xl" disabled>XL</lc-radio>
          </lc-radio-group>
        </lc-form-field>
        <lc-form-field label="Time">
          <lc-radio-group [formControl]="time" appearance="chip">
            <lc-radio value="13:30">13:30</lc-radio>
            <lc-radio value="14:00">14:00</lc-radio>
            <lc-radio value="14:30">14:30</lc-radio>
            <lc-radio value="15:00" disabled>15:00</lc-radio>
          </lc-radio-group>
        </lc-form-field>
      </div>`,
  }),
};
