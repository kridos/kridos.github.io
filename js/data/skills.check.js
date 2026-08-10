import assert from 'node:assert/strict';
import { skillCategories } from './skills.js';

const keys = skillCategories.map((c) => c.key);
assert.equal(new Set(keys).size, keys.length, 'skill category keys must be unique');

const defaultVisibleCount = skillCategories.filter((c) => c.defaultVisible).length;
assert.equal(defaultVisibleCount, 5, 'exactly 5 categories should be visible by default');

for (const cat of skillCategories) {
  assert.ok(cat.skills.length > 0, `category ${cat.key} must have at least one skill`);
  assert.ok(cat.label.length > 0, `category ${cat.key} must have a label`);
  for (const skill of cat.skills) {
    assert.ok(!/%\s*$/.test(skill), `skill "${skill}" in ${cat.key} must not carry a fabricated percentage`);
  }
}

console.log(`skills.check.js: all assertions passed (${skillCategories.length} categories, ${defaultVisibleCount} default-visible)`);
