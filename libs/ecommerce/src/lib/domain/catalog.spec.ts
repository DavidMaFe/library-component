import {
  availability,
  categoriesIn,
  discountPercent,
  filterProducts,
  findVariant,
  hasVariants,
  isOnSale,
  isOptionAvailable,
  priceBounds,
  priceOf,
  priceRange,
  Product,
  sortProducts,
  stockOf,
  variantOptions,
} from './catalog';
import { money } from './money';

const eur = (amount: number) => money(amount);
const img = { src: 'x.jpg', alt: 'x' };

const shirt: Product = {
  id: 'shirt',
  name: 'Linen shirt',
  description: 'Lightweight shirt',
  images: [img],
  price: eur(4500),
  compareAtPrice: eur(6000),
  category: 'Clothing',
  rating: { average: 4.5, count: 20 },
  variants: [
    { id: 's-red', attributes: { size: 'S', color: 'Red' }, stock: 3 },
    { id: 's-blue', attributes: { size: 'S', color: 'Blue' }, stock: 0 },
    {
      id: 'm-red',
      attributes: { size: 'M', color: 'Red' },
      stock: 10,
      price: eur(4900),
    },
    { id: 'm-blue', attributes: { size: 'M', color: 'Blue' }, stock: 0 },
  ],
};
const mug: Product = {
  id: 'mug',
  name: 'Ceramic mug',
  images: [img],
  price: eur(1200),
  category: 'Home',
  stock: 40,
  featured: true,
};
const lamp: Product = {
  id: 'lamp',
  name: 'Lámpara de mesa',
  description: 'Diseño escandinavo',
  images: [img],
  price: eur(8900),
  category: 'Home',
  stock: 0,
  rating: { average: 4.9, count: 3 },
};
const products = [shirt, mug, lamp];

describe('stock and availability', () => {
  it('should read stock from a variant, the sum of variants or the product', () => {
    expect(stockOf(shirt)).toBe(13);
    expect(stockOf(shirt, shirt.variants?.[0])).toBe(3);
    expect(stockOf(mug)).toBe(40);
  });

  it('should treat untracked stock as available', () => {
    expect(stockOf({ ...mug, stock: undefined })).toBeUndefined();
    expect(availability(undefined)).toBe('in-stock');
  });

  it('should classify availability', () => {
    expect(availability(0)).toBe('out-of-stock');
    expect(availability(-2)).toBe('out-of-stock');
    expect(availability(3)).toBe('low-stock');
    expect(availability(5)).toBe('low-stock');
    expect(availability(6)).toBe('in-stock');
    expect(availability(10, 10)).toBe('low-stock');
  });

  it('should tell whether a product has variants', () => {
    expect(hasVariants(shirt)).toBe(true);
    expect(hasVariants(mug)).toBe(false);
    expect(hasVariants({ ...mug, variants: [] })).toBe(false);
  });
});

describe('prices', () => {
  it('should compute the discount percentage', () => {
    expect(discountPercent(shirt)).toBe(25);
    expect(discountPercent(mug)).toBe(0);
    expect(discountPercent({ price: eur(100), compareAtPrice: eur(100) })).toBe(
      0,
    );
    expect(discountPercent({ price: eur(100), compareAtPrice: eur(50) })).toBe(
      0,
    );
    expect(isOnSale(shirt)).toBe(true);
    expect(isOnSale(mug)).toBe(false);
  });

  it('should use the variant price when it has one', () => {
    expect(priceOf(shirt)).toEqual(eur(4500));
    expect(priceOf(shirt, shirt.variants?.[2])).toEqual(eur(4900));
  });

  it('should give the price range across variants', () => {
    expect(priceRange(shirt)).toEqual({ min: eur(4500), max: eur(4900) });
    expect(priceRange(mug)).toEqual({ min: eur(1200), max: eur(1200) });
  });
});

describe('variants', () => {
  it('should list the options in order of appearance', () => {
    expect(variantOptions(shirt)).toEqual([
      { key: 'size', values: ['S', 'M'] },
      { key: 'color', values: ['Red', 'Blue'] },
    ]);
    expect(variantOptions(mug)).toEqual([]);
  });

  it('should find the variant of a complete selection', () => {
    expect(findVariant(shirt, { size: 'M', color: 'Red' })?.id).toBe('m-red');
  });

  it('should find nothing while options are missing or unknown', () => {
    expect(findVariant(shirt, { size: 'M' })).toBeUndefined();
    expect(findVariant(shirt, {})).toBeUndefined();
    expect(findVariant(shirt, { size: 'XL', color: 'Red' })).toBeUndefined();
  });

  it('should tell whether an option leaves a variant in stock', () => {
    expect(isOptionAvailable(shirt, {}, 'size', 'S')).toBe(true);
    expect(isOptionAvailable(shirt, { size: 'S' }, 'color', 'Red')).toBe(true);
    expect(isOptionAvailable(shirt, { size: 'S' }, 'color', 'Blue')).toBe(
      false,
    );
    expect(isOptionAvailable(shirt, { color: 'Blue' }, 'size', 'M')).toBe(
      false,
    );
  });

  it('should ignore the current value of the option being checked', () => {
    expect(
      isOptionAvailable(shirt, { size: 'S', color: 'Blue' }, 'color', 'Red'),
    ).toBe(true);
  });
});

describe('filterProducts', () => {
  it('should return everything without a filter', () => {
    expect(filterProducts(products, {})).toEqual(products);
  });

  it('should search every word ignoring case and accents', () => {
    expect(filterProducts(products, { search: 'LAMPARA' })).toEqual([lamp]);
    expect(filterProducts(products, { search: 'diseno escandinavo' })).toEqual([
      lamp,
    ]);
    expect(filterProducts(products, { search: 'linen  shirt' })).toEqual([
      shirt,
    ]);
    expect(filterProducts(products, { search: 'linen mug' })).toEqual([]);
  });

  it('should search in the category too', () => {
    expect(filterProducts(products, { search: 'clothing' })).toEqual([shirt]);
  });

  it('should filter by category', () => {
    expect(filterProducts(products, { categories: ['Home'] })).toEqual([
      mug,
      lamp,
    ]);
    expect(
      filterProducts(products, { categories: ['Home', 'Clothing'] }),
    ).toHaveLength(3);
  });

  it('should filter by starting price', () => {
    expect(filterProducts(products, { minPrice: 2000 })).toEqual([shirt, lamp]);
    expect(filterProducts(products, { maxPrice: 4500 })).toEqual([shirt, mug]);
    expect(
      filterProducts(products, { minPrice: 2000, maxPrice: 5000 }),
    ).toEqual([shirt]);
  });

  it('should keep only products in stock', () => {
    expect(filterProducts(products, { inStockOnly: true })).toEqual([
      shirt,
      mug,
    ]);
  });

  it('should keep only products on sale', () => {
    expect(filterProducts(products, { onSaleOnly: true })).toEqual([shirt]);
  });

  it('should combine filters', () => {
    expect(
      filterProducts(products, { categories: ['Home'], inStockOnly: true }),
    ).toEqual([mug]);
  });
});

describe('sortProducts', () => {
  const names = (list: readonly Product[]) => list.map((p) => p.id);

  it('should sort by price both ways', () => {
    expect(names(sortProducts(products, 'price-asc'))).toEqual([
      'mug',
      'shirt',
      'lamp',
    ]);
    expect(names(sortProducts(products, 'price-desc'))).toEqual([
      'lamp',
      'shirt',
      'mug',
    ]);
  });

  it('should sort by name ignoring accents and case', () => {
    expect(names(sortProducts(products, 'name-asc'))).toEqual([
      'mug',
      'lamp',
      'shirt',
    ]);
  });

  it('should sort by rating, best first, unrated last', () => {
    expect(names(sortProducts(products, 'rating'))).toEqual([
      'lamp',
      'shirt',
      'mug',
    ]);
  });

  it('should sort by discount', () => {
    expect(names(sortProducts(products, 'discount'))[0]).toBe('shirt');
  });

  it('should put featured products first and keep the rest in order', () => {
    expect(names(sortProducts(products, 'featured'))).toEqual([
      'mug',
      'shirt',
      'lamp',
    ]);
  });

  it('should be stable for ties and not mutate the input', () => {
    const tie = [
      { ...mug, id: 'a' },
      { ...mug, id: 'b' },
      { ...mug, id: 'c' },
    ];

    expect(names(sortProducts(tie, 'price-asc'))).toEqual(['a', 'b', 'c']);
    expect(names(products)).toEqual(['shirt', 'mug', 'lamp']);
  });
});

describe('listing helpers', () => {
  it('should give price bounds', () => {
    expect(priceBounds(products)).toEqual({ min: 1200, max: 8900 });
    expect(priceBounds([])).toBeNull();
  });

  it('should list categories sorted and unique', () => {
    expect(categoriesIn(products)).toEqual(['Clothing', 'Home']);
    expect(categoriesIn([{ ...mug, category: undefined }])).toEqual([]);
  });
});
