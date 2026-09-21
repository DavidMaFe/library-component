import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LC_DIALOG_DATA, LcDialog } from './dialog';
import { LcDialogClose } from './dialog-close';
import { LcDialogPanel } from './dialog-panel';

@Component({
  imports: [LcDialogPanel, LcDialogClose],
  template: `
    <lc-dialog-panel heading="Delete dish?" [dismissible]="dismissible">
      Remove {{ data?.name }} from the menu?
      <div lcDialogActions>
        <button id="cancel" [lcDialogClose]="false">Cancel</button>
        <button id="confirm" [lcDialogClose]="true">Delete</button>
        <button id="plain" lcDialogClose>Plain</button>
      </div>
    </lc-dialog-panel>
  `,
})
class ConfirmDialog {
  data = inject<{ name: string } | null>(LC_DIALOG_DATA, { optional: true });
  dismissible = true;
}

@Component({ template: '<button id="opener">Open</button>' })
class HostComponent {}

const settle = async () => {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
};

const query = <T extends Element>(selector: string) =>
  document.querySelector(selector) as T | null;

const pressEscape = () =>
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true,
    }),
  );

describe('LcDialog', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const opener = fixture.nativeElement.querySelector(
      '#opener',
    ) as HTMLButtonElement;
    opener.focus();
    const dialog = TestBed.inject(LcDialog);
    return { fixture, opener, dialog };
  };

  afterEach(() => {
    TestBed.inject(LcDialog).closeAll();
    document.body.innerHTML = '';
  });

  describe('opening', () => {
    it('should render a modal dialog labelled by its heading', async () => {
      const { dialog } = await setup();

      dialog.open(ConfirmDialog);
      await settle();

      const container = query<HTMLElement>('[role="dialog"]');
      expect(container).not.toBeNull();
      expect(container?.getAttribute('aria-modal')).toBe('true');
      const heading = query<HTMLElement>('lc-dialog-panel h2');
      expect(heading?.textContent).toContain('Delete dish?');
      expect(container?.getAttribute('aria-labelledby')).toBe(heading?.id);
    });

    it('should show a backdrop', async () => {
      const { dialog } = await setup();

      dialog.open(ConfirmDialog);
      await settle();

      expect(query('.cdk-overlay-backdrop')).not.toBeNull();
    });

    it('should pass data to the dialog', async () => {
      const { dialog } = await setup();

      dialog.open(ConfirmDialog, { data: { name: 'Carbonara' } });
      await settle();

      expect(query('lc-dialog-panel')?.textContent).toContain(
        'Remove Carbonara from the menu?',
      );
    });

    it('should move focus inside the dialog', async () => {
      const { dialog } = await setup();

      dialog.open(ConfirmDialog);
      await settle();

      expect(query('[role="dialog"]')?.contains(document.activeElement)).toBe(
        true,
      );
    });

    it('should keep the dialog open when opened without close options', async () => {
      const { dialog } = await setup();

      const ref = dialog.open(ConfirmDialog);
      await settle();

      expect(ref.componentInstance).toBeInstanceOf(ConfirmDialog);
      expect(query('[role="dialog"]')).not.toBeNull();
    });
  });

  describe('closing', () => {
    it('should close with Escape and restore focus to the opener', async () => {
      const { dialog, opener } = await setup();
      dialog.open(ConfirmDialog);
      await settle();

      pressEscape();
      await settle();

      expect(query('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(opener);
    });

    it('should close when the backdrop is clicked', async () => {
      const { dialog } = await setup();
      dialog.open(ConfirmDialog);
      await settle();

      query<HTMLElement>('.cdk-overlay-backdrop')?.click();
      await settle();

      expect(query('[role="dialog"]')).toBeNull();
    });

    it('should not close with Escape or backdrop when disableClose is set', async () => {
      const { dialog } = await setup();
      dialog.open(ConfirmDialog, { disableClose: true });
      await settle();

      pressEscape();
      query<HTMLElement>('.cdk-overlay-backdrop')?.click();
      await settle();

      expect(query('[role="dialog"]')).not.toBeNull();
    });

    it('should close with the header close button', async () => {
      const { dialog } = await setup();
      dialog.open(ConfirmDialog);
      await settle();

      query<HTMLButtonElement>('lc-dialog-panel .close')?.click();
      await settle();

      expect(query('[role="dialog"]')).toBeNull();
    });

    it('should hide the close button when not dismissible', async () => {
      const { dialog } = await setup();
      const ref = dialog.open(ConfirmDialog);
      const instance = ref.componentInstance;
      if (instance) instance.dismissible = false;
      await settle();

      expect(query('lc-dialog-panel')).not.toBeNull();
      expect(query('lc-dialog-panel .close')).toBeNull();
    });

    it('should hide the header close button when disableClose is set', async () => {
      const { dialog } = await setup();
      dialog.open(ConfirmDialog, { disableClose: true });
      await settle();

      expect(query('lc-dialog-panel')).not.toBeNull();
      expect(query('lc-dialog-panel .close')).toBeNull();
    });

    it('should resolve with the value of the clicked lcDialogClose button', async () => {
      const { dialog } = await setup();
      const ref = dialog.open<boolean>(ConfirmDialog);
      const result = new Promise((resolve) => ref.closed.subscribe(resolve));
      await settle();

      query<HTMLButtonElement>('#confirm')?.click();

      await expect(result).resolves.toBe(true);
    });

    it('should resolve with false for the cancel button', async () => {
      const { dialog } = await setup();
      const ref = dialog.open<boolean>(ConfirmDialog);
      const result = new Promise((resolve) => ref.closed.subscribe(resolve));
      await settle();

      query<HTMLButtonElement>('#cancel')?.click();

      await expect(result).resolves.toBe(false);
    });

    it('should resolve with undefined when lcDialogClose has no value', async () => {
      const { dialog } = await setup();
      const ref = dialog.open(ConfirmDialog);
      const result = new Promise((resolve) => ref.closed.subscribe(resolve));
      await settle();

      query<HTMLButtonElement>('#plain')?.click();

      await expect(result).resolves.toBeUndefined();
    });

    it('should not submit forms from lcDialogClose buttons', async () => {
      const { dialog } = await setup();
      dialog.open(ConfirmDialog);
      await settle();

      expect(query('#confirm')?.getAttribute('type')).toBe('button');
    });

    it('should close every dialog with closeAll', async () => {
      const { dialog } = await setup();
      dialog.open(ConfirmDialog);
      dialog.open(ConfirmDialog);
      await settle();
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);

      dialog.closeAll();
      await settle();

      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    });
  });

  it('should have no accessibility violations', async () => {
    const { dialog } = await setup();
    dialog.open(ConfirmDialog);
    await settle();

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
