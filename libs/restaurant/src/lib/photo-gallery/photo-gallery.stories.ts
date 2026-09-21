import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { samplePhotos } from '../testing/sample-data';
import { LcPhotoGallery } from './photo-gallery';

interface GalleryArgs {
  count: number;
  minItemWidth: string;
}

// `component` is deliberately not set (see the tooltip story).
const meta: Meta<GalleryArgs> = {
  title: 'Restaurant/Photo gallery',
  decorators: [moduleMetadata({ imports: [LcPhotoGallery] })],
  argTypes: { count: { control: { type: 'range', min: 1, max: 6 } } },
  args: { count: 6, minItemWidth: '12rem' },
  render: (args) => ({
    props: {
      photos: samplePhotos.slice(0, args.count),
      minItemWidth: args.minItemWidth,
    },
    template: `<lc-photo-gallery [photos]="photos" [minItemWidth]="minItemWidth" />`,
  }),
};
export default meta;

type Story = StoryObj<GalleryArgs>;

/** Click a photo: the lightbox traps focus, `Escape` closes it and the arrow keys move between photos. */
export const Default: Story = {};
export const SinglePhoto: Story = { args: { count: 1 } };
