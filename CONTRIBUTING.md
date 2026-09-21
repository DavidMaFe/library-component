# Contributing

## Requirements

- Node 22 (`nvm use 22`), npm 10+

## Commands

- `npx nx run-many -t lint test build` — validate everything
- `npx nx storybook ui` — component playground
- `npx nx serve showcase` — demo app

## Architecture

Library dependency rules (enforced by `@nx/enforce-module-boundaries`):

`showcase → ui | forms | layout → core → tokens`

`ui`, `forms` and `layout` may depend on `core` and `tokens` only. Domain libraries (`restaurant`, `ecommerce`, `admin`) will be added later and may depend on `ui | forms | layout | core | tokens`.

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`

- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`
- Scope: the library or app name (`ui`, `forms`, `tokens`, `showcase`...)
- Breaking changes: `feat(ui)!:` or a `BREAKING CHANGE:` footer
- One focused change per commit
