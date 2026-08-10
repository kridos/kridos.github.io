import assert from 'node:assert/strict';
import { prefersReducedMotion, hasHoverCapability, canUseComplexMotion } from './motion-utils.js';

// jsdom is not available in this dev environment, so stub `window`/`matchMedia`
// directly to verify the decision logic in isolation.
function withMatchMedia(matchesByQuery, fn) {
  global.window = {
    matchMedia(query) {
      return { matches: matchesByQuery[query] ?? false };
    },
  };
  fn();
  delete global.window;
}

withMatchMedia({ '(prefers-reduced-motion: reduce)': true }, () => {
  assert.equal(prefersReducedMotion(), true, 'reduced motion should be detected');
});

withMatchMedia({ '(hover: hover) and (pointer: fine)': true }, () => {
  assert.equal(hasHoverCapability(), true, 'hover capability should be detected');
});

withMatchMedia(
  { '(hover: hover) and (pointer: fine)': true, '(prefers-reduced-motion: reduce)': false },
  () => {
    assert.equal(canUseComplexMotion(), true, 'complex motion allowed when hover-capable and motion not reduced');
  }
);

withMatchMedia(
  { '(hover: hover) and (pointer: fine)': false, '(prefers-reduced-motion: reduce)': false },
  () => {
    assert.equal(canUseComplexMotion(), false, 'complex motion disallowed on touch devices');
  }
);

withMatchMedia(
  { '(hover: hover) and (pointer: fine)': true, '(prefers-reduced-motion: reduce)': true },
  () => {
    assert.equal(canUseComplexMotion(), false, 'complex motion disallowed when reduced motion is enabled, even on capable devices');
  }
);

console.log('motion-utils.check.js: all assertions passed');
