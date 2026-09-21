import {
  Dish,
  dietaryTagsIn,
  filterDishes,
  filterSections,
  formatPrice,
  MenuSection,
} from './menu';

const dish = (id: string, extra: Partial<Dish> = {}): Dish => ({
  id,
  name: id,
  price: 10,
  ...extra,
});

const pasta = dish('pasta', {
  dietary: ['vegetarian'],
  allergens: ['gluten', 'eggs'],
});
const salad = dish('salad', {
  dietary: ['vegan', 'vegetarian', 'gluten-free'],
});
const steak = dish('steak', { allergens: ['mustard'] });
const dishes = [pasta, salad, steak];

describe('filterDishes', () => {
  it('should return every dish without a filter', () => {
    expect(filterDishes(dishes, {})).toBe(dishes);
    expect(filterDishes(dishes, { dietary: [], excludeAllergens: [] })).toBe(
      dishes,
    );
  });

  it('should keep dishes carrying a dietary tag', () => {
    expect(filterDishes(dishes, { dietary: ['vegetarian'] })).toEqual([
      pasta,
      salad,
    ]);
  });

  it('should require every selected tag', () => {
    expect(
      filterDishes(dishes, { dietary: ['vegetarian', 'gluten-free'] }),
    ).toEqual([salad]);
  });

  it('should exclude dishes containing an allergen', () => {
    expect(filterDishes(dishes, { excludeAllergens: ['gluten'] })).toEqual([
      salad,
      steak,
    ]);
  });

  it('should exclude dishes containing any of several allergens', () => {
    expect(
      filterDishes(dishes, { excludeAllergens: ['gluten', 'mustard'] }),
    ).toEqual([salad]);
  });

  it('should combine tags and allergens', () => {
    expect(
      filterDishes(dishes, {
        dietary: ['vegetarian'],
        excludeAllergens: ['eggs'],
      }),
    ).toEqual([salad]);
  });

  it('should treat dishes without data as having no tags and no allergens', () => {
    expect(filterDishes([dish('plain')], { dietary: ['vegan'] })).toEqual([]);
    expect(
      filterDishes([dish('plain')], { excludeAllergens: ['milk'] }),
    ).toHaveLength(1);
  });
});

describe('filterSections', () => {
  const sections: MenuSection[] = [
    { id: 'starters', title: 'Starters', dishes: [salad] },
    { id: 'mains', title: 'Mains', dishes: [pasta, steak] },
  ];

  it('should drop sections left without dishes', () => {
    expect(
      filterSections(sections, { dietary: ['vegan'] }).map((s) => s.id),
    ).toEqual(['starters']);
  });

  it('should keep the section data and filter its dishes', () => {
    const [mains] = filterSections(sections, {
      excludeAllergens: ['gluten'],
    }).filter((s) => s.id === 'mains');

    expect(mains.title).toBe('Mains');
    expect(mains.dishes).toEqual([steak]);
  });

  it('should not mutate the input', () => {
    filterSections(sections, { dietary: ['vegan'] });

    expect(sections[1].dishes).toHaveLength(2);
  });
});

describe('dietaryTagsIn', () => {
  it('should list the used tags in a stable order', () => {
    const sections: MenuSection[] = [
      {
        id: 'a',
        title: 'A',
        dishes: [dish('x', { dietary: ['spicy', 'vegan'] }), pasta],
      },
    ];

    expect(dietaryTagsIn(sections)).toEqual(['vegetarian', 'vegan', 'spicy']);
  });

  it('should return nothing when no dish has tags', () => {
    expect(dietaryTagsIn([{ id: 'a', title: 'A', dishes: [steak] }])).toEqual(
      [],
    );
  });
});

describe('formatPrice', () => {
  it('should hide decimals for whole amounts', () => {
    expect(formatPrice(12, { locale: 'en-US', currency: 'USD' })).toBe('$12');
  });

  it('should show two decimals otherwise', () => {
    expect(formatPrice(12.5, { locale: 'en-US', currency: 'USD' })).toBe(
      '$12.50',
    );
  });

  it('should format in the requested locale and currency', () => {
    expect(formatPrice(9.9, { locale: 'de-DE', currency: 'EUR' })).toMatch(
      /9,90\s€/,
    );
  });

  it('should default to euros', () => {
    expect(formatPrice(3, { locale: 'en-US' })).toContain('€');
  });
});
