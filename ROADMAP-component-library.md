# Feature: Librería de componentes Angular genérica

## Overview

Librería de componentes Angular (standalone + signals) desacoplada y personalizable al máximo para webs de restaurantes/negocios, ecommerce y paneles de administración.

Decisiones: monorepo Nx · theming con CSS variables (design tokens) + SCSS · Angular CDK como única dependencia · MVP en fundamentos y primitivos.

Estructura objetivo: `libs/{tokens,core,ui,forms,layout,restaurant,ecommerce,admin}` + `apps/showcase`.
Reglas de dependencia: `restaurant|ecommerce|admin → ui|forms|layout → core|tokens`.

## Phase 0: Setup

- [x] Crear workspace Nx con Angular (TS estricto)
- [x] ESLint + Prettier + `enforce-module-boundaries`
- [x] Generar libs `tokens`, `core`, `ui`, `forms`, `layout` + app `showcase`
- [x] Configurar tests (Jest + Testing Library)
- [x] Configurar Storybook (lib `ui`)
- [x] CI básico y convención de commits
      Acceptance: `nx build`, `nx test` y `nx lint` pasan en todas las libs.
      Status: ✅ Completed

## Phase 1: Tokens y theming

- [x] Tokens (color, tipografía, espaciado, radios, sombras, motion)
- [x] Temas claro/oscuro con CSS variables
- [x] `ThemeService` en `core`
- [x] Guía de override por marca
      Acceptance: cambiar de tema en runtime en el showcase sin recompilar.
      Status: ✅ Completed

## Phase 2: Primitivos básicos

- [x] button, icon-button, badge, card, spinner, divider (tests + stories)
      Acceptance: variantes/tamaños vía inputs, personalizables por tokens, a11y verificada.
      Status: ✅ Completed

## Phase 3: Formularios

- [x] input, textarea, select, checkbox, radio, switch, form-field
- [x] ControlValueAccessor + Reactive Forms
      Acceptance: validación y mensajes de error accesibles.
      Status: ✅ Completed

## Phase 4: Overlays y feedback

- [ ] modal/dialog, tooltip, dropdown/menu, toast (CDK Overlay)
      Acceptance: focus trap, ESC, navegación por teclado.
      Status: 🚧 In Progress

## Phase 5: Layout y navegación

- [ ] container/grid/stack, navbar, sidebar, tabs, breadcrumb, accordion, pagination
      Acceptance: responsive y navegable por teclado.
      Status: ⏳ Pending

## Phase 6: Tabla

- [ ] Tabla básica (CDK table): orden, paginación, selección, slots de celda
      Acceptance: celdas y cabeceras personalizables vía templates.
      Status: ⏳ Pending

## Phase 7+: Dominios

- [ ] `restaurant` → `ecommerce` → `admin` (una librería cada una)
      Status: ⏳ Pending

## Phase final: Publicación

- [ ] Versionado semántico, changelog, publicación npm, documentación
      Status: ⏳ Pending
