import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Visual bubble rendered by `lcTooltip`. Not meant to be used directly. */
@Component({
  selector: 'lc-tooltip-panel',
  template: '{{ text() }}',
  styleUrl: './tooltip-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'tooltip' },
})
export class LcTooltipPanel {
  readonly text = input.required<string>();
}
