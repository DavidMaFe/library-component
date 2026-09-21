import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  LcToastAction,
  LcToastDismissReason,
  LcToastVariant,
} from './toast.types';

/** A toast with every default resolved. */
export interface LcToastEntry {
  readonly id: string;
  readonly message: string;
  readonly title: string | undefined;
  readonly variant: LcToastVariant;
  readonly duration: number;
  readonly dismissible: boolean;
  readonly action: LcToastAction | undefined;
  readonly dismissed: Subject<LcToastDismissReason>;
}

/** State shared by the toast service and its outlet. Internal. */
@Injectable({ providedIn: 'root' })
export class LcToastStore {
  readonly #entries = signal<readonly LcToastEntry[]>([]);
  readonly entries = this.#entries.asReadonly();

  add(entry: LcToastEntry, maxVisible: number): void {
    this.#entries.update((entries) => [...entries, entry]);
    const overflow = this.#entries().length - maxVisible;
    for (const oldest of this.#entries().slice(0, Math.max(0, overflow))) {
      this.dismiss(oldest.id, 'overflow');
    }
  }

  dismiss(id: string, reason: LcToastDismissReason): void {
    const entry = this.#entries().find((candidate) => candidate.id === id);
    if (!entry) return;
    this.#entries.update((entries) =>
      entries.filter((candidate) => candidate.id !== id),
    );
    entry.dismissed.next(reason);
    entry.dismissed.complete();
  }

  dismissAll(): void {
    for (const entry of this.#entries()) this.dismiss(entry.id, 'programmatic');
  }
}
