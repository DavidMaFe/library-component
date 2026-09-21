import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { uniqueId } from '../shared/unique-id';

/**
 * Site header with a brand area, navigation links and an actions area.
 * Below the `md` breakpoint the links collapse behind a menu button.
 *
 * ```html
 * <lc-navbar sticky label="Main">
 *   <a lcNavbarBrand href="/">Trattoria</a>
 *   <a href="/menu">Menu</a>
 *   <a href="/book">Book a table</a>
 *   <button lcNavbarActions>Order</button>
 * </lc-navbar>
 * ```
 *
 * `Escape` closes the open menu and returns focus to the menu button.
 *
 * Customize with `--lc-navbar-bg`, `-color`, `-border-color`, `-height`
 * and `-gap`.
 */
@Component({
  selector: 'lc-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-sticky]': 'sticky() || null',
    '[attr.data-open]': 'open() || null',
    '(keydown.escape)': 'closeWithEscape()',
    '(click)': 'closeOnLinkClick($event)',
  },
})
export class LcNavbar {
  /** Accessible name of the navigation landmark. */
  readonly label = input('Main');
  readonly toggleLabel = input('Toggle menu');
  /** Keeps the navbar at the top while scrolling. */
  readonly sticky = input(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  protected readonly menuId = uniqueId('lc-navbar-menu');
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');
  private readonly toggleButton =
    viewChild<ElementRef<HTMLButtonElement>>('toggleButton');

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  /** Closes the menu after choosing a link inside it. */
  protected closeOnLinkClick(event: Event): void {
    const menu = this.menu()?.nativeElement;
    const target = event.target as Element;
    if (menu?.contains(target) && target.closest('a, button'))
      this.open.set(false);
  }

  protected closeWithEscape(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.toggleButton()?.nativeElement.focus();
  }
}
