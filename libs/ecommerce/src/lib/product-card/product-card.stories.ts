import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { Product } from '../domain/catalog';
import {
  ceramicMug,
  linenShirt,
  notebook,
  tableLamp,
} from '../testing/sample-data';
import { LcProductCard } from './product-card';

interface CardArgs {
  product: Product;
}

// `component` is deliberately not set (see the tooltip story in @lc/ui).
const meta: Meta<CardArgs> = {
  title: 'Ecommerce/Product card',
  decorators: [moduleMetadata({ imports: [LcProductCard] })],
  args: { product: ceramicMug },
  render: (args) => ({
    props: {
      ...args,
      log: (what: string, product: Product) => console.log(what, product.id),
    },
    template: `<lc-product-card [product]="product" href="#product" (add)="log('add', $event)" (viewOptions)="log('options', $event)" style="max-width:18rem" />`,
  }),
};
export default meta;

type Story = StoryObj<CardArgs>;

export const Simple: Story = {};
export const OnSale: Story = { args: { product: notebook } };
export const WithVariants: Story = { args: { product: linenShirt } };
export const OutOfStock: Story = { args: { product: tableLamp } };
