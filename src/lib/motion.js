import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initMotion = () => {
  const media = gsap.matchMedia();
  const header = document.querySelector('[data-header]');
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  media.add({
    noMotion: '(prefers-reduced-motion: reduce)',
    canAnimate: '(prefers-reduced-motion: no-preference)'
  }, (context) => {
    if (context.conditions.noMotion) return undefined;
    const reveals = gsap.utils.toArray('[data-reveal]');
    gsap.set(reveals, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(reveals, {
      start: 'top 88%',
      once: true,
      onEnter: (elements) => gsap.to(elements, { autoAlpha: 1, y: 0, duration: .72, ease: 'power3.out', stagger: .09, overwrite: 'auto' })
    });
    const stage = document.querySelector('[data-portfolio]');
    if (stage) {
      gsap.fromTo(stage, { y: 44, opacity: .2 }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: stage, start: 'top 79%', once: true }
      });
    }
    return undefined;
  });

  return () => {
    window.removeEventListener('scroll', syncHeader);
    media.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
};
