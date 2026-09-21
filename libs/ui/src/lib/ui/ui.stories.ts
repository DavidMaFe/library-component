import type { Meta, StoryObj } from '@storybook/angular';
import { Ui } from './ui';

const meta: Meta<Ui> = {
  component: Ui,
  title: 'Ui',
};
export default meta;

type Story = StoryObj<Ui>;

export const Primary: Story = {
  args: {},
};
