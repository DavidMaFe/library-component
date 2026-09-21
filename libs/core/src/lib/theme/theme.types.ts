/** A concrete theme applied to the document. */
export type LcTheme = 'light' | 'dark';

/** What the user chose: a concrete theme, or follow the operating system. */
export type LcThemePreference = LcTheme | 'system';

export interface LcThemeConfig {
  /** Preference used when nothing has been persisted yet. */
  readonly defaultPreference: LcThemePreference;
  /** Key used to persist the preference. */
  readonly storageKey: string;
  /** Attribute set on the root element with the active theme. */
  readonly attribute: string;
}
