'use client';
import { RefObject, useEffect, useRef } from 'react';
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  enabled = true,
) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-modal', 'true');
    node.setAttribute('tabindex', '-1');
    const heading = node.querySelector('h2,h3');
    node.setAttribute('aria-label', heading?.textContent || 'Dialog');
    const focusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length > 0);
    (focusable()[0] || node).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close.current();
      }
      if (event.key !== 'Tab') return;
      const items = focusable(),
        first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        node.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          !node.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !node.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [ref, enabled]);
}
