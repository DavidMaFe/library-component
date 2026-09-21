import { ContactDetails } from '../contact-info/contact-info.types';
import { MenuSection } from '../domain/menu';
import { OpeningHours, Weekday } from '../domain/opening-hours';
import { GalleryPhoto } from '../photo-gallery/photo-gallery.types';

/** A flat-color placeholder image, so stories need no external files. */
export const placeholder = (color: string, label = ''): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='600' height='400' fill='${color}'/><text x='300' y='215' font-family='sans-serif' font-size='32' fill='white' text-anchor='middle'>${label}</text></svg>`,
  )}`;

export const sampleSections: MenuSection[] = [
  {
    id: 'starters',
    title: 'Starters',
    description: 'To share, or not.',
    dishes: [
      {
        id: 'burrata',
        name: 'Burrata with tomatoes',
        description: 'Creamy burrata, heirloom tomatoes and basil oil.',
        price: 11,
        image: {
          src: placeholder('#dc2626', 'Burrata'),
          alt: 'Burrata with red tomatoes',
        },
        dietary: ['vegetarian', 'gluten-free'],
        allergens: ['milk'],
      },
      {
        id: 'salad',
        name: 'Green salad',
        description: 'Seasonal leaves, lemon and olive oil.',
        price: 8.5,
        dietary: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
      },
      {
        id: 'carpaccio',
        name: 'Beef carpaccio',
        price: 13,
        allergens: ['mustard'],
        available: false,
      },
    ],
  },
  {
    id: 'mains',
    title: 'Mains',
    dishes: [
      {
        id: 'tagliatelle',
        name: 'Tagliatelle al ragù',
        description: 'Fresh egg pasta, slow-cooked beef and pork ragù.',
        price: 15,
        image: {
          src: placeholder('#d97706', 'Tagliatelle'),
          alt: 'Tagliatelle with ragù',
        },
        allergens: ['gluten', 'eggs', 'celery'],
      },
      {
        id: 'risotto',
        name: 'Mushroom risotto',
        description: 'Carnaroli rice, porcini and parmesan.',
        price: 16,
        dietary: ['vegetarian', 'gluten-free'],
        allergens: ['milk'],
      },
      {
        id: 'diavola',
        name: 'Pizza diavola',
        description: 'Spicy salami, mozzarella and chili oil.',
        price: 13.5,
        dietary: ['spicy'],
        allergens: ['gluten', 'milk'],
      },
    ],
  },
  {
    id: 'desserts',
    title: 'Desserts',
    dishes: [
      {
        id: 'tiramisu',
        name: 'Tiramisu',
        price: 7,
        dietary: ['vegetarian'],
        allergens: ['gluten', 'eggs', 'milk'],
      },
      {
        id: 'sorbet',
        name: 'Lemon sorbet',
        price: 6,
        dietary: ['vegan', 'gluten-free'],
      },
    ],
  },
];

export const sampleHours: OpeningHours = {
  schedule: [
    ...([2, 3, 4] as Weekday[]).map((day) => ({
      day,
      ranges: [
        { open: '12:30', close: '15:00' },
        { open: '19:30', close: '23:00' },
      ],
    })),
    {
      day: 5,
      ranges: [
        { open: '12:30', close: '15:00' },
        { open: '19:30', close: '01:00' },
      ],
    },
    {
      day: 6,
      ranges: [
        { open: '12:30', close: '15:30' },
        { open: '19:30', close: '01:00' },
      ],
    },
    { day: 0, ranges: [{ open: '12:30', close: '16:00' }] },
  ],
  closures: [
    { date: '2099-12-25', reason: 'Christmas Day' },
    { date: '2099-12-26' },
  ],
};

export const samplePhotos: GalleryPhoto[] = [
  {
    src: placeholder('#b45309', 'Dining room'),
    alt: 'The dining room with wooden tables',
    caption: 'The dining room',
  },
  {
    src: placeholder('#15803d', 'Terrace'),
    alt: 'The terrace under the pergola',
    caption: 'Summer terrace',
  },
  {
    src: placeholder('#1d4ed8', 'Wood oven'),
    alt: 'The wood-fired pizza oven',
  },
  { src: placeholder('#7c3aed', 'Bar'), alt: 'The bar with a row of bottles' },
  {
    src: placeholder('#be123c', 'Wine cellar'),
    alt: 'Shelves in the wine cellar',
    caption: 'Our wine cellar',
  },
  {
    src: placeholder('#0f766e', 'Kitchen'),
    alt: 'Chefs working in the open kitchen',
  },
];

export const sampleContact: ContactDetails = {
  name: 'Trattoria Rossi',
  address: {
    street: 'Via Roma 1',
    postalCode: '00100',
    city: 'Roma',
    country: 'Italia',
  },
  phone: '+39 06 1234 5678',
  email: 'ciao@rossi.example',
  website: 'https://rossi.example/',
  mapUrl: 'https://maps.example/trattoria-rossi',
  social: [
    { network: 'Instagram', url: 'https://instagram.example/rossi' },
    { network: 'Facebook', url: 'https://facebook.example/rossi' },
  ],
};
