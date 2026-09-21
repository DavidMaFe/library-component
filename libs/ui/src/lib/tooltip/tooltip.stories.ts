import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcButton } from '../button/button';
import { LcTooltip, LcTooltipPosition } from './tooltip';

interface TooltipArgs {
  text: string;
  position: LcTooltipPosition;
  showDelay: number;
}

// `component` is deliberately not set: Storybook would write these args onto
// the directive instance and overwrite its signal inputs.
const meta: Meta<TooltipArgs> = {
  title: 'Overlays/Tooltip',
  decorators: [moduleMetadata({ imports: [LcTooltip, LcButton] })],
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
    },
    showDelay: { control: 'number' },
  },
  args: {
    text: 'Delete this dish from the menu',
    position: 'top',
    showDelay: 300,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:4rem;display:flex;justify-content:center">
        <button lc-button variant="secondary" [lcTooltip]="text" [lcTooltipPosition]="position" [lcTooltipShowDelay]="showDelay">
          Hover or focus me
        </button>
      </div>`,
  }),
};
export default meta;

type Story = StoryObj<TooltipArgs>;

export const Top: Story = {};
export const Bottom: Story = { args: { position: 'bottom' } };
export const Left: Story = { args: { position: 'left' } };
export const Right: Story = { args: { position: 'right' } };
