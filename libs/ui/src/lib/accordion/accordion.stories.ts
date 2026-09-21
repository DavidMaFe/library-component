import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcAccordion } from './accordion';
import { LcAccordionItem } from './accordion-item';

const meta: Meta<LcAccordion> = {
  title: 'Navigation/Accordion',
  component: LcAccordion,
  decorators: [moduleMetadata({ imports: [LcAccordion, LcAccordionItem] })],
  render: () => ({
    template: `
      <lc-accordion style="max-width:32rem">
        <lc-accordion-item heading="Allergens" expanded>Contains gluten, milk and eggs.</lc-accordion-item>
        <lc-accordion-item heading="Opening hours">Tuesday to Sunday, 12:00 to 23:00.</lc-accordion-item>
        <lc-accordion-item heading="Delivery" disabled>Not available today.</lc-accordion-item>
      </lc-accordion>`,
  }),
};
export default meta;

type Story = StoryObj<LcAccordion>;

/** Only one section is open at a time. */
export const Single: Story = {};

export const Multi: Story = {
  render: () => ({
    template: `
      <lc-accordion multi style="max-width:32rem">
        <lc-accordion-item heading="Allergens" expanded>Contains gluten, milk and eggs.</lc-accordion-item>
        <lc-accordion-item heading="Opening hours" expanded>Tuesday to Sunday, 12:00 to 23:00.</lc-accordion-item>
        <lc-accordion-item heading="Payment">Cash and cards.</lc-accordion-item>
      </lc-accordion>`,
  }),
};
