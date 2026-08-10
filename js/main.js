import { initHeroScene } from './hero-scene.js';
import { initProjects } from './projects.js';
import { initSkills } from './skills.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeroScene(document.getElementById('hero-canvas'));
  initProjects();
  initSkills();

  // scroll-animations.js does a top-level CDN import of GSAP/ScrollTrigger.
  // Load it dynamically so a failed CDN fetch only degrades scroll-motion
  // features instead of blanking the content rendered above.
  import('./scroll-animations.js')
    .then(({ initEducationTimeline, initProjectsPinnedReveal, initScrollReveals }) => {
      initEducationTimeline();
      initProjectsPinnedReveal();
      initScrollReveals();
    })
    .catch((err) => console.error('Scroll animations unavailable:', err));
});
