import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { prefersReducedMotion } from './motion-utils.js';

export function initHeroScene(canvas) {
  if (!canvas || prefersReducedMotion()) {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const NODE_COUNT = 90;
  const positions = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.05, transparent: true, opacity: 0.85 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const linkGeometry = new THREE.BufferGeometry();
  const linkMaterial = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.12 });
  const linkPositions = [];
  const LINK_DISTANCE = 2.2;
  for (let i = 0; i < NODE_COUNT; i += 1) {
    for (let j = i + 1; j < NODE_COUNT; j += 1) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < LINK_DISTANCE) {
        linkPositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        linkPositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  linkGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPositions), 3));
  const links = new THREE.LineSegments(linkGeometry, linkMaterial);
  scene.add(links);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onPointerMove);

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }
  window.addEventListener('resize', resize);
  resize();

  let frameId;
  function animate() {
    points.rotation.y += 0.0006;
    links.rotation.y = points.rotation.y;
    points.rotation.x += (pointer.y * 0.15 - points.rotation.x) * 0.02;
    links.rotation.x = points.rotation.x;
    points.rotation.y += (pointer.x * 0.05) * 0.01;
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  }
  animate();

  return function dispose() {
    cancelAnimationFrame(frameId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', resize);
    geometry.dispose();
    linkGeometry.dispose();
    material.dispose();
    linkMaterial.dispose();
    renderer.dispose();
  };
}
