# @lc/tokens

Design tokens for the component library, exposed as CSS custom properties (prefix `--lc-`) and shipped as Sass partials.

## Setup

```scss
// global styles.scss (once per application)
@use '@lc/tokens/styles';
```

Then let `ThemeService` (from `@lc/core`) manage the theme. It sets `data-lc-theme="light|dark"` on `<html>`, follows the OS by default and persists the choice.

## Token tiers

1. **Palette** (`--lc-neutral-*`, `--lc-primary-*`, status colors): raw values.
2. **Semantic** (`--lc-color-bg`, `--lc-color-text`, `--lc-color-action`...): defined per theme from the palette. **Components only consume this tier**.
3. **Scales** (`--lc-space-*`, `--lc-radius-*`, `--lc-font-*`, `--lc-shadow-*`, `--lc-duration-*`, `--lc-z-*`): theme independent.

## Rebranding

Overriding the `--lc-primary-*` scale is enough to rebrand every component, in both themes.

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
