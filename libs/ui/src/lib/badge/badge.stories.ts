import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcBadge } from './badge';

const meta: Meta<LcBadge> = {
  title: 'Primitives/Badge',
  component: LcBadge,
  decorators: [moduleMetadata({ imports: [LcBadge] })],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'neutral',
        'primary',
        'accent',
        'success',
        'warning',
        'danger',
        'info',
      ],
    },
    appearance: {
      control: 'inline-radio',
      options: ['subtle', 'solid', 'outline'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: { variant: 'neutral', appearance: 'subtle', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<lc-badge [variant]="variant" [appearance]="appearance" [size]="size">Vegan</lc-badge>`,
  }),
};
export default meta;

type Story = StoryObj<LcBadge>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success' } };

/** Offers and new items use the brand accent, not `danger`. */
export const Accent: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:0.5rem">
        <lc-badge variant="accent" appearance="solid">−20%</lc-badge>
        <lc-badge variant="accent">New</lc-badge>
        <lc-badge variant="accent" appearance="outline">Chef's pick</lc-badge>
      </div>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:0.75rem">
        @for (appearance of ['subtle', 'solid', 'outline']; track appearance) {
          <div style="display:flex;gap:0.5rem">
            @for (variant of ['neutral', 'primary', 'accent', 'success', 'warning', 'danger', 'info']; track variant) {
              <lc-badge [variant]="variant" [appearance]="appearance">{{ variant }}</lc-badge>
            }
          </div>
        }
      </div>`,
  }),
};
