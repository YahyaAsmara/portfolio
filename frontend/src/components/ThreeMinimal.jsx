/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Minimal three.js background with a wireframe grid and subtle particles
// Designed to be used as a full-bleed background under content
export default function ThreeMinimal({ accent = '#ffc6a1' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    // Subtle fog for depth
  scene.fog = new THREE.FogExp2(0x0d0a09, 0.06);

    // Wireframe TorusKnot as a focal element
  const wireMat = new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.35 });
    const tkGeo = new THREE.TorusKnotGeometry(3, 0.9, 180, 24, 2, 3);
    const torus = new THREE.Mesh(tkGeo, wireMat);
    torus.position.set(0, 0, -4);
    scene.add(torus);

    // Infinite grid plane (rotated) for Linux/terminal vibe
  const grid = new THREE.GridHelper(200, 200, new THREE.Color(accent), new THREE.Color(accent));
    grid.material.opacity = 0.12;
    grid.material.transparent = true;
    grid.rotation.x = Math.PI / 2; // face camera
    grid.position.z = -18;
    scene.add(grid);

    // Particles field
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const count = Math.floor(900 * (1 + (dpr-1)*0.5));
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      positions[ix] = (Math.random() - 0.5) * 120;
      positions[ix + 1] = (Math.random() - 0.5) * 80;
      positions[ix + 2] = -Math.random() * 120 - 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.05, color: accent, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // Light sweep line
    const lineMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.25 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-60, 0, -12),
      new THREE.Vector3(60, 0, -12),
    ]);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    let raf = 0;
    const clock = new THREE.Clock();
    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    let last = 0;
    const fps = 45; // cap to 45fps for light background
    const interval = 1000 / fps;
    let inView = true;
    const io = new IntersectionObserver(([entry]) => { inView = !!(entry && entry.isIntersecting); }, { threshold: [0, 0.15, 1] });
    io.observe(mount);
    function animate(now = 0) {
      const t = clock.getElapsedTime();
      if (now - last < interval) { raf = requestAnimationFrame(animate); return; }
      last = now;
      if (!inView) { raf = requestAnimationFrame(animate); return; }
      // subtle parallax based on scroll
      const s = Math.min(scrollY / 800, 1);
      camera.position.z = 18 - s * 2.0; // slight zoom out on scroll
      grid.rotation.z = s * 0.15;
      torus.position.y = s * -0.8;
      torus.rotation.x = Math.sin(t * 0.3) * 0.2 + 0.2 + s * 0.2;
      torus.rotation.y = t * 0.25 + s * 0.3;
      line.position.y = Math.sin(t * 0.8) * 3.5;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose();
      wireMat.dispose();
      tkGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      lineMat.dispose();
      lineGeo.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [accent]);

  return (
    <div ref={mountRef} className="absolute inset-0 -z-10" aria-hidden="true" />
  );
}
