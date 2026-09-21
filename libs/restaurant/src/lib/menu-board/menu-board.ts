import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { LcGrid } from '@lc/layout';
import {
  DietaryTag,
  dietaryTagsIn,
  filterSections,
  MenuSection,
} from '../domain/menu';
import { LcDishCard } from '../dish-card/dish-card';
import { LC_RESTAURANT_LABELS } from '../labels/restaurant-labels';
import { uniqueId } from '../shared/unique-id';

/**
 * The full menu: sections of dishes, optional dietary filters and an optional
 * section index. Filter buttons are built from the tags actually present.
 *
 * ```html
 * <lc-menu-board [sections]="sections" currency="EUR" showSectionNav />
 * ```
 *
 * Customize with `--lc-menu-board-gap`.
 */
@Component({
  selector: 'lc-menu-board',
  imports: [LcGrid, LcDishCard],
  templateUrl: './menu-board.html',
  styleUrl: './menu-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcMenuBoard {
  readonly sections = input.required<readonly MenuSection[]>();
  readonly currency = input('EUR');
  readonly locale = input(inject(LOCALE_ID));
  /** Shows dietary filter buttons. */
  readonly filterable = input(true);
  /** Shows a list of buttons that scroll to each section. */
  readonly showSectionNav = input(false);
  /** Minimum width of a dish card. */
  readonly minItemWidth = input('18rem');

  protected readonly labels = inject(LC_RESTAURANT_LABELS);
  readonly #document = inject(DOCUMENT);
  protected readonly uid = uniqueId('lc-menu-board');

  protected readonly activeTags = signal<readonly DietaryTag[]>([]);
  protected readonly availableTags = computed(() =>
    dietaryTagsIn(this.sections()),
  );
  protected readonly visibleSections = computed(() =>
    filterSections(this.sections(), { dietary: this.activeTags() }),
  );
  protected readonly resultCount = computed(() =>
    this.visibleSections().reduce(
      (total, section) => total + section.dishes.length,
      0,
    ),
  );

  protected isActive(tag: DietaryTag): boolean {
    return this.activeTags().includes(tag);
  }

  protected toggleTag(tag: DietaryTag): void {
    this.activeTags.update((tags) =>
      tags.includes(tag)
        ? tags.filter((active) => active !== tag)
        : [...tags, tag],
    );
  }

  protected clearTags(): void {
    this.activeTags.set([]);
  }

  protected sectionId(section: MenuSection): string {
    return `${this.uid}-${section.id}`;
  }

  protected scrollTo(section: MenuSection): void {
    const reduced = this.#document.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    this.#document.getElementById(this.sectionId(section))?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}
