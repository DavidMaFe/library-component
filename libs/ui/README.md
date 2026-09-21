# @lc/ui

UI primitives and overlays for the component library.

## Overlay styles

Dialog, tooltip, menu and toast render in the CDK overlay container, which needs a few structural styles. Include them once in your global styles (they are themed with `@lc/tokens`):

```scss
@use '@lc/tokens/styles';
@use '@lc/ui/styles/overlay';
```

## Overlays

```ts
// Dialog: focus trap, Escape, backdrop click, focus restoration
const ref = inject(LcDialog).open(ConfirmDialog, { data });
ref.closed.subscribe((result) => ...);

// Toast
inject(LcToast).success('Order placed');
```

```html
<button lc-button lcTooltip="Delete dish">...</button>

<button lc-button [lcMenuTriggerFor]="menu">Options</button>
<ng-template #menu>
  <lc-menu><button lc-menu-item>Edit</button></lc-menu>
</ng-template>
```

Every component exposes `--lc-<component>-*` custom properties for customization; see the JSDoc of each component.
