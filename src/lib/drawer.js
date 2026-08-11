const projectTemplate = (project) => `
  <article class="drawer-project">
    <div class="drawer-project__media"><img src="${project.poster}" width="1600" height="1000" alt="Экран проекта ${project.title}" /></div>
    <div class="drawer-project__details">
      <p class="drawer-project__eyebrow">Коммерческий проект</p>
      <h2 id="drawer-title">${project.title}</h2>
      <p>${project.description}</p>
      <ul class="drawer-meta">
        <li><span>Формат</span><b>${project.type}</b></li>
        <li><span>Отрасль</span><b>${project.industry}</b></li>
        <li><span>Роль</span><b>${project.role}</b></li>
        <li><span>Статус</span><b>Коммерческий проект</b></li>
      </ul>
      <a class="button button--primary" href="https://t.me/andrworkk" target="_blank" rel="noopener noreferrer">Обсудить похожий проект</a>
    </div>
  </article>`;

export const initDrawer = (projects) => {
  const drawer = document.querySelector('[data-drawer]');
  const content = document.querySelector('[data-drawer-content]');
  const closeButton = document.querySelector('[data-drawer-close]');
  if (!drawer || !content) return () => {};
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  let origin = null;
  let syncingHash = false;
  const returnToPortfolio = () => {
    const portfolio = document.querySelector('#portfolio');
    portfolio?.scrollIntoView({ block: 'start' });
    portfolio?.focus({ preventScroll: true });
  };

  const close = (fromHistory = false) => {
    if (!drawer.open) return;
    const shouldReturn = !fromHistory && location.hash.startsWith('#project/');
    syncingHash = fromHistory;
    if (shouldReturn) {
      history.pushState(null, '', '#portfolio');
      drawer.close();
      returnToPortfolio();
      return;
    }
    drawer.close();
  };

  const open = (slug, trigger = null, writeHash = true) => {
    const project = bySlug.get(slug);
    if (!project) return;
    origin = trigger || document.activeElement;
    content.innerHTML = projectTemplate(project);
    if (!drawer.open) drawer.showModal();
    if (writeHash && location.hash !== `#project/${slug}`) history.pushState(null, '', `#project/${slug}`);
    closeButton.focus();
  };

  const syncFromHash = () => {
    const match = location.hash.match(/^#project\/([a-z0-9-]+)$/);
    if (match && bySlug.has(match[1])) open(match[1], null, false);
    else close(true);
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-project-link]');
    if (!link) return;
    event.preventDefault();
    open(link.dataset.projectLink, link);
  });
  closeButton.addEventListener('click', () => close());
  drawer.addEventListener('click', (event) => { if (event.target === drawer) close(); });
  drawer.addEventListener('close', () => {
    const shouldReturnToPortfolio = !syncingHash && location.hash.startsWith('#project/');
    if (shouldReturnToPortfolio) {
      history.replaceState(null, '', '#portfolio');
      returnToPortfolio();
    }
    syncingHash = false;
    if (!shouldReturnToPortfolio && origin?.matches?.('[data-project-link]')) origin.focus();
  });
  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
  return () => window.removeEventListener('hashchange', syncFromHash);
};
