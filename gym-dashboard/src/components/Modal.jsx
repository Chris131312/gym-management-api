import React, { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open modals, innermost last: only the top one reacts to Escape/Tab, so a
// dialog opened from inside another (e.g. delete confirm over the profile
// panel) closes first.
const openModals = [];

let scrollLocks = 0;

/**
 * Accessible modal shell: role="dialog", Escape to close, Tab kept inside,
 * focus moved in on open and restored on close, page scroll locked.
 *
 * `className` replaces the default centered-overlay layout (the profile panel
 * uses it to dock to the right). `isBusy` blocks closing while a request is in
 * flight; `closeOnBackdrop` is opt-in so a stray click can't discard a form.
 */
function Modal({
  onClose,
  label,
  children,
  className = "fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4",
  isBusy = false,
  closeOnBackdrop = false,
}) {
  const rootRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const isBusyRef = useRef(isBusy);

  useEffect(() => {
    onCloseRef.current = onClose;
    isBusyRef.current = isBusy;
  });

  useEffect(() => {
    const root = rootRef.current;
    const previouslyFocused = document.activeElement;
    const token = {};
    openModals.push(token);

    scrollLocks += 1;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Respect an autoFocus inside the dialog; otherwise focus the first control
    if (!root.contains(document.activeElement)) {
      const first = root.querySelector(FOCUSABLE);
      (first || root).focus();
    }

    const onKeyDown = (e) => {
      if (openModals[openModals.length - 1] !== token) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        if (!isBusyRef.current) onCloseRef.current?.();
        return;
      }

      if (e.key === "Tab") {
        const items = [...root.querySelectorAll(FOCUSABLE)].filter(
          (el) => el.offsetParent !== null,
        );
        if (items.length === 0) {
          e.preventDefault();
          root.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openModals.splice(openModals.indexOf(token), 1);
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  const handleBackdropMouseDown = (e) => {
    // Only a press that starts on the backdrop itself, not a drag from inside
    if (closeOnBackdrop && e.target === e.currentTarget && !isBusy) onClose?.();
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className={`${className} outline-none`}
      onMouseDown={closeOnBackdrop ? handleBackdropMouseDown : undefined}
    >
      {children}
    </div>
  );
}

export default Modal;
