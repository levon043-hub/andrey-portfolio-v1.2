/**
 * main.js — инициализация, navbar, scroll-эффекты, IntersectionObserver
 */

'use strict';

/* =============================================
   УТИЛИТЫ
   ============================================= */

/**
 * Ждём полной загрузки DOM
 */
const ready = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

/* =============================================
   NAVBAR — скролл + бургер + активный пункт
   ============================================= */

const initNavbar = () => {
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('burger');
  const navLinks = document.querySelector('.navbar__links');
  const allLinks = document.querySelectorAll('.navbar__links a');

  if (!navbar) return;

  // ── Скролл: добавляем класс .scrolled ──────────────────────
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // проверяем сразу при инициализации

  // ── Бургер-меню ────────────────────────────────────────────
  if (burger && navLinks) {
    // Создаём оверлей
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    document.body.appendChild(overlay);

    const openMenu = () => {
      burger.classList.add('open');
      navLinks.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    };

    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    // Закрываем при клике на ссылку
    allLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Закрываем при клике на оверлей
    overlay.addEventListener('click', closeMenu);

    // Закрываем при нажатии Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ── Активный пункт по IntersectionObserver ─────────────────
  const sections = document.querySelectorAll('section[id]');

  if (sections.length === 0) return;

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Снимаем все активные классы
          allLinks.forEach((link) => link.classList.remove('active'));

          // Ищем ссылку, соответствующую секции
          const activeLink = document.querySelector(
            `.navbar__links a[href="#${entry.target.id}"]`
          );
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    },
    {
      rootMargin: '-30% 0px -65% 0px', // активируем когда верхняя часть секции в зоне
    }
  );

  sections.forEach((section) => navObserver.observe(section));
};

/* =============================================
   SCROLL-REVEAL (IntersectionObserver)
   ============================================= */

const initReveal = () => {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseFloat(el.dataset.delay) || 0;

          // Применяем задержку из data-delay (stagger-эффект)
          if (delay > 0) {
            el.style.transitionDelay = `${delay}s`;
          }

          el.classList.add('is-visible');
          el.classList.add('visible'); // алиас для совместимости

          revealObserver.unobserve(el);
        }
      });
    },
    {
      threshold:  0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
};

/* =============================================
   SMOOTH SCROLL для якорных ссылок
   ============================================= */

const initSmoothScroll = () => {
  const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');

      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top:      targetTop,
        behavior: 'smooth',
      });
    });
  });
};

/* =============================================
   КНОПКА «НАВЕРХ»
   ============================================= */

const initScrollTop = () => {
  // Создаём кнопку программно
  const btn = document.createElement('button');
  btn.className   = 'scroll-top-btn';
  btn.innerHTML   = '↑';
  btn.setAttribute('aria-label', 'Наверх');
  document.body.appendChild(btn);

  // Инжектируем стили
  const style = document.createElement('style');
  style.textContent = `
    .scroll-top-btn {
      position:      fixed;
      bottom:        32px;
      right:         32px;
      z-index:       900;
      width:         44px;
      height:        44px;
      border-radius: 50%;
      background:    var(--color-accent);
      color:         #fff;
      border:        none;
      cursor:        pointer;
      font-size:     18px;
      display:       flex;
      align-items:   center;
      justify-content: center;
      opacity:       0;
      transform:     translateY(16px);
      transition:    var(--transition);
      pointer-events: none;
    }
    .scroll-top-btn.visible {
      opacity:        1;
      transform:      translateY(0);
      pointer-events: auto;
    }
    .scroll-top-btn:hover {
      background:  var(--color-accent-hover);
      transform:   translateY(-3px);
      box-shadow:  0 6px 20px rgba(79,142,247,0.4);
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

/* =============================================
   АНИМАЦИЯ ЧИСЕЛ (счётчики)
   Поддерживает: data-count и data-target
   ============================================= */

const initCounters = () => {
  // Поддерживаем оба атрибута: data-count (trust) и data-target (legacy)
  const counters = document.querySelectorAll('[data-count], [data-target]');
  if (counters.length === 0) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el       = entry.target;
        const target   = parseInt(el.dataset.count ?? el.dataset.target, 10);
        if (isNaN(target)) return;

        const duration = 1500;
        const start    = performance.now();

        const update = (now) => {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const ease     = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        };

        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => counterObserver.observe(el));
};

/* =============================================
   HERO SLIDER — авто-слайдер внутри mockup
   ============================================= */

const initHeroSlider = () => {
  const slider   = document.getElementById('heroSlider');
  const dotsWrap = document.getElementById('heroSliderDots');

  if (!slider) return;

  const slides  = slider.querySelectorAll('.hero__slide');
  const dots    = dotsWrap ? dotsWrap.querySelectorAll('.hero__dot') : [];
  const total   = slides.length;
  let   current = 0;
  let   timer   = null;
  let   paused  = false;

  if (total < 2) return;

  const goTo = (index) => {
    // Снимаем активный класс с текущего
    slides[current].classList.remove('hero__slide--active');
    if (dots[current]) {
      dots[current].classList.remove('hero__dot--active');
      dots[current].setAttribute('aria-selected', 'false');
    }

    // Обновляем индекс
    current = (index + total) % total;

    // Ставим активный
    slides[current].classList.add('hero__slide--active');
    if (dots[current]) {
      dots[current].classList.add('hero__dot--active');
      dots[current].setAttribute('aria-selected', 'true');
    }
  };

  const next = () => goTo(current + 1);

  const startTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused) next();
    }, 2500);
  };

  // Клик по точкам-индикаторам
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide, 10);
      goTo(idx);
      startTimer(); // сброс таймера при ручном переключении
    });
  });

  // Пауза при наведении на mockup
  const mockup = slider.closest('.hero__mockup-wrap');
  if (mockup) {
    mockup.addEventListener('mouseenter', () => { paused = true; });
    mockup.addEventListener('mouseleave', () => { paused = false; });
  }

  // Свайп на тач-устройствах
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startTimer();
    }
  }, { passive: true });

  // Запускаем
  startTimer();
};

/* =============================================
   ГОРИЗОНТАЛЬНЫЙ STICKY-СКРОЛЛ (Portfolio)
   ============================================= */

const initHorizontalScroll = () => {
  const wrapper  = document.getElementById('portfolioWrapper');
  const track    = document.getElementById('portfolioTrack');
  const fill     = document.getElementById('portfolioProgressFill');

  if (!wrapper || !track) return;

  // На мобильных sticky-логика отключена (CSS вернёт обычный вид)
  if (window.matchMedia('(max-width: 768px)').matches) return;

  // prefers-reduced-motion — не трогаем
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const getTotalScroll = () =>
    track.scrollWidth - track.clientWidth - 120; // 120 = суммарный padding

  const setWrapperHeight = () => {
    wrapper.style.height = (window.innerHeight + getTotalScroll()) + 'px';
  };

  const onScroll = () => {
    const scrolled = -wrapper.getBoundingClientRect().top;
    const total    = getTotalScroll();

    if (scrolled < 0 || scrolled > total + window.innerHeight) return;

    const clamped = Math.max(0, Math.min(scrolled, total));
    track.style.transform = `translateX(-${clamped}px)`;

    if (fill) {
      fill.style.width = ((clamped / total) * 100) + '%';
    }
  };

  setWrapperHeight();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { setWrapperHeight(); onScroll(); });
  onScroll();

  // Делаем функцию доступной глобально для filter.js
  window._portfolioResetScroll = () => {
    track.style.transform = 'translateX(0)';
    if (fill) fill.style.width = '0%';
    setWrapperHeight();
  };
};

/* =============================================
   ГЛИТЧ-ЭФФЕКТ ЗАГОЛОВКА
   ============================================= */

const initGlitch = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const title = document.querySelector('.hero__title');
  if (!title) return;

  let timer;

  const triggerGlitch = () => {
    title.classList.add('glitch');
    setTimeout(() => title.classList.remove('glitch'), 350);
    timer = setTimeout(triggerGlitch, 8000 + Math.random() * 3000);
  };

  timer = setTimeout(triggerGlitch, 4000);

  // Останавливаем если страница скрыта (экономия ресурсов)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timer);
    } else {
      timer = setTimeout(triggerGlitch, 2000);
    }
  });
};

/* =============================================
   КАСТОМНЫЙ КУРСОР
   ============================================= */

const initCursor = () => {
  // Не запускаем на мобильных и при prefers-reduced-motion
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (!cursor || !follower) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  // Мгновенное позиционирование основной точки
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Плавное следование кольца (lerp)
  const lerp = (a, b, t) => a + (b - a) * t;

  const animateFollower = () => {
    followerX = lerp(followerX, mouseX, 0.1);
    followerY = lerp(followerY, mouseY, 0.1);
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  };

  requestAnimationFrame(animateFollower);

  // Hover-эффект на интерактивных элементах
  const addHover = () => {
    document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover');
        follower.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        follower.classList.remove('cursor--hover');
      });
    });
  };

  addHover();

  // Скрываем курсор когда мышь уходит из окна
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });
};

/* =============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================= */

/* =============================================
   v1.2 — SPLIT-TEXT REVEAL (hero title)
   ============================================= */

const initSplitText = () => {
  const title = document.querySelector('.hero__title');
  if (!title) return;

  // Trigger the CSS animation by adding class after a short delay
  // (body fade-in takes ~400 ms, start after that)
  setTimeout(() => {
    title.classList.add('splits-ready');
  }, 350);
};

/* =============================================
   v1.2 — MAGNETIC BUTTONS
   ============================================= */

const initMagneticButtons = () => {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const btns = document.querySelectorAll('.btn');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x    = (e.clientX - rect.left - rect.width  / 2) * 0.28;
      const y    = (e.clientY - rect.top  - rect.height / 2) * 0.28;
      btn.style.transition = 'transform 0.12s ease';
      btn.style.transform  = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      btn.style.transform  = '';
    });
  });
};

/* =============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================= */

ready(() => {
  initNavbar();
  initReveal();
  initSmoothScroll();
  initScrollTop();
  initCounters();
  initHeroSlider();
  initHorizontalScroll();
  initCursor();
  initGlitch();
  initSplitText();
  initMagneticButtons();

  console.log('%c Andrey Portfolio v1.2 — initialized ✓', 'color: #4F8EF7; font-weight: bold;');
});

/* Плавное появление страницы после загрузки */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
