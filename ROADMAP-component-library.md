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

- [x] modal/dialog, tooltip, dropdown/menu, toast (CDK Overlay)
      Acceptance: focus trap, ESC, navegación por teclado.
      Status: ✅ Completed

## Phase 5: Layout y navegación

- [x] container/grid/stack, navbar, sidebar, tabs, breadcrumb, accordion, pagination
      Acceptance: responsive y navegable por teclado.
      Status: ✅ Completed

## Phase 6: Tabla

- [x] Tabla básica (CDK table): orden, paginación, selección, slots de celda
      Acceptance: celdas y cabeceras personalizables vía templates.
      Status: ✅ Completed

## Phase 7A: Dominio restaurant

- [x] Librería `@lc/restaurant` (dependencias permitidas: ui, forms, layout, core, tokens)
- [x] Dominio puro y testeado: carta/platos (filtros por dieta y alérgenos, formato de precio), horarios (abierto ahora, próximo cambio, cierres, turnos nocturnos), reservas (política, franjas disponibles, validación)
- [x] `lc-dish-card` y `lc-menu-board` (carta con secciones, filtros y navegación)
- [x] `lc-opening-hours` (semana, hoy destacado, estado abierto/cerrado, cierres)
- [x] `lc-reservation-form` (usa `@lc/forms`; emite la reserva, sin backend)
- [x] `lc-photo-gallery` (visor con teclado) y `lc-contact-info`
- [x] Textos traducibles vía `LC_RESTAURANT_LABELS`
      Acceptance: cada componente con tests, jest-axe y stories verificadas en navegador.
      Status: ✅ Completed

## Phase 7B: Dominio ecommerce

- [x] Librería `@lc/ecommerce` (dependencias permitidas: ui, forms, layout, core, tokens)
- [x] Dominio puro y testeado, dinero en enteros de céntimos: `Money` (suma, resta, porcentajes con redondeo, formato por moneda), catálogo (variantes, stock, oferta, rango de precios, filtros y orden), carrito inmutable (líneas, cantidades con tope de stock, cupones, totales con envío gratis e impuestos), checkout (validación de contacto y dirección)
- [x] `lc-product-card` y `lc-product-list` (filtros: búsqueda, categorías, precio, stock, ofertas; orden)
- [x] `lc-product-detail` (galería, selector de variantes con disponibilidad, cantidad, añadir al carrito)
- [x] `lc-quantity-stepper` y `lc-order-summary` (piezas reutilizables)
- [x] `lc-cart` (líneas, cantidades, cupón, resumen)
- [x] `lc-checkout-form` (contacto, dirección, método de envío, resumen; slot `lcCheckoutPayment` para el pago; emite el pedido)
- [x] Textos traducibles vía `LC_ECOMMERCE_LABELS`
      Acceptance: cada componente con tests, jest-axe y stories verificadas en navegador. Sin datos de tarjeta en la librería.
      Status: ✅ Completed

## Phase 7C: Dominio admin

- [ ] Por definir al terminar 7B (tabla avanzada, widgets de dashboard, cabecera de página)
      Status: ⏳ Pending

## Phase final: Publicación

- [ ] Versionado semántico, changelog, publicación npm, documentación
      Status: ⏳ Pending
