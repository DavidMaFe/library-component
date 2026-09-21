import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import {
  DEFAULT_RESERVATION_POLICY,
  ReservationRequest,
} from '../domain/reservation';
import { sampleHours } from '../testing/sample-data';
import { LcReservationForm } from './reservation-form';

interface ReservationArgs {
  followOpeningHours: boolean;
  maxPartySize: number;
  submitting: boolean;
}

// `component` is deliberately not set (see the tooltip story).
const meta: Meta<ReservationArgs> = {
  title: 'Restaurant/Reservation form',
  decorators: [moduleMetadata({ imports: [LcReservationForm] })],
  args: { followOpeningHours: true, maxPartySize: 8, submitting: false },
  render: (args) => ({
    props: {
      submitting: args.submitting,
      policy: {
        ...DEFAULT_RESERVATION_POLICY,
        maxPartySize: args.maxPartySize,
        openingHours: args.followOpeningHours ? sampleHours : undefined,
      },
      last: null as ReservationRequest | null,
      received(request: ReservationRequest) {
        (this as { last: ReservationRequest | null }).last = request;
      },
    },
    template: `
      <div style="max-width:40rem">
        <lc-reservation-form [policy]="policy" [submitting]="submitting" (reservation)="received($event)" />
        @if (last) {
          <pre style="margin-top:1rem;padding:1rem;background:var(--lc-color-bg-subtle);border-radius:var(--lc-radius-md)">{{ last | json }}</pre>
        }
      </div>`,
  }),
};
export default meta;

type Story = StoryObj<ReservationArgs>;

/** Only dates and times the restaurant can seat are offered. The form emits the request; it calls no backend. */
export const Default: Story = {};
export const AnyDayWithDefaultHours: Story = {
  args: { followOpeningHours: false },
};
export const Submitting: Story = { args: { submitting: true } };
