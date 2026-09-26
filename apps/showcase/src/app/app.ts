import { Component, computed, inject, signal } from '@angular/core';
import { LcThemePreference, ThemeService } from '@lc/core';
import { SHOWCASE_BRANDS } from './brands';

@Component({
  selector: 'lc-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly brands = SHOWCASE_BRANDS;
  protected readonly preferences: readonly LcThemePreference[] = [
    'light',
    'dark',
    'system',
  ];
  protected readonly activeBrandId = signal(SHOWCASE_BRANDS[0].id);

  protected readonly colorTokens = [
    'bg',
    'bg-subtle',
    'surface',
    'surface-raised',
    'border',
    'text',
    'text-muted',
    'action',
    'action-hover',
    'action-subtle',
    'accent',
    'accent-subtle',
    'accent-text',
    'border-control',
    'surface-inverse',
    'success',
    'warning',
    'danger',
    'info',
  ];
  protected readonly spaceTokens = ['1', '2', '3', '4', '6', '8', '12'];
  protected readonly radiusTokens = ['sm', 'md', 'lg', 'xl', 'full'];
  protected readonly shadowTokens = ['sm', 'md', 'lg'];
  protected readonly fontSizeTokens = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
  ];
  /** Steps shared by the primary and accent scales. */
  protected readonly primaryScale = [
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    '950',
  ];

  protected readonly themeLabel = computed(
    () =>
      `${this.themeService.theme()} (preference: ${this.themeService.preference()})`,
  );

  protected selectBrand(id: string): void {
    const brand = this.brands.find((candidate) => candidate.id === id);
    if (!brand) return;
    this.activeBrandId.set(brand.id);
    this.themeService.applyBrand(brand.overrides);
  }
}
