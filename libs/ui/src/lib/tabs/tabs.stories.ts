import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcTab } from './tab';
import { LcTabs } from './tabs';

const meta: Meta<LcTabs> = {
  title: 'Navigation/Tabs',
  component: LcTabs,
  decorators: [moduleMetadata({ imports: [LcTabs, LcTab] })],
  render: () => ({
    template: `
      <lc-tabs label="Menu sections">
        <lc-tab label="Starters">Bruschetta, burrata and carpaccio.</lc-tab>
        <lc-tab label="Mains">Lasagna, risotto and saltimbocca.</lc-tab>
        <lc-tab label="Desserts">Tiramisu and panna cotta.</lc-tab>
      </lc-tabs>`,
  }),
};
export default meta;

type Story = StoryObj<LcTabs>;

/** Arrow keys, `Home` and `End` move between tabs. */
export const Default: Story = {};

export const WithDisabledTab: Story = {
  render: () => ({
    template: `
      <lc-tabs label="Account">
        <lc-tab label="Profile">Your profile</lc-tab>
        <lc-tab label="Billing" disabled>Not available</lc-tab>
        <lc-tab label="Security">Passwords and devices</lc-tab>
      </lc-tabs>`,
  }),
};
