import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sampleSections } from '../testing/sample-data';
import { LcMenuBoard } from './menu-board';

interface MenuBoardArgs {
  filterable: boolean;
  showSectionNav: boolean;
}

// `component` is deliberately not set (see the tooltip story).
const meta: Meta<MenuBoardArgs> = {
  title: 'Restaurant/Menu board',
  decorators: [moduleMetadata({ imports: [LcMenuBoard] })],
  parameters: { layout: 'padded' },
  args: { filterable: true, showSectionNav: true },
  render: (args) => ({
    props: { ...args, sections: sampleSections },
    template: `<lc-menu-board [sections]="sections" [filterable]="filterable" [showSectionNav]="showSectionNav" />`,
  }),
};
export default meta;

type Story = StoryObj<MenuBoardArgs>;

/** Filter buttons are built from the dietary tags present in the menu. */
export const Default: Story = {};
export const WithoutFilters: Story = {
  args: { filterable: false, showSectionNav: false },
};
