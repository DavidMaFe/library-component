import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { LcTooltip, LcTooltipPosition } from './tooltip';

@Component({
  imports: [LcTooltip],
  template: `
    <button
      [lcTooltip]="text()"
      [lcTooltipPosition]="position()"
      [lcTooltipDisabled]="disabled()"
      [lcTooltipShowDelay]="delay()"
    >
      Icon
    </button>
  `,
})
class HostComponent {
  text = signal('Delete dish');
  position = signal<LcTooltipPosition>('top');
  disabled = signal(false);
  delay = signal(300);
}

const panel = () =>
  document.querySelector('lc-tooltip-panel') as HTMLElement | null;

describe('LcTooltip', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    TestBed.tick();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, button };
  };

  const flush = () => {
    TestBed.tick();
  };

  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('showing', () => {
    it('should show after the delay when hovered', () => {
      const { button } = setup();

      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(299);
      expect(panel()).toBeNull();

      jest.advanceTimersByTime(1);
      flush();

      expect(panel()?.textContent).toContain('Delete dish');
      expect(panel()?.getAttribute('role')).toBe('tooltip');
    });

    it('should show immediately on keyboard focus', () => {
      const { button } = setup();

      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      jest.advanceTimersByTime(0);
      flush();

      expect(panel()).not.toBeNull();
    });

    it('should respect a custom delay', () => {
      const { fixture, host, button } = setup();
      host.delay.set(0);
      TestBed.tick();

      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(0);
      flush();

      expect(panel()).not.toBeNull();
    });

    it('should not show when disabled or empty', () => {
      const { fixture, host, button } = setup();
      host.disabled.set(true);
      TestBed.tick();

      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(1000);
      flush();
      expect(panel()).toBeNull();

      host.disabled.set(false);
      host.text.set('  ');
      TestBed.tick();
      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(1000);
      flush();
      expect(panel()).toBeNull();
    });

    it('should show a single tooltip when triggered repeatedly', () => {
      const { button } = setup();

      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(300);
      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(300);
      flush();

      expect(document.querySelectorAll('lc-tooltip-panel')).toHaveLength(1);
    });
  });

  describe('hiding', () => {
    const shown = () => {
      const context = setup();
      context.button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(300);
      flush();
      return context;
    };

    it('should hide when the pointer leaves', () => {
      const { button } = shown();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      jest.advanceTimersByTime(100);

      expect(panel()).toBeNull();
    });

    it('should stay open while the pointer is over the tooltip', () => {
      const { button } = shown();

      button.dispatchEvent(new MouseEvent('mouseleave'));
      panel()?.parentElement?.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(500);
      expect(panel()).not.toBeNull();

      panel()?.parentElement?.dispatchEvent(new MouseEvent('mouseleave'));
      jest.advanceTimersByTime(100);
      expect(panel()).toBeNull();
    });

    it('should hide on Escape', () => {
      const { button } = shown();

      button.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      jest.advanceTimersByTime(0);

      expect(panel()).toBeNull();
    });

    it('should hide when focus leaves', () => {
      const { button } = shown();

      button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      jest.advanceTimersByTime(0);

      expect(panel()).toBeNull();
    });

    it('should hide when it becomes disabled', () => {
      const { fixture, host } = shown();

      host.disabled.set(true);
      TestBed.tick();

      expect(panel()).toBeNull();
    });

    it('should be removed with its host', () => {
      const { fixture } = shown();

      fixture.destroy();

      expect(panel()).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should describe the host with the tooltip text at all times', () => {
      const { button } = setup();

      const id = button.getAttribute('aria-describedby');
      expect(id).toBeTruthy();
      expect(document.getElementById(id as string)?.textContent).toBe(
        'Delete dish',
      );
    });

    it('should update the description when the text changes', () => {
      const { fixture, host, button } = setup();

      host.text.set('Remove dish');
      TestBed.tick();

      const id = button.getAttribute('aria-describedby') as string;
      expect(document.getElementById(id)?.textContent).toBe('Remove dish');
    });

    it('should update the visible text when the text changes', () => {
      const { fixture, host, button } = setup();
      button.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(300);
      flush();

      host.text.set('Remove dish');
      TestBed.tick();
      flush();

      expect(panel()?.textContent).toContain('Remove dish');
    });

    it('should have no accessibility violations while shown', async () => {
      jest.useRealTimers();
      const { button } = setup();
      button.dispatchEvent(new MouseEvent('mouseenter'));
      await new Promise((resolve) => setTimeout(resolve, 350));
      flush();

      expect(panel()).not.toBeNull();
      expect(
        await axe(document.body, { rules: { region: { enabled: false } } }),
      ).toHaveNoViolations();
    });
  });
});
