import assert from 'node:assert/strict';
import { projects, CATEGORIES } from './projects.js';

const EXCLUDED_SLUGS_OR_URLS = [
  'VTCApp', 'StudyBuddy', 'FitnessApp', 'speakforge', 'MdViewerPrototype',
  'Trace', 'StartupDeveloper', 'gen1-community-hub', 'Connections',
  'Casino', 'MiniMax-Testing', 'Transformer', 'github-projects-playground',
  'action-generator-test', 'github-actions-test', 'OpenCVLearning',
  'complete-guide-to-cpp-programming-foundations-3846057',
  'MusicConversionApp', 'MusicProcessAPI', '/kridos/kridos', 'kridos.github.io',
];

const slugs = projects.map((p) => p.slug);
assert.equal(new Set(slugs).size, slugs.length, 'project slugs must be unique');

const featuredCount = projects.filter((p) => p.featured).length;
assert.equal(featuredCount, 6, 'exactly 6 projects must be marked featured');

const categoryKeys = new Set(CATEGORIES.map((c) => c.key));
for (const p of projects) {
  assert.ok(categoryKeys.has(p.category), `project ${p.slug} has unknown category ${p.category}`);
  assert.ok(p.url.startsWith('https://github.com/kridos/'), `project ${p.slug} url must be a kridos github repo`);
  assert.ok(p.tags.length > 0, `project ${p.slug} must have at least one tag`);
  assert.ok(p.description.length > 20, `project ${p.slug} description looks too short`);
  for (const excluded of EXCLUDED_SLUGS_OR_URLS) {
    assert.ok(!p.url.includes(excluded), `project ${p.slug} url must not reference excluded repo ${excluded}`);
  }
}

console.log(`projects.check.js: all assertions passed (${projects.length} projects, ${featuredCount} featured)`);
