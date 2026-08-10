import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';
import { canUseComplexMotion, prefersReducedMotion } from './motion-utils.js';

gsap.registerPlugin(ScrollTrigger);

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

export function initEducationTimeline(sectionSelector = '#education') {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const milestones = section.querySelectorAll('.timeline-milestone');
  if (milestones.length === 0) return;

  if (!canUseComplexMotion()) {
    milestones.forEach((m) => m.classList.add('is-visible'));
    return;
  }

  gsap.from(milestones, {
    opacity: 0,
    y: 32,
    duration: 0.5,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
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
