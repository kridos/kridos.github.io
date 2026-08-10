import { initHeroScene } from './hero-scene.js';
import { initScrollReveals, initEducationTimeline, initProjectsPinnedReveal } from './scroll-animations.js';
import { initProjects } from './projects.js';
import { initSkills } from './skills.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeroScene(document.getElementById('hero-canvas'));
  initProjects();
  initSkills();
  initEducationTimeline();
  initProjectsPinnedReveal();
  initScrollReveals();
});
