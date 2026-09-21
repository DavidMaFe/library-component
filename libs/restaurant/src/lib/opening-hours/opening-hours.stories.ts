import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sampleHours } from '../testing/sample-data';
import { LcOpeningHours } from './opening-hours';

interface OpeningHoursArgs {
  now: string;
  weekStart: 0 | 1;
}

// `component` is deliberately not set (see the tooltip story).
const meta: Meta<OpeningHoursArgs> = {
  title: 'Restaurant/Opening hours',
  decorators: [moduleMetadata({ imports: [LcOpeningHours] })],
  argTypes: { weekStart: { control: 'inline-radio', options: [0, 1] } },
  // Tuesday 2026-06-02 at 13:00: open, closes at 15:00.
  args: { now: '2026-06-02T13:00:00', weekStart: 1 },
  render: (args) => ({
    props: { ...args, hours: sampleHours, date: new Date(args.now) },
    template: `<lc-opening-hours [hours]="hours" [now]="date" [weekStart]="weekStart" locale="en-US" style="max-width:24rem" />`,
  }),
};
export default meta;

type Story = StoryObj<OpeningHoursArgs>;

export const OpenNow: Story = {};
export const BetweenShifts: Story = { args: { now: '2026-06-02T16:30:00' } };
export const ClosedOvernight: Story = { args: { now: '2026-06-08T10:00:00' } };
export const OpenPastMidnight: Story = { args: { now: '2026-06-06T00:30:00' } };
