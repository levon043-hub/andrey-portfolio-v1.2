/**
 * faq.js — accordion for FAQ section
 */

'use strict';

function initFAQ() {
  const items = document.querySelectorAll('.faq-item__question');
  if (!items.length) return;

  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('faq-item--open');

      // Close all other items
      document.querySelectorAll('.faq-item--open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('faq-item--open');
          openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('faq-item--open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

if (document.readyState !== 'loading') {
  initFAQ();
} else {
  document.addEventListener('DOMContentLoaded', initFAQ);
}
