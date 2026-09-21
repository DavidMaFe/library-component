import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sampleContact } from '../testing/sample-data';
import { ContactDetails } from './contact-info.types';
import { LcContactInfo } from './contact-info';

interface ContactArgs {
  contact: ContactDetails;
}

// `component` is deliberately not set (see the tooltip story).
const meta: Meta<ContactArgs> = {
  title: 'Restaurant/Contact info',
  decorators: [moduleMetadata({ imports: [LcContactInfo] })],
  args: { contact: sampleContact },
  render: (args) => ({
    props: args,
    template: `<lc-contact-info [contact]="contact" style="max-width:22rem" />`,
  }),
};
export default meta;

type Story = StoryObj<ContactArgs>;

export const Complete: Story = {};
export const Minimal: Story = {
  args: { contact: { name: 'Trattoria Rossi', phone: '+39 06 1234 5678' } },
};
