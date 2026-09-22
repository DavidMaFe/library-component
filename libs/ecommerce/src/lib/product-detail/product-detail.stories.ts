import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { Product } from '../domain/catalog';
import { ceramicMug, linenShirt, tableLamp } from '../testing/sample-data';
import { AddToCartEvent, LcProductDetail } from './product-detail';

interface DetailArgs {
  product: Product;
}

// `component` is deliberately not set (see the tooltip story in @lc/ui).
const meta: Meta<DetailArgs> = {
  title: 'Ecommerce/Product detail',
  decorators: [moduleMetadata({ imports: [LcProductDetail] })],
  parameters: { layout: 'padded' },
  args: { product: linenShirt },
  render: (args) => ({
    props: {
      ...args,
      last: null as AddToCartEvent | null,
      added(event: AddToCartEvent) {
        (this as { last: AddToCartEvent | null }).last = event;
      },
    },
    template: `
      <lc-product-detail [product]="product" (addToCart)="added($event)" />
      @if (last) {
        <p style="margin-top:1rem;padding:0.75rem 1rem;background:var(--lc-color-success-subtle);border-radius:var(--lc-radius-md)">
          Added {{ last.quantity }} × {{ last.product.name }} {{ last.variant ? '(' + last.variant.id + ')' : '' }}
        </p>
      }`,
  }),
};
export default meta;

type Story = StoryObj<DetailArgs>;

/** Options that leave nothing in stock are disabled; add to cart waits for a complete choice. */
export const WithVariants: Story = {};
export const Simple: Story = { args: { product: ceramicMug } };
export const OutOfStock: Story = { args: { product: tableLamp } };
