import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { LcTab } from './tab';

/**
 * Tabbed content. Arrow keys, `Home` and `End` move between tabs and select
 * them; disabled tabs are skipped.
 *
 * ```html
 * <lc-tabs label="Menu sections" [(selectedIndex)]="index">
 *   <lc-tab label="Starters">...</lc-tab>
 *   <lc-tab label="Mains">...</lc-tab>
 * </lc-tabs>
 * ```
 *
 * Customize with `--lc-tabs-indicator-color`, `-color`, `-color-active`,
 * `-border-color` and `-panel-padding`.
 */
@Component({
  selector: 'lc-tabs',
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcTabs {
  /** Accessible name of the tab list. */
  readonly label = input('');
  readonly selectedIndex = model(0);

  protected readonly tabs = contentChildren(LcTab);
  private readonly buttons =
    viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  /** The selected index, moved to the first enabled tab when it is invalid or disabled. */
  protected readonly index = computed(() => {
    const tabs = this.tabs();
    const wanted = this.selectedIndex();
    if (tabs[wanted] && !tabs[wanted].disabled()) return wanted;
    return Math.max(
      0,
      tabs.findIndex((tab) => !tab.disabled()),
    );
  });

  constructor() {
    effect(() => {
      const index = this.index();
      this.tabs().forEach((tab, position) =>
        tab.active.set(position === index),
      );
    });
  }

  protected select(index: number): void {
    this.selectedIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent, from: number): void {
    const target = this.#targetIndex(event.key, from);
    if (target === null) return;
    event.preventDefault();
    this.select(target);
    this.buttons()[target]?.nativeElement.focus();
  }

  #targetIndex(key: string, from: number): number | null {
    const tabs = this.tabs();
    const enabled = tabs
      .map((tab, index) => (tab.disabled() ? -1 : index))
      .filter((i) => i >= 0);
    if (enabled.length === 0) return null;

    const position = enabled.indexOf(from);
    switch (key) {
      case 'ArrowRight':
        return enabled[(position + 1) % enabled.length];
      case 'ArrowLeft':
        return enabled[(position - 1 + enabled.length) % enabled.length];
      case 'Home':
        return enabled[0];
      case 'End':
        return enabled[enabled.length - 1];
      default:
        return null;
    }
  }
}
