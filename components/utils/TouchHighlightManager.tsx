'use client';

import { useEffect } from 'react';

/**
 * TouchHighlightManager
 * Simulates a subtle hover/highlight focus on touch devices (@media (hover: none))
 * using a single shared IntersectionObserver (rootMargin: -35% 0px -35% 0px).
 * Sets `data-inview="true"` on the single card closest to the viewport center.
 * Mutates attributes directly on DOM nodes — zero React state re-renders.
 */
export function TouchHighlightManager() {
  useEffect(() => {
    // Only activate on devices that do not support fine hover
    if (typeof window === 'undefined') return;
    const isTouchOnly = window.matchMedia('(hover: none)').matches;
    if (!isTouchOnly) return;

    let activeCard: HTMLElement | null = null;
    const intersectingCards = new Set<HTMLElement>();

    const updateClosestCard = () => {
      if (intersectingCards.size === 0) {
        if (activeCard) {
          activeCard.removeAttribute('data-inview');
          activeCard = null;
        }
        return;
      }

      const viewportCenterY = window.innerHeight / 2;
      let closest: HTMLElement | null = null;
      let minDistance = Infinity;

      intersectingCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenterY = rect.top + rect.height / 2;
        const dist = Math.abs(cardCenterY - viewportCenterY);
        if (dist < minDistance) {
          minDistance = dist;
          closest = card;
        }
      });

      if (closest !== activeCard) {
        if (activeCard) {
          activeCard.removeAttribute('data-inview');
        }
        if (closest) {
          (closest as HTMLElement).setAttribute('data-inview', 'true');
          activeCard = closest;
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            intersectingCards.add(target);
          } else {
            intersectingCards.delete(target);
          }
        });
        updateClosestCard();
      },
      {
        rootMargin: '-35% 0px -35% 0px',
      }
    );

    const observeAll = () => {
      const cards = document.querySelectorAll<HTMLElement>('[data-card]');
      cards.forEach((card) => observer.observe(card));
      updateClosestCard();
    };

    observeAll();

    const onScroll = () => {
      if (intersectingCards.size > 1) {
        updateClosestCard();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (activeCard) {
        activeCard.removeAttribute('data-inview');
      }
    };
  }, []);

  return null;
}

