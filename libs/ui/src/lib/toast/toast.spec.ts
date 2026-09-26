import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { provideLcToast } from './toast.config';
import { LcToast } from './toast';
import { LcToastDismissReason } from './toast.types';

const flush = () => TestBed.tick();
const toasts = () =>
  Array.from(document.querySelectorAll<HTMLElement>('lc-toast'));
const region = () =>
  document.querySelector('lc-toast-outlet') as HTMLElement | null;

const reasonsOf = (ref: {
  afterDismissed: {
    subscribe: (fn: (r: LcToastDismissReason) => void) => unknown;
  };
}) => {
  const reasons: LcToastDismissReason[] = [];
  ref.afterDismissed.subscribe((reason) => reasons.push(reason));
  return reasons;
};

describe('LcToast', () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('showing', () => {
    it('should render the message and title', () => {
      TestBed.inject(LcToast).show({
        title: 'Saved',
        message: 'Your order was placed.',
      });
      flush();

      expect(toasts()).toHaveLength(1);
      expect(toasts()[0].textContent).toContain('Saved');
      expect(toasts()[0].textContent).toContain('Your order was placed.');
    });

    it('should default to the info variant', () => {
      TestBed.inject(LcToast).show({ message: 'Hello' });
      flush();

      expect(toasts()[0].getAttribute('data-variant')).toBe('info');
    });

    it('should provide shortcuts for each variant', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('a');
      toast.success('b');
      toast.warning('c');
      toast.danger('d');
      flush();

      expect(toasts().map((item) => item.getAttribute('data-variant'))).toEqual(
        ['info', 'success', 'warning', 'danger'],
      );
    });

    it('should draw a different decorative icon for each variant', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('a');
      toast.success('b');
      toast.warning('c');
      toast.danger('d');
      flush();

      const icons = toasts().map((item) => item.querySelector('.icon'));
      expect(
        icons.every((icon) => icon?.getAttribute('aria-hidden') === 'true'),
      ).toBe(true);
      const shapes = icons.map((icon) => icon?.querySelector('svg')?.innerHTML);
      expect(new Set(shapes).size).toBe(4);
    });

    it('should stack several toasts', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('first');
      toast.info('second');
      flush();

      expect(
        toasts().map((item) => item.querySelector('.message')?.textContent),
      ).toEqual(['first', 'second']);
    });

    it('should render one region for all toasts', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('first');
      toast.info('second');
      flush();

      expect(document.querySelectorAll('lc-toast-outlet')).toHaveLength(1);
    });
  });

  describe('accessibility', () => {
    it('should expose a polite, labelled notifications region', () => {
      TestBed.inject(LcToast).info('Hello');
      flush();

      expect(region()?.getAttribute('role')).toBe('region');
      expect(region()?.getAttribute('aria-live')).toBe('polite');
      expect(region()?.getAttribute('aria-label')).toBe('Notifications');
    });

    it('should use the status role for informative toasts and alert for problems', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('a');
      toast.success('b');
      toast.warning('c');
      toast.danger('d');
      flush();

      expect(toasts().map((item) => item.getAttribute('role'))).toEqual([
        'status',
        'status',
        'alert',
        'alert',
      ]);
    });

    it('should use configured labels', () => {
      TestBed.configureTestingModule({
        providers: [
          provideLcToast({ regionLabel: 'Avisos', dismissLabel: 'Cerrar' }),
        ],
      });
      TestBed.inject(LcToast).info('Hola');
      flush();

      expect(region()?.getAttribute('aria-label')).toBe('Avisos');
      expect(
        toasts()[0].querySelector('.close')?.getAttribute('aria-label'),
      ).toBe('Cerrar');
    });

    it('should have no accessibility violations', async () => {
      jest.useRealTimers();
      const toast = TestBed.inject(LcToast);
      toast.success('Order placed', {
        title: 'Done',
        action: { label: 'Undo', handler: () => undefined },
      });
      toast.danger('Payment failed');
      flush();

      expect(await axe(document.body)).toHaveNoViolations();
    });
  });

  describe('dismissing', () => {
    it('should disappear after the default duration', () => {
      const ref = TestBed.inject(LcToast).info('Hello');
      const reasons = reasonsOf(ref);
      flush();

      jest.advanceTimersByTime(4999);
      flush();
      expect(toasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      flush();
      expect(toasts()).toHaveLength(0);
      expect(reasons).toEqual(['timeout']);
    });

    it('should honor a custom duration', () => {
      TestBed.inject(LcToast).info('Hello', { duration: 1000 });
      flush();

      jest.advanceTimersByTime(1000);
      flush();

      expect(toasts()).toHaveLength(0);
    });

    it('should stay until dismissed when the duration is 0', () => {
      TestBed.inject(LcToast).info('Hello', { duration: 0 });
      flush();

      jest.advanceTimersByTime(60_000);
      flush();

      expect(toasts()).toHaveLength(1);
    });

    it('should use the configured default duration', () => {
      TestBed.configureTestingModule({
        providers: [provideLcToast({ duration: 1000 })],
      });
      TestBed.inject(LcToast).info('Hello');
      flush();

      jest.advanceTimersByTime(1000);
      flush();

      expect(toasts()).toHaveLength(0);
    });

    it('should dismiss with the close button', () => {
      const ref = TestBed.inject(LcToast).info('Hello', { duration: 0 });
      const reasons = reasonsOf(ref);
      flush();

      toasts()[0].querySelector<HTMLButtonElement>('.close')?.click();
      flush();

      expect(toasts()).toHaveLength(0);
      expect(reasons).toEqual(['dismiss']);
    });

    it('should hide the close button when not dismissible', () => {
      TestBed.inject(LcToast).info('Hello', { dismissible: false });
      flush();

      expect(toasts()[0].querySelector('.close')).toBeNull();
    });

    it('should dismiss programmatically', () => {
      const ref = TestBed.inject(LcToast).info('Hello', { duration: 0 });
      const reasons = reasonsOf(ref);
      flush();

      ref.dismiss();
      flush();

      expect(toasts()).toHaveLength(0);
      expect(reasons).toEqual(['programmatic']);
    });

    it('should dismiss everything at once', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('a', { duration: 0 });
      toast.info('b', { duration: 0 });
      flush();

      toast.dismissAll();
      flush();

      expect(toasts()).toHaveLength(0);
    });

    it('should ignore dismissing twice', () => {
      const ref = TestBed.inject(LcToast).info('Hello', { duration: 0 });
      const reasons = reasonsOf(ref);
      flush();

      ref.dismiss();
      ref.dismiss();

      expect(reasons).toEqual(['programmatic']);
    });

    it('should dismiss the oldest toasts beyond the maximum', () => {
      TestBed.configureTestingModule({
        providers: [provideLcToast({ maxVisible: 2 })],
      });
      const toast = TestBed.inject(LcToast);
      const first = reasonsOf(toast.info('first', { duration: 0 }));
      toast.info('second', { duration: 0 });
      toast.info('third', { duration: 0 });
      flush();

      expect(first).toEqual(['overflow']);
      expect(
        toasts().map((item) => item.querySelector('.message')?.textContent),
      ).toEqual(['second', 'third']);
    });

    it('should remove the overlay when the last toast goes away', () => {
      const ref = TestBed.inject(LcToast).info('Hello', { duration: 0 });
      flush();
      expect(document.querySelector('.lc-toast-overlay')).not.toBeNull();

      ref.dismiss();
      flush();

      expect(document.querySelector('.lc-toast-overlay')).toBeNull();
    });

    it('should create a new overlay after the previous one was removed', () => {
      const toast = TestBed.inject(LcToast);
      toast.info('a', { duration: 0 }).dismiss();
      flush();

      toast.info('b', { duration: 0 });
      flush();

      expect(toasts()).toHaveLength(1);
    });
  });

  describe('action', () => {
    it('should run the handler and dismiss', () => {
      const handler = jest.fn();
      const ref = TestBed.inject(LcToast).show({
        message: 'Dish removed',
        duration: 0,
        action: { label: 'Undo', handler },
      });
      const reasons = reasonsOf(ref);
      flush();

      const action = toasts()[0].querySelector<HTMLButtonElement>('.action');
      expect(action?.textContent).toContain('Undo');
      action?.click();
      flush();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(toasts()).toHaveLength(0);
      expect(reasons).toEqual(['action']);
    });

    it('should not render an action button without an action', () => {
      TestBed.inject(LcToast).info('Hello');
      flush();

      expect(toasts()[0].querySelector('.action')).toBeNull();
    });
  });

  describe('pausing', () => {
    it('should pause the timer while hovered and resume with the remaining time', () => {
      TestBed.inject(LcToast).info('Hello', { duration: 1000 });
      flush();

      jest.advanceTimersByTime(600);
      toasts()[0].dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(5000);
      flush();
      expect(toasts()).toHaveLength(1);

      toasts()[0].dispatchEvent(new MouseEvent('mouseleave'));
      jest.advanceTimersByTime(399);
      flush();
      expect(toasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      flush();
      expect(toasts()).toHaveLength(0);
    });

    it('should pause while focused and stay paused if still hovered', () => {
      TestBed.inject(LcToast).info('Hello', { duration: 1000 });
      flush();
      const item = toasts()[0];

      item.dispatchEvent(new MouseEvent('mouseenter'));
      item.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      item.dispatchEvent(new MouseEvent('mouseleave'));
      jest.advanceTimersByTime(5000);
      flush();
      expect(toasts()).toHaveLength(1);

      item.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      jest.advanceTimersByTime(1000);
      flush();
      expect(toasts()).toHaveLength(0);
    });
  });
});
