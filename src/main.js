import '@fontsource-variable/unbounded';
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/500.css';
import './styles.css';
import { projects, featuredProjectSlugs } from './data/projects.js';
import { initMotion } from './lib/motion.js';
import { initDrawer } from './lib/drawer.js';

const formatProjectButton = (project, index) => `
  <button type="button" aria-pressed="${index === 0}" data-select-project="${project.slug}">
    <span class="project-selector__index">${String(index + 1).padStart(2, '0')}</span>
    <span class="project-selector__title">${project.title}</span>
    <span class="project-selector__type">${project.type}</span>
  </button>`;

const stageTemplate = (project) => `
  <div class="project-stage__window">
    <div class="project-stage__bar" aria-hidden="true"><i></i><i></i><i></i><span>andrey.work / ${project.slug}</span></div>
    <div class="project-stage__image"><img src="${project.poster}" width="1600" height="1000" alt="Экран проекта ${project.title}" /></div>
  </div>
  <div class="project-stage__caption"><div><p>${project.type} · ${project.industry}</p><h3>${project.title}</h3></div><a class="button button--quiet" href="#project/${project.slug}" data-project-link="${project.slug}">Смотреть кейс</a></div>`;

const renderPortfolio = () => {
  const selected = featuredProjectSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean);
  const archive = projects.filter((project) => !featuredProjectSlugs.includes(project.slug));
  const selector = document.querySelector('[data-project-selector]');
  const stage = document.querySelector('[data-project-stage]');
  const archiveRoot = document.querySelector('[data-project-archive]');
  const position = document.querySelector('[data-project-position]');
  const previous = document.querySelector('[data-project-previous]');
  const next = document.querySelector('[data-project-next]');
  let selectedSlug = selected[0]?.slug;
  if (!selector || !stage || !archiveRoot) return;
  selector.innerHTML = selected.map(formatProjectButton).join('');
  archiveRoot.innerHTML = archive.map((project) => `<a class="archive-card" href="#project/${project.slug}" data-project-link="${project.slug}"><img src="${project.poster}" width="1600" height="1000" alt="${project.title}" loading="lazy" /><span>${project.title}</span></a>`).join('');
  const select = (slug) => {
    const project = selected.find((item) => item.slug === slug);
    if (!project) return;
    selectedSlug = slug;
    stage.innerHTML = stageTemplate(project);
    selector.querySelectorAll('[data-select-project]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.selectProject === slug)));
    const index = selected.findIndex((item) => item.slug === slug);
    if (position) position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(selected.length).padStart(2, '0')}`;
    previous?.toggleAttribute('disabled', index === 0);
    next?.toggleAttribute('disabled', index === selected.length - 1);
  };
  selector.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select-project]');
    if (button) select(button.dataset.selectProject);
  });
  previous?.addEventListener('click', () => {
    const current = selected.findIndex((item) => item.slug === selectedSlug);
    if (current > 0) select(selected[current - 1].slug);
  });
  next?.addEventListener('click', () => {
    const active = selector.querySelector('[aria-pressed="true"]')?.dataset.selectProject;
    const current = selected.findIndex((item) => item.slug === active);
    if (current < selected.length - 1) select(selected[current + 1].slug);
  });
  select(selected[0].slug);
};

const initFaq = () => {
  document.querySelector('[data-faq]')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[aria-controls]');
    if (!button) return;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });
};

const initMenu = () => {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  if (!button || !menu) return;
  const mobile = window.matchMedia('(max-width: 900px)');
  const setMenuState = (open) => {
    const isMobile = mobile.matches;
    button.setAttribute('aria-expanded', String(isMobile && open));
    menu.classList.toggle('is-open', isMobile && open);
    menu.toggleAttribute('inert', isMobile && !open);
    if (isMobile && open) menu.querySelector('a')?.focus();
  };
  const close = () => { setMenuState(false); button.focus(); };
  setMenuState(false);
  mobile.addEventListener('change', () => setMenuState(false));
  button.addEventListener('click', () => {
    setMenuState(button.getAttribute('aria-expanded') !== 'true');
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
};

renderPortfolio();
initFaq();
initMenu();
document.querySelector('[data-year]').textContent = new Date().getFullYear();
const destroyMotion = initMotion();
let heroScene;
const shouldLoadHeroScene = !window.matchMedia('(max-width: 899px), (pointer: coarse), (prefers-reduced-motion: reduce)').matches
  && !Boolean((navigator.connection || navigator.mozConnection || navigator.webkitConnection)?.saveData);
if (shouldLoadHeroScene) {
  const loadHeroScene = () => import('./lib/hero-scene.js').then(({ HeroScene }) => {
      heroScene = new HeroScene(document.querySelector('[data-hero-visual]'));
      heroScene.mount();
    }).catch(() => {});
  if ('requestIdleCallback' in window) window.requestIdleCallback(loadHeroScene, { timeout: 1500 });
  else window.setTimeout(loadHeroScene, 350);
}
const destroyDrawer = initDrawer(projects);
window.addEventListener('pagehide', () => { destroyMotion(); destroyDrawer(); heroScene?.dispose(); }, { once: true });
