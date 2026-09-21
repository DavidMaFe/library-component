export interface GalleryPhoto {
  readonly src: string;
  /** Describes the photo for screen readers. */
  readonly alt: string;
  readonly caption?: string;
}
