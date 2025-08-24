import { useEffect, useRef } from 'react';

/**
 * Minimal IntersectionObserver-based fade-in hook.
 * - Adds `fade-in-on-scroll` class initially
 * - Toggles `is-visible` when element intersects
 * - Respects reduced motion via CSS (.reduce-motion)
 */
export function useScrollFadeIn<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add('fade-in-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default useScrollFadeIn;
