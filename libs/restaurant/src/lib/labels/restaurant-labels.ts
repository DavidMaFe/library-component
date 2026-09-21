import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { Allergen, DietaryTag } from '../domain/menu';
import { ReservationIssue, ReservationPolicy } from '../domain/reservation';

/** Every user-facing text of the restaurant components. Replace any of them to translate or reword. */
export interface LcRestaurantLabels {
  readonly allergens: Readonly<Record<Allergen, string>>;
  readonly dietary: Readonly<Record<DietaryTag, string>>;

  // Dish and menu
  readonly soldOut: string;
  readonly allergensLabel: string;
  readonly menuSectionNav: string;
  readonly menuFilter: string;
  readonly menuClearFilters: string;
  readonly menuNoResults: string;
  readonly menuResults: (count: number) => string;

  // Opening hours
  readonly hoursClosed: string;
  readonly hoursOpenNow: string;
  readonly hoursClosedNow: string;
  readonly hoursClosesAt: (time: string) => string;
  /** `day` is `null` for today, otherwise `tomorrow` or a weekday name. */
  readonly hoursOpensAt: (day: string | null, time: string) => string;
  readonly hoursTomorrow: string;
  readonly hoursClosures: string;

  // Reservation
  readonly reservationDate: string;
  readonly reservationTime: string;
  readonly reservationTimePlaceholder: string;
  readonly reservationNoSlots: string;
  readonly reservationPartySize: string;
  readonly reservationName: string;
  readonly reservationEmail: string;
  readonly reservationPhone: string;
  readonly reservationNotes: string;
  readonly reservationSubmit: string;
  readonly reservationIssue: (
    issue: ReservationIssue,
    policy: ReservationPolicy,
  ) => string;

  // Gallery
  readonly galleryOpen: (
    position: number,
    total: number,
    description: string,
  ) => string;
  readonly galleryCounter: (position: number, total: number) => string;
  readonly galleryPrevious: string;
  readonly galleryNext: string;
  readonly galleryClose: string;

  // Contact
  readonly contactAddress: string;
  readonly contactPhone: string;
  readonly contactEmail: string;
  readonly contactWebsite: string;
  readonly contactMap: string;
  readonly contactSocial: string;
}

export const DEFAULT_LC_RESTAURANT_LABELS: LcRestaurantLabels = {
  allergens: {
    gluten: 'Gluten',
    crustaceans: 'Crustaceans',
    eggs: 'Eggs',
    fish: 'Fish',
    peanuts: 'Peanuts',
    soy: 'Soy',
    milk: 'Milk',
    nuts: 'Tree nuts',
    celery: 'Celery',
    mustard: 'Mustard',
    sesame: 'Sesame',
    sulphites: 'Sulphites',
    lupin: 'Lupin',
    molluscs: 'Molluscs',
  },
  dietary: {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    'gluten-free': 'Gluten-free',
    'lactose-free': 'Lactose-free',
    spicy: 'Spicy',
    halal: 'Halal',
  },

  soldOut: 'Sold out',
  allergensLabel: 'Allergens',
  menuSectionNav: 'Menu sections',
  menuFilter: 'Show only',
  menuClearFilters: 'Clear filters',
  menuNoResults: 'No dishes match your filters.',
  menuResults: (count) =>
    count === 1 ? '1 dish shown' : `${count} dishes shown`,

  hoursClosed: 'Closed',
  hoursOpenNow: 'Open now',
  hoursClosedNow: 'Closed now',
  hoursClosesAt: (time) => `closes at ${time}`,
  hoursOpensAt: (day, time) =>
    day ? `opens ${day} at ${time}` : `opens at ${time}`,
  hoursTomorrow: 'tomorrow',
  hoursClosures: 'Upcoming closures',

  reservationDate: 'Date',
  reservationTime: 'Time',
  reservationTimePlaceholder: 'Choose a time',
  reservationNoSlots: 'No tables available on this date.',
  reservationPartySize: 'Guests',
  reservationName: 'Name',
  reservationEmail: 'Email',
  reservationPhone: 'Phone (optional)',
  reservationNotes: 'Special requests (optional)',
  reservationSubmit: 'Book a table',
  reservationIssue: (issue, policy) => {
    switch (issue) {
      case 'party-size':
        return `We can seat between ${policy.minPartySize} and ${policy.maxPartySize} guests.`;
      case 'date-invalid':
        return 'Choose a valid date.';
      case 'date-past':
        return 'Choose a date that has not passed.';
      case 'date-too-far':
        return `Bookings open up to ${policy.maxAdvanceDays} days ahead.`;
      case 'time-invalid':
        return 'Choose a valid time.';
      case 'time-unavailable':
        return 'That time is not available. Choose another.';
    }
  },

  galleryOpen: (position, total, description) =>
    `Open photo ${position} of ${total}${description ? `: ${description}` : ''}`,
  galleryCounter: (position, total) => `Photo ${position} of ${total}`,
  galleryPrevious: 'Previous photo',
  galleryNext: 'Next photo',
  galleryClose: 'Close',

  contactAddress: 'Address',
  contactPhone: 'Phone',
  contactEmail: 'Email',
  contactWebsite: 'Website',
  contactMap: 'View on map',
  contactSocial: 'Social media',
};

export const LC_RESTAURANT_LABELS = new InjectionToken<LcRestaurantLabels>(
  'LC_RESTAURANT_LABELS',
  {
    providedIn: 'root',
    factory: () => DEFAULT_LC_RESTAURANT_LABELS,
  },
);

/** Overrides labels on top of the English defaults. Nested groups (`allergens`, `dietary`) merge too. */
export function provideLcRestaurantLabels(
  overrides: Partial<Omit<LcRestaurantLabels, 'allergens' | 'dietary'>> & {
    allergens?: Partial<LcRestaurantLabels['allergens']>;
    dietary?: Partial<LcRestaurantLabels['dietary']>;
  },
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LC_RESTAURANT_LABELS,
      useValue: {
        ...DEFAULT_LC_RESTAURANT_LABELS,
        ...overrides,
        allergens: {
          ...DEFAULT_LC_RESTAURANT_LABELS.allergens,
          ...overrides.allergens,
        },
        dietary: {
          ...DEFAULT_LC_RESTAURANT_LABELS.dietary,
          ...overrides.dietary,
        },
      },
    },
  ]);
}
