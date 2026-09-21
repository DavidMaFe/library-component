import { Observable } from 'rxjs';

export type LcToastVariant = 'info' | 'success' | 'warning' | 'danger';

export type LcToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Why a toast went away. */
export type LcToastDismissReason =
  'timeout' | 'dismiss' | 'action' | 'overflow' | 'programmatic';

export interface LcToastAction {
  readonly label: string;
  readonly handler: () => void;
}

export interface LcToastOptions {
  readonly message: string;
  readonly title?: string;
  readonly variant?: LcToastVariant;
  /** Milliseconds before it disappears; `0` keeps it until dismissed. */
  readonly duration?: number;
  /** Shows a close button. Defaults to `true`. */
  readonly dismissible?: boolean;
  readonly action?: LcToastAction;
}

export interface LcToastConfig {
  readonly position: LcToastPosition;
  /** Default duration in milliseconds. */
  readonly duration: number;
  /** Oldest toasts are dismissed beyond this number. */
  readonly maxVisible: number;
  /** Accessible name of the close button. */
  readonly dismissLabel: string;
  /** Accessible name of the notifications region. */
  readonly regionLabel: string;
}

/** Handle to a visible toast. */
export interface LcToastRef {
  readonly id: string;
  dismiss(): void;
  /** Emits once, with the reason, when the toast goes away. */
  readonly afterDismissed: Observable<LcToastDismissReason>;
}
