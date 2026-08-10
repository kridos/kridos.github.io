import { projects, CATEGORIES } from './data/projects.js';
import { canUseComplexMotion } from './motion-utils.js';

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-box';
  card.dataset.category = project.category;
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Open ${project.title} on GitHub`);
  card.innerHTML = `
    <div class="project-content">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-tags">
        ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `;
  const openProject = () => window.open(project.url, '_blank', 'noopener');
  card.addEventListener('click', openProject);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProject();
    }
  });

  if (canUseComplexMotion()) {
    let holdTimer = null;
    const startHold = () => {
      holdTimer = window.setTimeout(() => card.classList.add('is-held'), 150);
    };
    const endHold = () => {
      window.clearTimeout(holdTimer);
      card.classList.remove('is-held');
    };
    card.addEventListener('mouseenter', startHold);
    card.addEventListener('mouseleave', endHold);
    card.addEventListener('focus', () => card.classList.add('is-held'));
    card.addEventListener('blur', () => card.classList.remove('is-held'));
  } else {
    card.classList.add('is-held');
  }

  return card;
}

export function initProjects() {
  const featuredContainer = document.getElementById('featured-projects');
  const expandedContainer = document.getElementById('expanded-projects-grid');
  const filtersContainer = document.getElementById('category-filters');
  const viewAllBtn = document.getElementById('view-all-projects-btn');
  const expandedSection = document.getElementById('expanded-projects');

  if (!featuredContainer || !expandedContainer || !viewAllBtn || !expandedSection) return;

  projects.filter((p) => p.featured).forEach((p) => {
    featuredContainer.appendChild(createProjectCard(p));
  });

  const nonFeatured = projects.filter((p) => !p.featured);
  nonFeatured.forEach((p) => {
    const card = createProjectCard(p);
    card.classList.add('gsap-reveal');
    expandedContainer.appendChild(card);
  });

  const allPill = document.createElement('button');
  allPill.className = 'category-filter-pill is-active';
  allPill.type = 'button';
  allPill.textContent = 'All';
  allPill.dataset.category = 'all';
  filtersContainer.appendChild(allPill);

  CATEGORIES.forEach((cat) => {
    if (!nonFeatured.some((p) => p.category === cat.key)) return;
    const pill = document.createElement('button');
    pill.className = 'category-filter-pill';
    pill.type = 'button';
    pill.textContent = cat.label;
    pill.dataset.category = cat.key;
    filtersContainer.appendChild(pill);
  });

  filtersContainer.addEventListener('click', (event) => {
    const pill = event.target.closest('.category-filter-pill');
    if (!pill) return;

    filtersContainer.querySelectorAll('.category-filter-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');

    const category = pill.dataset.category;
    expandedContainer.querySelectorAll('.project-box').forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  });

  viewAllBtn.addEventListener('click', () => {
    const isExpanded = viewAllBtn.getAttribute('aria-expanded') === 'true';
    viewAllBtn.setAttribute('aria-expanded', String(!isExpanded));
    expandedSection.hidden = isExpanded;
    viewAllBtn.textContent = isExpanded ? 'View All Projects' : 'Show Fewer Projects';
  });
}
