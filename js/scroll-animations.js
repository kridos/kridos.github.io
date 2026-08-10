import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';
import { canUseComplexMotion, prefersReducedMotion } from './motion-utils.js';

gsap.registerPlugin(ScrollTrigger);

// Late-loading webfonts (or the hero canvas settling into its final size)
// can reflow the page after ScrollTrigger's initial position calculations,
// leaving some trigger zones stale — a card that should be well within
// the "already scrolled past, should be visible" range can end up stuck
// at its initial opacity:0 if its trigger's start/end were computed
// against a shorter/taller page than the final layout. One refresh after
// everything (including fonts and images) has actually finished loading
// recalculates every trigger against the real, settled layout.
window.addEventListener('load', () => ScrollTrigger.refresh());

export function initScrollReveals(selector = '.gsap-reveal') {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  gsap.set(elements, { opacity: 0, y: 24, scale: 0.96 });

  ScrollTrigger.batch(selector, {
    start: 'top 88%',
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        overwrite: true,
      }),
    onLeaveBack: (batch) =>
      gsap.to(batch, {
        opacity: 0,
        y: 24,
        scale: 0.96,
        duration: 0.3,
        overwrite: true,
      }),
  });
}

/**
 * Wipes each section heading in as its own left-to-right clip-path reveal,
 * scrubbed directly to scroll position (not a one-shot trigger) so the
 * reveal visibly tracks the scrollbar rather than firing all at once.
 */
export function initHeadingReveals(selector = '.heading') {
  const headings = document.querySelectorAll(selector);
  if (headings.length === 0) return;

  if (prefersReducedMotion()) return;

  headings.forEach((heading) => {
    gsap.fromTo(
      heading,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0.3 },
      {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: heading,
          start: 'top 92%',
          end: 'top 55%',
          scrub: 0.4,
        },
      }
    );
  });
}

/**
 * Alternating-side timeline entries slide in from their own edge as they
 * reach the viewport, while a gradient line down the center draws itself
 * in sync with scroll progress through the whole section (scrubbed, not
 * one-shot) — the line's fill visibly tracks the scrollbar.
 */
export function initEducationTimeline(sectionSelector = '#education') {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const wraps = section.querySelectorAll('.timeline-milestone-wrap');
  const lineFill = section.querySelector('.timeline-line-fill');
  if (wraps.length === 0) return;

  if (!canUseComplexMotion()) {
    wraps.forEach((w) => w.classList.add('is-visible'));
    return;
  }

  wraps.forEach((wrap, index) => {
    gsap.from(wrap, {
      opacity: 0,
      x: index % 2 === 0 ? -60 : 60,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  if (lineFill) {
    gsap.to(lineFill, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'bottom 70%',
        scrub: 0.6,
      },
    });
  }
}

export function initProjectsPinnedReveal(sectionSelector = '#featured-projects') {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const cards = section.querySelectorAll('.project-box');
  if (cards.length === 0) return;

  if (!canUseComplexMotion()) {
    cards.forEach((c) => c.classList.add('is-visible'));
    return;
  }

  gsap.from(cards, {
    opacity: 0,
    scale: 0.92,
    y: 16,
    duration: 0.4,
    stagger: { each: 0.08, from: 'start', grid: 'auto' },
    ease: 'back.out(1.4)',
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });
}
