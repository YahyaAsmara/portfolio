import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useAnimation } from 'motion/react';
import './RollingGallery.css';

import calgary from './assets/calgary.jpg';
import skies1 from './assets/skies1.jpg';
import skies2 from './assets/skies2.jpg';
import mountain from './assets/mountain.jpg';
import mountain2 from './assets/mountain2.jpg';
import seat1 from './assets/seat1.jpg';

// Interactive 3D cylinder gallery with drag + wheel + optional autoplay
// API-compatible: <RollingGallery autoplay={true} pauseOnHover={true} />
export default function RollingGallery({ autoplay = false, pauseOnHover = true, images }) {
  const imgs = useMemo(() => images && images.length ? images : [skies1, skies2, mountain, mountain2, calgary, seat1], [images]);
  // Dates removed per request – keeping the API simple
  const tilts = useMemo(() => {
    // deterministic small tilt between -3 and +3 degrees per item
    const hash = (str) => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }
      return Math.abs(h >>> 0);
    };
    return imgs.map((src, i) => {
      const v = hash(String(src) + ':' + i);
      const n = (v % 600) / 100 - 3; // -3 to +3
      return n;
    });
  }, [imgs]);
  const [isSm, setIsSm] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  const rotation = useMotionValue(0);
  const controls = useAnimation();
  const autoRef = useRef(null);

  const cylinderWidth = isSm ? 900 : 1400;
  const faceCount = imgs.length;
  const faceWidth = (cylinderWidth / faceCount) * 1.6;
  const dragFactor = 0.05;
  const radius = (cylinderWidth / (2 * Math.PI)) * 0.8;

  useEffect(() => {
    const onResize = () => setIsSm(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onDrag = (_, info) => {
    rotation.set(rotation.get() + info.offset.x * dragFactor);
  };
  const onDragEnd = (_, info) => {
    const faceAngle = 360 / faceCount;
    const predicted = rotation.get() + info.velocity.x * dragFactor;
    const snapped = Math.round(predicted / faceAngle) * faceAngle;
    controls.start({ rotateY: snapped, transition: { type: 'spring', stiffness: 80, damping: 18, mass: 0.12 } });
    rotation.set(snapped);
  };
  const onWheel = (e) => {
    const deltaRaw = e.deltaY || e.deltaX || 0;
    const delta = Math.max(-80, Math.min(80, deltaRaw));
    const next = rotation.get() + delta * 0.02;
    const faceAngle = 360 / faceCount;
    const snapped = Math.round(next / faceAngle) * faceAngle;
    rotation.set(snapped);
    controls.start({ rotateY: snapped, transition: { duration: 0.25, ease: 'easeOut' } });
  };

  useEffect(() => {
    if (!autoplay) return;
    const step = () => {
      controls.start({ rotateY: rotation.get() - 360 / faceCount, transition: { duration: 2, ease: 'linear' } });
      rotation.set(rotation.get() - 360 / faceCount);
    };
    autoRef.current = setInterval(step, 2200);
    return () => clearInterval(autoRef.current);
  }, [autoplay, rotation, controls, faceCount]);

  const onMouseEnter = () => { if (autoplay && pauseOnHover) { clearInterval(autoRef.current); controls.stop(); } };
  const onMouseLeave = () => {
    if (autoplay && pauseOnHover) {
      clearInterval(autoRef.current);
      autoRef.current = setInterval(() => {
        controls.start({ rotateY: rotation.get() - 360 / faceCount, transition: { duration: 2, ease: 'linear' } });
        rotation.set(rotation.get() - 360 / faceCount);
      }, 2200);
    }
  };

  // keep rotation within [0, 360) visually to avoid losing precision
  useEffect(() => {
    const unsub = rotation.on('change', (v) => {
      if (!Number.isFinite(v)) return;
      if (v > 360 || v < -360) {
        const wrapped = ((v % 360) + 360) % 360;
        rotation.set(wrapped);
      }
    });
    return () => unsub?.();
  }, [rotation]);

  return (
    <div className="gallery-container" onWheel={onWheel}>
      <div className="gallery-gradient gallery-gradient-left"></div>
      <div className="gallery-gradient gallery-gradient-right"></div>
      <div className="gallery-content">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="gallery-track"
          style={{ rotateY: rotation, x: 0, width: cylinderWidth, transformStyle: 'preserve-3d' }}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          animate={controls}
        >
          {imgs.map((src, i) => (
            <div
              key={i}
              className="gallery-item"
              style={{ width: `${faceWidth}px`, transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)` }}
            >
              <div className="polaroid" style={{ transform: `rotate(${tilts[i]}deg)` }}>
                <img src={src} alt="gallery" className="polaroid-img" loading="lazy" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
