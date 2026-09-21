import { LcBrandOverrides } from '@lc/tokens';

export interface ShowcaseBrand {
  readonly id: string;
  readonly label: string;
  readonly overrides: LcBrandOverrides;
}

export const SHOWCASE_BRANDS: readonly ShowcaseBrand[] = [
  { id: 'default', label: 'Default (blue)', overrides: {} },
  {
    id: 'trattoria',
    label: 'Trattoria (warm)',
    overrides: {
      '--lc-primary-50': '#fffbeb',
      '--lc-primary-100': '#fef3c7',
      '--lc-primary-200': '#fde68a',
      '--lc-primary-300': '#fcd34d',
      '--lc-primary-400': '#fbbf24',
      '--lc-primary-500': '#f59e0b',
      '--lc-primary-600': '#b45309',
      '--lc-primary-700': '#92400e',
      '--lc-primary-800': '#78350f',
      '--lc-primary-900': '#451a03',
      '--lc-radius-md': '0.125rem',
      '--lc-font-family-heading': "Georgia, 'Times New Roman', serif",
    },
  },
  {
    id: 'forest',
    label: 'Forest (green, rounded)',
    overrides: {
      '--lc-primary-50': '#f0fdf4',
      '--lc-primary-100': '#dcfce7',
      '--lc-primary-200': '#bbf7d0',
      '--lc-primary-300': '#86efac',
      '--lc-primary-400': '#4ade80',
      '--lc-primary-500': '#22c55e',
      '--lc-primary-600': '#15803d',
      '--lc-primary-700': '#166534',
      '--lc-primary-800': '#14532d',
      '--lc-primary-900': '#052e16',
      '--lc-radius-md': '1rem',
    },
  },
];
