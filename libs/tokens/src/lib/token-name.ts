/** Prefix shared by every CSS custom property exposed by the library. */
export const LC_TOKEN_PREFIX = '--lc-';

/** A CSS custom property name owned by the library, e.g. `--lc-primary-600`. */
export type LcTokenName = `${typeof LC_TOKEN_PREFIX}${string}`;

export function isLcTokenName(name: string): name is LcTokenName {
  return (
    name.startsWith(LC_TOKEN_PREFIX) && name.length > LC_TOKEN_PREFIX.length
  );
}
