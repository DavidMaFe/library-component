import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcBadge } from '../badge/badge';
import { LcButton } from '../button/button';
import { LcCard } from './card';

const image =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='400' height='200' fill='%23f59e0b'/></svg>";

const meta: Meta<LcCard> = {
  title: 'Primitives/Card',
  component: LcCard,
  decorators: [moduleMetadata({ imports: [LcCard, LcButton, LcBadge] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'elevated'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: { variant: 'outlined', padding: 'md' },
  render: (args) => ({
    props: { ...args, image },
    template: `
      <lc-card [variant]="variant" [padding]="padding" style="max-width:20rem">
        <img lcCardMedia [src]="image" alt="" />
        <h3 lcCardHeader style="margin:0">Tagliatelle al ragù</h3>
        <p style="margin:0 0 0.75rem">Fresh pasta, slow-cooked beef ragù and parmesan.</p>
        <lc-badge variant="success">Vegetarian option</lc-badge>
        <div lcCardFooter style="display:flex;justify-content:space-between;align-items:center">
          <strong>12,50 €</strong>
          <button lc-button size="sm">Add</button>
        </div>
      </lc-card>`,
  }),
};
export default meta;

type Story = StoryObj<LcCard>;

export const Outlined: Story = {};
export const Elevated: Story = { args: { variant: 'elevated' } };

export const ContentOnly: Story = {
  render: (args) => ({
    props: args,
    template: `<lc-card [variant]="variant" [padding]="padding" style="max-width:20rem">Only the default slot is used.</lc-card>`,
  }),
};
