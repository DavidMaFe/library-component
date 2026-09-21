import { isLcTokenName } from './token-name';

describe('isLcTokenName', () => {
  it('should accept names with the library prefix', () => {
    expect(isLcTokenName('--lc-primary-600')).toBe(true);
  });

  it('should reject names without the library prefix', () => {
    expect(isLcTokenName('--other-primary')).toBe(false);
    expect(isLcTokenName('color')).toBe(false);
  });

  it('should reject the bare prefix', () => {
    expect(isLcTokenName('--lc-')).toBe(false);
  });
});
