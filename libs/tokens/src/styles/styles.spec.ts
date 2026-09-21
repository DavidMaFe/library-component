import * as path from 'node:path';
import * as sass from 'sass';

const compile = (): string =>
  sass.compile(path.join(__dirname, '_index.scss'), { style: 'expanded' }).css;

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

  it('should expose the brand primary scale from 50 to 900', () => {
    const base = declaredTokens(css, /^\s*:root\s*$/);
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
      expect(base).toContain(`--lc-primary-${step}`);
    }
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
