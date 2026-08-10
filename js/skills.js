import { skillCategories } from './data/skills.js';
import { canUseComplexMotion } from './motion-utils.js';

async function refreshScrollTrigger() {
  if (!canUseComplexMotion()) return;
  try {
    const { default: ScrollTrigger } = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js');
    ScrollTrigger.refresh();
  } catch (err) {
    console.error('ScrollTrigger refresh unavailable:', err);
  }
}

function renderCategory(category) {
  const wrapper = document.createElement('div');
  wrapper.className = 'skill-category gsap-reveal';
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

  skillCategories.filter((c) => c.defaultVisible).forEach((c) => {
    defaultContainer.appendChild(renderCategory(c));
  });

  skillCategories.filter((c) => !c.defaultVisible).forEach((c) => {
    moreContainer.appendChild(renderCategory(c));
  });

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    moreContainer.hidden = isExpanded;
    toggleBtn.textContent = isExpanded ? 'Show More Skills' : 'Show Fewer Skills';
    refreshScrollTrigger();
  });
}
