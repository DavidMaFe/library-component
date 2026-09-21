import { LcTokenName } from './token-name';

/** Token overrides that define a brand, e.g. `{ '--lc-primary-600': '#b45309' }`. */
export type LcBrandOverrides = Readonly<Partial<Record<LcTokenName, string>>>;
