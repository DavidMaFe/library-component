import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcMenu } from './menu';
import { LcMenuDivider } from './menu-divider';
import { LcMenuItem } from './menu-item';
import { LcMenuTrigger } from './menu-trigger';

@Component({
  imports: [LcMenuTrigger, LcMenu, LcMenuItem, LcMenuDivider],
  template: `
    <button
      id="trigger"
      [lcMenuTriggerFor]="menu"
      (lcMenuOpened)="opened = opened + 1"
      (lcMenuClosed)="closed = closed + 1"
    >
      Options
    </button>
    <ng-template #menu>
      <lc-menu aria-label="Dish options">
        <button lc-menu-item (triggered)="actions.push('edit')">Edit</button>
        <lc-menu-divider />
        <button
          lc-menu-item
          variant="danger"
          (triggered)="actions.push('delete')"
        >
          Delete
        </button>
        <button lc-menu-item disabled (triggered)="actions.push('archive')">
          Archive
        </button>
      </lc-menu>
    </ng-template>
  `,
})
class HostComponent {
  actions: string[] = [];
  opened = 0;
  closed = 0;
}

const settle = async () => {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
};

const menu = () =>
  document.querySelector('[role="menu"]') as HTMLElement | null;
const items = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
const key = (target: Element, name: string, keyCode: number) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      code: name,
      keyCode,
      bubbles: true,
    }),
  );

describe('LcMenu', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector(
      '#trigger',
    ) as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, trigger };
  };

  const opened = async () => {
    const context = await setup();
    context.trigger.click();
    await settle();
    return context;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('opening', () => {
    it('should be closed initially', async () => {
      const { trigger } = await setup();

      expect(menu()).toBeNull();
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('should open when the trigger is clicked', async () => {
      const { host, trigger } = await opened();

      expect(menu()).not.toBeNull();
      expect(items().map((item) => item.textContent?.trim())).toEqual([
        'Edit',
        'Delete',
        'Archive',
      ]);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(host.opened).toBe(1);
    });

    it('should open with ArrowDown from the keyboard', async () => {
      const { trigger } = await setup();

      key(trigger, 'ArrowDown', 40);
      await settle();

      expect(menu()).not.toBeNull();
    });

    it('should render the divider as a separator', async () => {
      await opened();

      expect(
        document.querySelector('lc-menu-divider')?.getAttribute('role'),
      ).toBe('separator');
    });

    it('should reflect the item variant', async () => {
      await opened();

      expect(items()[1].getAttribute('data-variant')).toBe('danger');
    });
  });

  describe('interaction', () => {
    it('should run the action and close when an item is clicked', async () => {
      const { host, trigger } = await opened();

      items()[0].click();
      await settle();

      expect(host.actions).toEqual(['edit']);
      expect(menu()).toBeNull();
      expect(host.closed).toBe(1);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('should not trigger disabled items', async () => {
      const { host } = await opened();
      const archive = items()[2];

      archive.click();
      await settle();

      expect(archive.getAttribute('aria-disabled')).toBe('true');
      expect(host.actions).toEqual([]);
    });

    it('should close with Escape and return focus to the trigger', async () => {
      const { trigger } = await opened();

      key(menu()!, 'Escape', 27);
      await settle();

      expect(menu()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('should close when clicking outside', async () => {
      await opened();

      document.body.click();
      await settle();

      expect(menu()).toBeNull();
    });

    it('should move focus between items with the arrow keys', async () => {
      await opened();
      const [edit, remove] = items();
      edit.focus();

      key(edit, 'ArrowDown', 40);

      expect(document.activeElement).toBe(remove);

      key(remove, 'ArrowUp', 38);

      expect(document.activeElement).toBe(edit);
    });
  });

  it('should have no accessibility violations when open', async () => {
    await opened();

    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
