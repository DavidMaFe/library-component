/** The 14 allergens that must be declared under EU food information rules. */
export type Allergen =
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'peanuts'
  | 'soy'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs';

export type DietaryTag =
  'vegetarian' | 'vegan' | 'gluten-free' | 'lactose-free' | 'spicy' | 'halal';

export interface DishImage {
  readonly src: string;
  /** Describes the photo. Use an empty string only when it is purely decorative. */
  readonly alt: string;
}

export interface Dish {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  /** Price in the major currency unit (e.g. euros), not cents. */
  readonly price: number;
  readonly image?: DishImage;
  readonly allergens?: readonly Allergen[];
  readonly dietary?: readonly DietaryTag[];
  /** `false` marks the dish as sold out. Defaults to available. */
  readonly available?: boolean;
}

export interface MenuSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly dishes: readonly Dish[];
}

export interface DishFilter {
  /** The dish must carry every one of these tags. */
  readonly dietary?: readonly DietaryTag[];
  /** The dish must not contain any of these allergens. */
  readonly excludeAllergens?: readonly Allergen[];
}

/** Keeps the dishes that satisfy every dietary tag and contain none of the excluded allergens. */
export function filterDishes(
  dishes: readonly Dish[],
  filter: DishFilter,
): readonly Dish[] {
  const dietary = filter.dietary ?? [];
  const excluded = filter.excludeAllergens ?? [];
  if (dietary.length === 0 && excluded.length === 0) return dishes;

  return dishes.filter(
    (dish) =>
      dietary.every((tag) => dish.dietary?.includes(tag)) &&
      !excluded.some((allergen) => dish.allergens?.includes(allergen)),
  );
}

/** Applies a filter to every section and drops the sections left empty. */
export function filterSections(
  sections: readonly MenuSection[],
  filter: DishFilter,
): readonly MenuSection[] {
  return sections
    .map((section) => ({
      ...section,
      dishes: filterDishes(section.dishes, filter),
    }))
    .filter((section) => section.dishes.length > 0);
}

/** Every dietary tag used in the sections, in a stable order, so filters can be built from real data. */
export function dietaryTagsIn(
  sections: readonly MenuSection[],
): readonly DietaryTag[] {
  const order: readonly DietaryTag[] = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'lactose-free',
    'halal',
    'spicy',
  ];
  const used = new Set(
    sections.flatMap((section) =>
      section.dishes.flatMap((dish) => dish.dietary ?? []),
    ),
  );
  return order.filter((tag) => used.has(tag));
}

export interface PriceFormat {
  /** ISO 4217 currency code. Defaults to `EUR`. */
  readonly currency?: string;
  /** BCP 47 locale. Defaults to the runtime locale. */
  readonly locale?: string;
}

/** Formats a price, hiding decimals for whole amounts (`12 €`, but `12,50 €`). */
export function formatPrice(
  amount: number,
  { currency = 'EUR', locale }: PriceFormat = {},
): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
