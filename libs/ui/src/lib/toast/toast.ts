import {
  GlobalPositionStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { effect, inject, Injectable } from '@angular/core';
import { uniqueId } from '../shared/unique-id';
import { LC_TOAST_CONFIG } from './toast.config';
import { LcToastOutlet } from './toast-outlet';
import { LcToastEntry, LcToastStore } from './toast-store';
import { Subject } from 'rxjs';
import {
  LcToastDismissReason,
  LcToastOptions,
  LcToastPosition,
  LcToastRef,
} from './toast.types';

type LcToastShortcutOptions = Omit<LcToastOptions, 'message' | 'variant'>;

/**
 * Shows short, non-blocking notifications that disappear on their own.
 *
 * ```ts
 * inject(LcToast).success('Order placed');
 * inject(LcToast).show({ message: 'Dish removed', action: { label: 'Undo', handler: undo } });
 * ```
 *
 * Configure with `provideLcToast()`. Requires the overlay styles:
 * `@use '@lc/ui/styles/overlay';`.
 */
@Injectable({ providedIn: 'root' })
export class LcToast {
  readonly #overlay = inject(Overlay);
  readonly #store = inject(LcToastStore);
  readonly #config = inject(LC_TOAST_CONFIG);
  #overlayRef: OverlayRef | null = null;

  constructor() {
    // Remove the overlay from the DOM once the last toast is gone.
    effect(() => {
      if (this.#store.entries().length === 0) this.#disposeOverlay();
    });
  }

  show(options: LcToastOptions): LcToastRef {
    const entry: LcToastEntry = {
      id: uniqueId('lc-toast'),
      message: options.message,
      title: options.title,
      variant: options.variant ?? 'info',
      duration: options.duration ?? this.#config.duration,
      dismissible: options.dismissible ?? true,
      action: options.action,
      dismissed: new Subject<LcToastDismissReason>(),
    };
    this.#ensureOverlay();
    this.#store.add(entry, this.#config.maxVisible);

    return {
      id: entry.id,
      dismiss: () => this.#store.dismiss(entry.id, 'programmatic'),
      afterDismissed: entry.dismissed.asObservable(),
    };
  }

  info(message: string, options: LcToastShortcutOptions = {}): LcToastRef {
    return this.show({ ...options, message, variant: 'info' });
  }

  success(message: string, options: LcToastShortcutOptions = {}): LcToastRef {
    return this.show({ ...options, message, variant: 'success' });
  }

  warning(message: string, options: LcToastShortcutOptions = {}): LcToastRef {
    return this.show({ ...options, message, variant: 'warning' });
  }

  danger(message: string, options: LcToastShortcutOptions = {}): LcToastRef {
    return this.show({ ...options, message, variant: 'danger' });
  }

  /** Dismisses every visible toast. */
  dismissAll(): void {
    this.#store.dismissAll();
  }

  #ensureOverlay(): void {
    if (this.#overlayRef) return;
    this.#overlayRef = this.#overlay.create({
      positionStrategy: this.#positionStrategy(this.#config.position),
      panelClass: 'lc-toast-overlay',
      disposeOnNavigation: false,
    });
    this.#overlayRef.attach(new ComponentPortal(LcToastOutlet));
  }

  #disposeOverlay(): void {
    this.#overlayRef?.dispose();
    this.#overlayRef = null;
  }

  #positionStrategy(position: LcToastPosition): GlobalPositionStrategy {
    const strategy = this.#overlay.position().global();
    const [vertical, horizontal] = position.split('-') as [
      'top' | 'bottom',
      'left' | 'center' | 'right',
    ];

    if (vertical === 'top') strategy.top('1rem');
    else strategy.bottom('1rem');

    if (horizontal === 'left') strategy.left('1rem');
    else if (horizontal === 'right') strategy.right('1rem');
    else strategy.centerHorizontally();

    return strategy;
  }
}
