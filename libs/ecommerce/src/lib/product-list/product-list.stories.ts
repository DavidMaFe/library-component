import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { ProductSort } from '../domain/catalog';
import { sampleProducts } from '../testing/sample-data';
import { LcProductList } from './product-list';

interface ListArgs {
  pageSize: number;
  sort: ProductSort;
}

// `component` is deliberately not set (see the tooltip story in @lc/ui).
const meta: Meta<ListArgs> = {
  title: 'Ecommerce/Product list',
  decorators: [moduleMetadata({ imports: [LcProductList] })],
  parameters: { layout: 'padded' },
  argTypes: {
    sort: {
      control: 'select',
      options: [
        'featured',
        'price-asc',
        'price-desc',
        'name-asc',
        'rating',
        'discount',
      ],
    },
  },
  args: { pageSize: 0, sort: 'featured' },
  render: (args) => ({
    props: { ...args, products: sampleProducts },
    template: `<lc-product-list [products]="products" [pageSize]="pageSize" [sort]="sort" />`,
  }),
};
export default meta;

type Story = StoryObj<ListArgs>;

export const Default: Story = {};
export const Paginated: Story = { args: { pageSize: 2 } };
