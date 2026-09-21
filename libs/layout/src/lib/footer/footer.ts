import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Page footer (`contentinfo` landmark) with a main area and a legal strip.
 *
 * ```html
 * <lc-footer>
 *   <p>Trattoria Rossi · Via Roma 1</p>
 *   <small lcFooterLegal>© 2026 Trattoria Rossi</small>
 * </lc-footer>
 * ```
 *
 * Customize with `--lc-footer-bg`, `-color`, `-border-color` and `-padding`.
 */
@Component({
  selector: 'lc-footer',
  template: `
    <footer>
      <div class="content"><ng-content /></div>
      <div class="legal"><ng-content select="[lcFooterLegal]" /></div>
    </footer>
  `,
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LcFooter {}
