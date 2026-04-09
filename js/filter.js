/**
 * filter.js — фильтрация карточек портфолио по категориям
 */

'use strict';

const initPortfolioFilter = () => {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.portfolio-card');

  if (buttons.length === 0 || cards.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Снимаем active у всех кнопок
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      // Ставим active на нажатую
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const categories = card.dataset.category || '';
        const matches    = filter === 'all' || categories.includes(filter);

        if (matches) {
          card.classList.remove('hidden');
          // Небольшая задержка для stagger эффекта
          requestAnimationFrame(() => {
            card.classList.add('fade-in');
            setTimeout(() => card.classList.remove('fade-in'), 400);
          });
        } else {
          card.classList.add('hidden');
          card.classList.remove('fade-in');
        }
      });

      // Сброс горизонтального скролла и пересчёт высоты обёртки
      if (typeof window._portfolioResetScroll === 'function') {
        requestAnimationFrame(window._portfolioResetScroll);
      }
    });
  });
};

if (document.readyState !== 'loading') {
  initPortfolioFilter();
} else {
  document.addEventListener('DOMContentLoaded', initPortfolioFilter);
}
