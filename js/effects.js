import { canUseComplexMotion, prefersReducedMotion } from './motion-utils.js';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

/**
 * Time-based (not frame-count-based) so it always terminates correctly
 * regardless of how often the browser actually schedules callbacks. A
 * setInterval/frame-counter version was tried first and left titles stuck
 * mid-scramble in exactly the two ways reported: sometimes never settling,
 * sometimes not firing at all — because a throttled or busy tab (heavy
 * WebGL/GSAP activity) delays or coalesces interval ticks, so the frame
 * counter never reaches its target. Driving off elapsed wall-clock time
 * instead means every callback recomputes the correct progress no matter
 * how much real time actually passed since the last one, so it always
 * reaches 100% and settles.
 */
function scrambleText(el, finalText, duration = 700) {
  const chars = Array.from(finalText);
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    let out = '';
    for (let i = 0; i < chars.length; i += 1) {
      const revealAt = 0.3 + (i / chars.length) * 0.7;
      out += chars[i] === ' ' || progress >= revealAt
        ? chars[i]
        : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = finalText;
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Terminal-style scramble-decode for short labels (category pills, skill
 * headers, project titles) as they enter the viewport. Deliberately not
 * reused on the hero, which already has its own typing effect.
 *
 * Safe to call more than once with overlapping selectors (e.g. once at
 * page load for everything already visible, again for a specific grid
 * right after a "View All" / "Show More" toggle reveals it) — each
 * element scrambles at most once, tracked via `dataset.scrambled`, so a
 * second call never double-fires or re-triggers settled text.
 */
export function initTextScramble(selector) {
  if (prefersReducedMotion()) return;
  const targets = document.querySelectorAll(selector);
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        if (el.dataset.scrambled === 'true') return;
        el.dataset.scrambled = 'true';
        scrambleText(el, el.dataset.scrambleText ?? el.textContent);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el) => {
    if (el.dataset.scrambled === 'true') return;
    if (!el.dataset.scrambleText) el.dataset.scrambleText = el.textContent;
    observer.observe(el);
  });
}

/**
 * A soft ambient glow that trails the cursor across dark sections outside
 * the hero, using GSAP quickTo for smooth lag instead of an instant snap.
 */
export function initCursorGlow() {
  if (!canUseComplexMotion()) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm')
    .then(({ default: gsap }) => {
      const moveX = gsap.quickTo(glow, 'x', { duration: 0.7, ease: 'power3.out' });
      const moveY = gsap.quickTo(glow, 'y', { duration: 0.7, ease: 'power3.out' });
      window.addEventListener('pointermove', (event) => {
        moveX(event.clientX);
        moveY(event.clientY);
      });
    })
    .catch((err) => {
      console.error('GSAP unavailable for cursor glow:', err);
      glow.remove();
    });
}
