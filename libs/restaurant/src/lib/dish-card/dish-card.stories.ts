import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { Dish } from '../domain/menu';
import { sampleSections } from '../testing/sample-data';
import { LcDishCard } from './dish-card';

interface DishCardArgs {
  dish: Dish;
  currency: string;
}

const [burrata, salad, carpaccio] = sampleSections[0].dishes;
const tagliatelle = sampleSections[1].dishes[0];

// `component` is deliberately not set (see the tooltip story).
const meta: Meta<DishCardArgs> = {
  title: 'Restaurant/Dish card',
  decorators: [moduleMetadata({ imports: [LcDishCard] })],
  args: { dish: burrata, currency: 'EUR' },
  render: (args) => ({
    props: args,
    template: `<lc-dish-card [dish]="dish" [currency]="currency" style="max-width:22rem" />`,
  }),
};
export default meta;

type Story = StoryObj<DishCardArgs>;

export const WithImage: Story = {};
export const Simple: Story = { args: { dish: salad } };
export const SoldOut: Story = { args: { dish: carpaccio } };
export const Allergens: Story = { args: { dish: tagliatelle } };
