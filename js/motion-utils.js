export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasHoverCapability() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function canUseComplexMotion() {
  return hasHoverCapability() && !prefersReducedMotion();
}
