import * as path from 'node:path';
import * as sass from 'sass';

const compile = (file = '_index.scss'): string =>
  sass.compile(path.join(__dirname, file), { style: 'expanded' }).css;

const declaredTokens = (css: string, selector: RegExp): Set<string> => {
  const tokens = new Set<string>();
  const blocks = css.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, sel, body] of blocks) {
    if (!selector.test(sel)) continue;
    for (const [, name] of body.matchAll(/(--lc-[\w-]+)\s*:/g))
      tokens.add(name);
  }
  return tokens;
};

describe('tokens styles', () => {
  const css = compile();

  it('should define the same semantic color tokens in light and dark themes', () => {
    const light = declaredTokens(css, /data-lc-theme=['"]?light/);
    const dark = declaredTokens(css, /data-lc-theme=['"]?dark/);

    expect(light.size).toBeGreaterThan(0);
    expect([...dark].sort()).toEqual([...light].sort());
  });

  it('should expose the brand primary scale from 50 to 950', () => {
    const base = declaredTokens(css, /^\s*:root\s*$/);
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(base).toContain(`--lc-primary-${step}`);
    }
  });

  it('should expose the brand accent scale from 50 to 950', () => {
    const base = declaredTokens(css, /^\s*:root\s*$/);
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(base).toContain(`--lc-accent-${step}`);
    }
  });

  it('should define the accent, control border and inverse semantic tokens in both themes', () => {
    const light = declaredTokens(css, /data-lc-theme=['"]?light/);
    const dark = declaredTokens(css, /data-lc-theme=['"]?dark/);
    for (const name of [
      '--lc-color-accent',
      '--lc-color-accent-subtle',
      '--lc-color-accent-text',
      '--lc-color-on-accent',
      '--lc-color-border-control',
      '--lc-color-surface-inverse',
      '--lc-color-text-on-inverse',
      '--lc-shadow-lg',
    ]) {
      expect(light).toContain(name);
      expect(dark).toContain(name);
    }
  });

  it('should derive the dark tinted backgrounds from the brand scales', () => {
    // So a brand that overrides its scales also recolors them in dark mode.
    const dark =
      css.match(/\[data-lc-theme=['"]?dark['"]?\]\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(dark).toMatch(/--lc-color-action-subtle:\s*var\(--lc-primary-950\)/);
    expect(dark).toMatch(/--lc-color-accent-subtle:\s*var\(--lc-accent-950\)/);
  });

  it('should expose the heading and extended type scale tokens', () => {
    const base = declaredTokens(css, /^\s*:root\s*$/);
    for (const name of [
      '--lc-font-family-heading',
      '--lc-font-family-mono',
      '--lc-font-weight-heading',
      '--lc-heading-tracking',
      '--lc-font-size-2xs',
      '--lc-font-size-5xl',
    ]) {
      expect(base).toContain(name);
    }
  });

  it('should not mix colors at runtime for the subtle status tokens', () => {
    expect(css).not.toContain('color-mix(');
  });

  it('should not emit utility classes unless the utilities file is used', () => {
    expect(css).not.toContain('.lc-eyebrow');
  });

  it('should provide an opt-in eyebrow utility built on tokens', () => {
    const utilities = compile('_utilities.scss');
    const rule = utilities.match(/\.lc-eyebrow\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(rule).toContain('font-family: var(--lc-font-family-mono)');
    expect(rule).toContain('font-size: var(--lc-font-size-2xs)');
    expect(rule).toContain('text-transform: uppercase');
    expect(rule).toContain('letter-spacing: 0.08em');
    expect(rule).toContain('color: var(--lc-color-text-muted)');
  });

  it('should expose the eyebrow as a mixin through the index', () => {
    const css = sass.compileString(
      `@use 'index' as lc; .kicker { @include lc.lc-eyebrow; }`,
      { loadPaths: [__dirname] },
    ).css;

    expect(css).toMatch(/\.kicker\s*\{[^}]*text-transform: uppercase/);
  });

  it('should expose spacing, radius, typography, shadow, motion and layer tokens', () => {
    const base = declaredTokens(css, /^\s*:root\s*$/);
    for (const name of [
      '--lc-space-4',
      '--lc-radius-md',
      '--lc-font-size-md',
      '--lc-shadow-md',
      '--lc-duration-base',
      '--lc-z-modal',
    ]) {
      expect(base).toContain(name);
    }
  });

  it('should only use the library prefix for custom properties', () => {
    const all = [...css.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name);
    expect(all.filter((name) => !name.startsWith('--lc-'))).toEqual([]);
  });

  it('should disable motion durations when the user prefers reduced motion', () => {
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*--lc-duration-base:\s*0ms/,
    );
  });
});
