import { canUseComplexMotion, prefersReducedMotion } from './motion-utils.js';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

function scrambleText(el, finalText, duration = 700) {
  const steps = Math.max(finalText.length * 3, 15);
  const revealAt = Array.from(finalText).map((_, i) => Math.floor((i / finalText.length) * steps * 0.7) + steps * 0.3);
  let frame = 0;

  const timer = window.setInterval(() => {
    frame += 1;
    let out = '';
    for (let i = 0; i < finalText.length; i += 1) {
      if (finalText[i] === ' ' || frame >= revealAt[i]) {
        out += finalText[i];
      } else {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = out;
    if (frame >= steps) {
      el.textContent = finalText;
      window.clearInterval(timer);
    }
  }, duration / steps);
}

/**
 * Terminal-style scramble-decode for short labels (category pills, skill
 * headers) as they enter the viewport. Deliberately not reused on the
 * hero, which already has its own typing effect.
 */
export function initTextScramble(selector) {
  const targets = document.querySelectorAll(selector);
  if (targets.length === 0 || prefersReducedMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        scrambleText(entry.target, entry.target.dataset.scrambleText ?? entry.target.textContent);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  targets.forEach((el) => {
    el.dataset.scrambleText = el.textContent;
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
