import { AriaDescriber } from '@angular/cdk/a11y';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  booleanAttribute,
  ComponentRef,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { LcTooltipPanel } from './tooltip-panel';

export type LcTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const OFFSET = 8;
const HIDE_DELAY = 100;

const POSITIONS: Record<LcTooltipPosition, ConnectedPosition[]> = {
  top: [
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -OFFSET,
    },
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: OFFSET,
    },
  ],
  bottom: [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: OFFSET,
    },
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -OFFSET,
    },
  ],
  left: [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -OFFSET,
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: OFFSET,
    },
  ],
  right: [
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: OFFSET,
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -OFFSET,
    },
  ],
};

/**
 * Shows a short text on hover and keyboard focus.
 *
 * ```html
 * <button lc-icon-button label="Delete" lcTooltip="Delete dish" lcTooltipPosition="bottom">...</button>
 * ```
 *
 * The text is exposed to assistive technology as the element's description,
 * can be dismissed with `Escape` and stays open while hovered. Use it for
 * supplementary information only, never for essential content.
 *
 * Customize with `--lc-tooltip-bg`, `-color`, `-radius`, `-max-width`,
 * `-padding-x` and `-padding-y`.
 */
@Directive({
  selector: '[lcTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show(0)',
    '(focusout)': 'hide(0)',
    '(keydown.escape)': 'hide(0)',
  },
})
export class LcTooltip {
  /** Tooltip text. An empty text disables the tooltip. */

  readonly text = input('', { alias: 'lcTooltip' });

  readonly position = input<LcTooltipPosition>('top', {
    alias: 'lcTooltipPosition',
  });
  /** Milliseconds to wait before showing on hover. */

  readonly showDelay = input(300, {
    alias: 'lcTooltipShowDelay',
    transform: numberAttribute,
  });

  readonly disabled = input(false, {
    alias: 'lcTooltipDisabled',
    transform: booleanAttribute,
  });

  readonly #overlay = inject(Overlay);
  readonly #describer = inject(AriaDescriber);
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  #overlayRef: OverlayRef | null = null;
  #panel: ComponentRef<LcTooltipPanel> | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #described: string | null = null;

  constructor() {
    effect(() => {
      const text = this.text().trim();
      this.#syncDescription(text);
      this.#panel?.setInput('text', text);
      if (!text || this.disabled()) this.#dispose();
    });

    inject(DestroyRef).onDestroy(() => {
      this.#dispose();
      this.#syncDescription('');
    });
  }

  /** Shows the tooltip after `delay` milliseconds (defaults to `showDelay`). */
  show(delay = this.showDelay()): void {
    this.#clearTimer();
    if (this.disabled() || !this.text().trim()) return;
    this.#timer = setTimeout(() => this.#attach(), delay);
  }

  /** Hides the tooltip after `delay` milliseconds. */
  hide(delay = HIDE_DELAY): void {
    this.#clearTimer();
    this.#timer = setTimeout(() => this.#dispose(), delay);
  }

  #attach(): void {
    if (this.#overlayRef) return;

    const positionStrategy = this.#overlay
      .position()
      .flexibleConnectedTo(this.#element)
      .withPositions(POSITIONS[this.position()])
      .withPush(true);
    this.#overlayRef = this.#overlay.create({
      positionStrategy,
      scrollStrategy: this.#overlay.scrollStrategies.reposition(),
    });
    this.#panel = this.#overlayRef.attach(new ComponentPortal(LcTooltipPanel));
    this.#panel.setInput('text', this.text().trim());

    // Hoverable: moving the pointer onto the tooltip keeps it open.
    const pane = this.#overlayRef.overlayElement;
    pane.addEventListener('mouseenter', () => this.#clearTimer());
    pane.addEventListener('mouseleave', () => this.hide());
  }

  #dispose(): void {
    this.#clearTimer();
    this.#overlayRef?.dispose();
    this.#overlayRef = null;
    this.#panel = null;
  }

  #clearTimer(): void {
    clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #syncDescription(text: string): void {
    if (this.#described === text) return;
    if (this.#described)
      this.#describer.removeDescription(this.#element, this.#described);
    this.#described = text || null;
    if (text) this.#describer.describe(this.#element, text);
  }
}
