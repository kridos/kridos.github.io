import { skillCategories } from './data/skills.js';
import { canUseComplexMotion } from './motion-utils.js';
import { initTextScramble } from './effects.js';

async function refreshScrollTrigger() {
  if (!canUseComplexMotion()) return;
  try {
    const { default: ScrollTrigger } = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js');
    ScrollTrigger.refresh();
  } catch (err) {
    console.error('ScrollTrigger refresh unavailable:', err);
  }
}

function renderCategory(category, { scrollReveal }) {
  const wrapper = document.createElement('div');
  wrapper.className = scrollReveal ? 'skill-category gsap-reveal' : 'skill-category';
  wrapper.innerHTML = `
    <h3>${category.label}</h3>
    <ul class="skill-pill-list">
      ${category.skills.map((skill) => `<li class="skill-pill">${skill}</li>`).join('')}
    </ul>
  `;
  return wrapper;
}

export function initSkills() {
  const defaultContainer = document.getElementById('skills-categories');
  const moreContainer = document.getElementById('skills-categories-more');
  const toggleBtn = document.getElementById('show-more-skills-btn');

  if (!defaultContainer || !moreContainer || !toggleBtn) return;

  // Default-visible categories are genuinely scroll-discovered (this
  // section sits well below the fold on first load), so they keep the
  // GSAP scroll reveal. The "more" categories live behind a click toggle —
  // same reasoning as the expanded project cards — so they use a plain
  // CSS transition instead (see .skill-category.is-revealed), guaranteed
  // to play regardless of scroll position at toggle time.
  skillCategories.filter((c) => c.defaultVisible).forEach((c) => {
    defaultContainer.appendChild(renderCategory(c, { scrollReveal: true }));
  });

  skillCategories.filter((c) => !c.defaultVisible).forEach((c) => {
    moreContainer.appendChild(renderCategory(c, { scrollReveal: false }));
  });

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    const willExpand = !isExpanded;
    toggleBtn.setAttribute('aria-expanded', String(willExpand));
    moreContainer.hidden = isExpanded;
    toggleBtn.textContent = isExpanded ? 'Show More Skills' : 'Show Fewer Skills';

    if (willExpand) {
      const categories = moreContainer.querySelectorAll('.skill-category');
      categories.forEach((cat) => cat.classList.remove('is-revealed'));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          categories.forEach((cat) => cat.classList.add('is-revealed'));
        });
      });
      initTextScramble('#skills-categories-more .skill-category h3');
    }

    refreshScrollTrigger();
  });
}
