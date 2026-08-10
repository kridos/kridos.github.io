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

  elements.forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
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
