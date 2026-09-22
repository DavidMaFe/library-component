import { addLine, applyCoupon, Cart, emptyCart } from '../domain/cart';
import { Product } from '../domain/catalog';
import { ShippingMethod } from '../domain/checkout';
import { money } from '../domain/money';

/** A flat-color placeholder image, so stories and tests need no external files. */
export const placeholder = (color: string, label = ''): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='600' height='600' fill='${color}'/><text x='300' y='315' font-family='sans-serif' font-size='40' fill='white' text-anchor='middle'>${label}</text></svg>`,
  )}`;

const eur = (amount: number) => money(amount, 'EUR');

export const linenShirt: Product = {
  id: 'shirt',
  name: 'Linen shirt',
  description:
    'A lightweight, breathable shirt made from washed European linen.',
  images: [
    { src: placeholder('#0369a1', 'Front'), alt: 'Linen shirt, front' },
    { src: placeholder('#0e7490', 'Back'), alt: 'Linen shirt, back' },
    {
      src: placeholder('#155e75', 'Detail'),
      alt: 'Linen shirt, collar detail',
    },
  ],
  price: eur(4500),
  compareAtPrice: eur(6000),
  category: 'Clothing',
  rating: { average: 4.5, count: 28 },
  featured: true,
  variants: [
    { id: 's-white', attributes: { size: 'S', color: 'White' }, stock: 3 },
    { id: 's-navy', attributes: { size: 'S', color: 'Navy' }, stock: 0 },
    {
      id: 'm-white',
      attributes: { size: 'M', color: 'White' },
      stock: 12,
      price: eur(4900),
    },
    { id: 'm-navy', attributes: { size: 'M', color: 'Navy' }, stock: 8 },
    { id: 'l-white', attributes: { size: 'L', color: 'White' }, stock: 0 },
    { id: 'l-navy', attributes: { size: 'L', color: 'Navy' }, stock: 0 },
  ],
};

export const ceramicMug: Product = {
  id: 'mug',
  name: 'Ceramic mug',
  description: 'Hand-glazed stoneware mug, 350 ml.',
  images: [
    { src: placeholder('#b45309', 'Mug'), alt: 'A blue-glazed ceramic mug' },
  ],
  price: eur(1200),
  category: 'Home',
  rating: { average: 4.8, count: 112 },
  stock: 40,
};

export const tableLamp: Product = {
  id: 'lamp',
  name: 'Table lamp',
  description: 'Oak base with a linen shade.',
  images: [{ src: placeholder('#7c3aed', 'Lamp'), alt: 'An oak table lamp' }],
  price: eur(8900),
  category: 'Home',
  stock: 0,
};

export const notebook: Product = {
  id: 'notebook',
  name: 'Dotted notebook',
  images: [
    { src: placeholder('#15803d', 'Notebook'), alt: 'A green dotted notebook' },
  ],
  price: eur(1500),
  compareAtPrice: eur(1800),
  category: 'Stationery',
  rating: { average: 4.2, count: 9 },
  stock: 4,
};

export const candle: Product = {
  id: 'candle',
  name: 'Soy candle',
  images: [
    {
      src: placeholder('#be123c', 'Candle'),
      alt: 'A soy candle in a glass jar',
    },
  ],
  price: eur(2200),
  category: 'Home',
  stock: 25,
};

export const sampleProducts: Product[] = [
  linenShirt,
  ceramicMug,
  tableLamp,
  notebook,
  candle,
];

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    label: 'Standard',
    description: '3-5 business days',
    price: eur(495),
  },
  {
    id: 'express',
    label: 'Express',
    description: 'Next business day',
    price: eur(1295),
  },
  { id: 'pickup', label: 'Store pickup', price: eur(0) },
];

export const sampleCart: Cart = [
  {
    productId: 'shirt',
    variantId: 'm-navy',
    name: 'Linen shirt',
    variantLabel: 'M / Navy',
    image: { src: placeholder('#0369a1', 'Shirt'), alt: 'Linen shirt' },
    unitPrice: eur(4500),
    quantity: 1,
    maxQuantity: 8,
  },
  {
    productId: 'mug',
    name: 'Ceramic mug',
    image: { src: placeholder('#b45309', 'Mug'), alt: 'Ceramic mug' },
    unitPrice: eur(1200),
    quantity: 2,
    maxQuantity: 10,
  },
].reduce(addLine, emptyCart());

export const cartWithCoupon: Cart = applyCoupon(sampleCart, {
  code: 'WELCOME10',
  kind: 'percentage',
  percent: 10,
});
