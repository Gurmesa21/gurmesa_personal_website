'use client';

import { useEffect } from 'react';

/**
 * TouchHighlightManager
 * Simulates a subtle "hover" focus on touch devices (@media (hover: none))
 * by detecting the card closest to the vertical center of the viewport as the user scrolls,
 * setting `data-inview="true"` on it.
 */
export function TouchHighlightManager() {
  useEffect(() => {
    // Check if device is primarily touch / lacks fine hover
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!isTouch) return;

    let ticking = false;

    const updateHighlight = () => {
      const cards = document.querySelectorAll<HTMLElement>('[data-card]');
      if (!cards.length) return;

      const viewportCenterY = window.innerHeight / 2;
      let closestCard: HTMLElement | null = null;
      let closestDist = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        // Check if card is visible in viewport
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const cardCenterY = rect.top + rect.height / 2;
          const dist = Math.abs(cardCenterY - viewportCenterY);
          if (dist < closestDist) {
            closestDist = dist;
            closestCard = card;
          }
        }
      });

      cards.forEach((card) => {
        if (card === closestCard && closestDist < window.innerHeight * 0.45) {
          card.setAttribute('data-inview', 'true');
        } else {
          card.removeAttribute('data-inview');
        }
      });
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHighlight();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateHighlight();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return null;
}

