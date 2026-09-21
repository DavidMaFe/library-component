import { toHaveNoViolations } from 'jest-axe';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

expect.extend(toHaveNoViolations);
