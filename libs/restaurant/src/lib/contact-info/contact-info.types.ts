export interface PostalAddress {
  readonly street: string;
  readonly city: string;
  readonly postalCode?: string;
  readonly country?: string;
}

export interface SocialLink {
  /** Visible name, e.g. `Instagram`. */
  readonly network: string;
  readonly url: string;
}

export interface ContactDetails {
  readonly name?: string;
  readonly address?: PostalAddress;
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
  /** Link to a map of the address. Not generated, so no map provider is assumed. */
  readonly mapUrl?: string;
  readonly social?: readonly SocialLink[];
}

/** `+34 91 123 45 67` -> `+34911234567`, usable in a `tel:` link. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
