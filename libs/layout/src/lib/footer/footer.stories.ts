import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcFooter } from './footer';

const meta: Meta<LcFooter> = {
  title: 'Layout/Footer',
  component: LcFooter,
  decorators: [moduleMetadata({ imports: [LcFooter] })],
  parameters: { layout: 'fullscreen' },
  render: () => ({
    template: `
      <lc-footer>
        <p style="margin:0">Trattoria Rossi · Via Roma 1 · Open Tuesday to Sunday</p>
        <small lcFooterLegal>© 2026 Trattoria Rossi</small>
      </lc-footer>`,
  }),
};
export default meta;

type Story = StoryObj<LcFooter>;

export const Default: Story = {};
