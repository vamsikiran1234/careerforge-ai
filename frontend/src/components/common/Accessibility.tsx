import React, { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trap?: boolean;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  autoFocus = false,
  restoreFocus = true,
  trap = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the previously focused element
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

    // Auto focus the first focusable element
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    // Trap focus if enabled
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!trap || !containerRef.current || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          event.preventDefault();
        }
      }
    };

    if (trap) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (trap) {
        document.removeEventListener('keydown', handleKeyDown);
      }

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [autoFocus, restoreFocus, trap]);

  return (
    <div ref={containerRef} className="focus-manager">
      {children}
    </div>
  );
};

// Helper function to get focusable elements
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => {
      const el = element as HTMLElement;
      return (
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        !el.hidden &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    }
  ) as HTMLElement[];
};

// Skip link component for accessibility
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:z-50"
    onFocus={(e) => e.currentTarget.scrollIntoView()}
  >
    {children}
  </a>
);

// Accessible heading component that manages heading hierarchy
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export const Heading: React.FC<HeadingProps> = ({ level, className, children, id }) => {
  const headingProps = { id, className, children };
  
  switch (level) {
    case 1:
      return <h1 {...headingProps} />;
    case 2:
      return <h2 {...headingProps} />;
    case 3:
      return <h3 {...headingProps} />;
    case 4:
      return <h4 {...headingProps} />;
    case 5:
      return <h5 {...headingProps} />;
    case 6:
      return <h6 {...headingProps} />;
    default:
      return <h1 {...headingProps} />;
  }
};

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Announce component for dynamic content updates
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
}> = ({ children, politeness = 'polite', atomic = true }) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    className="sr-only"
  >
    {children}
  </div>
);

export default FocusManager;
