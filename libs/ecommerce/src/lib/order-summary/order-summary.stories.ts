import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { applyCoupon, cartTotals } from '../domain/cart';
import { money } from '../domain/money';
import { sampleCart } from '../testing/sample-data';
import { LcOrderSummary } from './order-summary';

interface SummaryArgs {
  shippingPending: boolean;
  pricesIncludeTax: boolean;
}

// `component` is deliberately not set (see the tooltip story in @lc/ui).
const meta: Meta<SummaryArgs> = {
  title: 'Ecommerce/Order summary',
  decorators: [moduleMetadata({ imports: [LcOrderSummary] })],
  args: { shippingPending: false, pricesIncludeTax: true },
  render: (args) => ({
    props: {
      ...args,
      totals: cartTotals(sampleCart, {
        shipping: money(495),
        taxRate: 21,
        pricesIncludeTax: args.pricesIncludeTax,
      }),
    },
    template: `<lc-order-summary [totals]="totals" [shippingPending]="shippingPending" [pricesIncludeTax]="pricesIncludeTax" style="max-width:22rem" />`,
  }),
};
export default meta;

type Story = StoryObj<SummaryArgs>;

export const Default: Story = {};
export const ShippingPending: Story = { args: { shippingPending: true } };
export const TaxOnTop: Story = { args: { pricesIncludeTax: false } };

export const WithDiscountAndFreeShipping: Story = {
  render: () => ({
    props: {
      totals: cartTotals(
        applyCoupon(sampleCart, { code: 'SHIPFREE', kind: 'free-shipping' }),
        { shipping: money(495), taxRate: 21 },
      ),
    },
    template: `<lc-order-summary [totals]="totals" couponCode="SHIPFREE" style="max-width:22rem" />`,
  }),
};
