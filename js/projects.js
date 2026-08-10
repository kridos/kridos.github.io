import { projects, CATEGORIES } from './data/projects.js';
import { canUseComplexMotion } from './motion-utils.js';
import { initTextScramble } from './effects.js';

const CATEGORY_LABELS = new Map(CATEGORIES.map((c) => [c.key, c.label]));

async function refreshScrollTrigger() {
  if (!canUseComplexMotion()) return;
  try {
    const { default: ScrollTrigger } = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js');
    ScrollTrigger.refresh();
  } catch (err) {
    console.error('ScrollTrigger refresh unavailable:', err);
  }
}

/** Subtle cursor-tracking 3D tilt + spotlight glow, GSAP-driven so it never
 * fights the CSS hover transition (which only touches border-color). */
function attachTiltEffect(card, gsap) {
  const spotlight = card.querySelector('.project-spotlight');
  const rotateX = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
  const rotateY = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });
  const lift = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });

  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY((px - 0.5) * 12);
    rotateX((0.5 - py) * 12);
    if (spotlight) {
      spotlight.style.setProperty('--x', `${px * 100}%`);
      spotlight.style.setProperty('--y', `${py * 100}%`);
    }
  });

  card.addEventListener('mouseenter', () => lift(-4));
  card.addEventListener('mouseleave', () => {
    rotateX(0);
    rotateY(0);
    lift(0);
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-box';
  card.dataset.categories = project.categories.join(' ');
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Open ${project.title} on GitHub`);

  const primaryLabel = CATEGORY_LABELS.get(project.categories[0]) ?? 'Other';

  card.innerHTML = `
    <div class="project-spotlight" aria-hidden="true"></div>
    <div class="project-content">
      <div class="project-category-wrap"><span class="project-category-pill">${primaryLabel}</span></div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    </div>
    <div class="project-tags">
      <div class="project-tag-list">
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

  // Cards render immediately with no dependency on GSAP. The tilt/spotlight
  // effect is attached afterward, once (if) GSAP loads, so a slow or failed
  // CDN fetch only costs the enhancement, never the content.
  projects.filter((p) => p.featured).forEach((p) => {
    featuredContainer.appendChild(createProjectCard(p));
  });

  const nonFeatured = projects.filter((p) => !p.featured);
  // These cards live behind the "View All Projects" toggle, not a scroll
  // discovery — their reveal is a plain CSS class transition (see
  // .project-box.is-revealed in css/projects.css) triggered directly by
  // the click handler below, not gated by ScrollTrigger. A scroll-trigger
  // whose start/end were computed while this grid was `hidden` (zero size)
  // could otherwise leave cards permanently stuck at opacity:0 even once
  // visible and clickable.
  nonFeatured.forEach((p) => {
    expandedContainer.appendChild(createProjectCard(p));
  });

  if (canUseComplexMotion()) {
    import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm')
      .then(({ default: gsap }) => {
        document.querySelectorAll('#featured-projects .project-box, #expanded-projects-grid .project-box')
          .forEach((card) => attachTiltEffect(card, gsap));
      })
      .catch((err) => console.error('GSAP unavailable for project card tilt:', err));
  }

  const allPill = document.createElement('button');
  allPill.className = 'category-filter-pill is-active';
  allPill.type = 'button';
  allPill.textContent = 'All';
  allPill.dataset.category = 'all';
  filtersContainer.appendChild(allPill);

  CATEGORIES.forEach((cat) => {
    if (!nonFeatured.some((p) => p.categories.includes(cat.key))) return;
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
      const cardCategories = card.dataset.categories.split(' ');
      card.hidden = category !== 'all' && !cardCategories.includes(category);
    });
  });

  viewAllBtn.addEventListener('click', () => {
    const isExpanded = viewAllBtn.getAttribute('aria-expanded') === 'true';
    const willExpand = !isExpanded;
    viewAllBtn.setAttribute('aria-expanded', String(willExpand));
    expandedSection.hidden = isExpanded;
    viewAllBtn.textContent = isExpanded ? 'View All Projects' : 'Show Fewer Projects';

    if (willExpand) {
      const cards = expandedContainer.querySelectorAll('.project-box');
      cards.forEach((card) => card.classList.remove('is-revealed'));
      // Double rAF: let the browser paint the opacity:0 starting state
      // (now that `hidden` is gone) before switching the class, so the
      // CSS transition actually plays instead of snapping instantly.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cards.forEach((card) => card.classList.add('is-revealed'));
        });
      });
      initTextScramble('#expanded-projects-grid .project-category-pill, #expanded-projects-grid .project-box h3');
    }

    refreshScrollTrigger();
  });
}
