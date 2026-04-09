/**
 * tilt.js — 3D tilt-эффект карточек портфолио ([data-tilt])
 * Только на устройствах с hover (не тач)
 */

'use strict';

const initTilt = () => {
  // Только на устройствах с мышью
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) *  6;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform   = '';
      card.style.transition  = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
};

if (document.readyState !== 'loading') {
  initTilt();
} else {
  document.addEventListener('DOMContentLoaded', initTilt);
}
