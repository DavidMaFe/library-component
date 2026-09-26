# @lc/tokens

Design tokens for the component library, exposed as CSS custom properties (prefix `--lc-`) and shipped as Sass partials.

## Setup

```scss
// global styles.scss (once per application)
@use '@lc/tokens/styles';
```

### Fonts

The Lienzo identity uses three variable fonts. The library only names them in `--lc-font-family-*` (with system fallbacks); it never loads them, so the application decides whether and how to ship them:

```bash
npm i @fontsource-variable/bricolage-grotesque @fontsource-variable/instrument-sans @fontsource-variable/geist-mono
```

```json
// angular.json / project.json → build.options.styles
"styles": [
  "@fontsource-variable/bricolage-grotesque/opsz.css",
  "@fontsource-variable/instrument-sans/index.css",
  "@fontsource-variable/geist-mono/index.css",
  "src/styles.scss"
]
```

| Token                      | Font                | Use                                                                                    |
| -------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `--lc-font-family-heading` | Bricolage Grotesque | Headings, prices (weight `--lc-font-weight-heading`, tracking `--lc-heading-tracking`) |
| `--lc-font-family-base`    | Instrument Sans     | Body text, labels, buttons                                                             |
| `--lc-font-family-mono`    | Geist Mono          | Eyebrows and tabular data (times, SKUs, IDs)                                           |

Then let `ThemeService` (from `@lc/core`) manage the theme. It sets `data-lc-theme="light|dark"` on `<html>`, follows the OS by default and persists the choice.

## Token tiers

1. **Palette** (`--lc-neutral-*`, `--lc-primary-*`, `--lc-accent-*`): raw values.
2. **Semantic** (`--lc-color-bg`, `--lc-color-text`, `--lc-color-action`...): defined per theme from the palette. **Components only consume this tier**.
3. **Scales** (`--lc-space-*`, `--lc-radius-*`, `--lc-font-*`, `--lc-shadow-*`, `--lc-duration-*`, `--lc-z-*`): theme independent.

## Rebranding

A brand overrides at most the `--lc-primary-*` (action) and `--lc-accent-*` (highlight) scales, `--lc-font-family-heading`, `--lc-font-weight-heading` and `--lc-radius-sm|md|lg|xl`. That is enough to rebrand every component, in both themes. Keep `primary-600` at 4.5:1 with white and `primary-300` at 4.5:1 with `--lc-neutral-950` (dark theme); `accent-400` at 4.5:1 with `--lc-neutral-950` and `accent-700` at 4.5:1 on white.

### At build time (CSS)

```css
:root {
  --lc-primary-600: #b45309;
  --lc-radius-md: 0.125rem;
  --lc-font-family-heading: Georgia, serif;
}
```

### At runtime

```ts
inject(ThemeService).applyBrand({
  '--lc-primary-600': '#b45309',
  '--lc-radius-md': '0.125rem',
});
inject(ThemeService).clearBrand();
```

### Scoped (a section of the page)

Any element can define its own theme or overrides:

```html
<section data-lc-theme="dark" style="--lc-primary-600: #15803d">...</section>
```

## Eyebrow

The eyebrow (mono, 11px, uppercase, tracked, muted) labels sections, table headers, data labels and steps. Use the mixin in component styles:

```scss
@use '@lc/tokens/styles' as lc;

.kicker {
  @include lc.lc-eyebrow;
}
```

Or opt in to the global `.lc-eyebrow` class once:

```scss
@use '@lc/tokens/styles/utilities';
```

```html
<p class="lc-eyebrow">Starters · 06</p>
```

## Breakpoints

CSS variables cannot be used in media queries, so breakpoints are a Sass map:

```scss
@use '@lc/tokens/styles' as lc;

.grid {
  @include lc.lc-up('md') {
    grid-template-columns: 1fr 1fr;
  }
}
```

Override the map with `@use '@lc/tokens/styles' with ($lc-breakpoints: (...))`.
