import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { LC_TOAST_CONFIG } from './toast.config';
import { LcToastEntry, LcToastStore } from './toast-store';
import { LcToastAction, LcToastDismissReason } from './toast.types';

/**
 * A single toast. Its timer pauses while hovered or focused, so users have
 * time to read it or reach its action. Internal: use `LcToast`.
 */
@Component({
  selector: 'lc-toast',
  templateUrl: './toast-item.html',
  styleUrl: './toast-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]':
      "entry().variant === 'danger' || entry().variant === 'warning' ? 'alert' : 'status'",
    '[attr.data-variant]': 'entry().variant',
    '(mouseenter)': 'setHovered(true)',
    '(mouseleave)': 'setHovered(false)',
    '(focusin)': 'setFocused(true)',
    '(focusout)': 'setFocused(false)',
  },
})
export class LcToastItem {
  readonly entry = input.required<LcToastEntry>();

  protected readonly config = inject(LC_TOAST_CONFIG);
  readonly #store = inject(LcToastStore);

  #timer: ReturnType<typeof setTimeout> | undefined;
  #remaining = 0;
  #startedAt = 0;
  #hovered = false;
  #focused = false;

  constructor() {
    effect(() => {
      const { duration } = this.entry();
      untracked(() => {
        this.#remaining = duration;
        this.#resume();
      });
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.#timer));
  }

  protected dismiss(reason: LcToastDismissReason): void {
    this.#store.dismiss(this.entry().id, reason);
  }

  protected runAction(action: LcToastAction): void {
    action.handler();
    this.dismiss('action');
  }

  protected setHovered(value: boolean): void {
    this.#hovered = value;
    this.#syncTimer();
  }

  protected setFocused(value: boolean): void {
    this.#focused = value;
    this.#syncTimer();
  }

  #syncTimer(): void {
    if (this.#hovered || this.#focused) this.#pause();
    else this.#resume();
  }

  #resume(): void {
    clearTimeout(this.#timer);
    if (this.#remaining <= 0 || this.#hovered || this.#focused) return;
    this.#startedAt = Date.now();
    this.#timer = setTimeout(() => this.dismiss('timeout'), this.#remaining);
  }

  #pause(): void {
    if (this.#timer === undefined) return;
    clearTimeout(this.#timer);
    this.#timer = undefined;
    this.#remaining = Math.max(
      0,
      this.#remaining - (Date.now() - this.#startedAt),
    );
  }
}
