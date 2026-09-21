import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { LcSize } from '../shared/ui.types';

export type LcButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Behavior shared by `lc-button` and `lc-icon-button`. */
@Directive({
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-loading]': 'loading() || null',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'inactive() || null',
    '[attr.disabled]': "disabled() && isNativeButton ? '' : null",
  },
})
export abstract class LcButtonBase {
  readonly variant = input<LcButtonVariant>('primary');
  readonly size = input<LcSize>('md');
  /** Disables the control. On anchors it sets `aria-disabled` and blocks clicks. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner and blocks clicks while keeping the control focusable. */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly isNativeButton: boolean;
  protected readonly inactive = computed(
    () => this.disabled() || this.loading(),
  );

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.isNativeButton = element.tagName === 'BUTTON';

    // Capture phase, so the guard runs before any click listener the consumer
    // adds to the same element (host listeners run after template listeners).
    const guard = (event: Event) => {
      if (!this.inactive()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    element.addEventListener('click', guard, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      element.removeEventListener('click', guard, { capture: true }),
    );
  }
}
