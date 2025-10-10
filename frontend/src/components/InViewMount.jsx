import React, { useEffect, useRef, useState } from 'react';

// Mounts children only when the wrapper is in view (threshold defaults to 0.15)
export default function InViewMount({ children, threshold = 0.15, rootMargin = '0px', unmountOnExit = true, className = '' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      const v = entry && entry.isIntersecting && entry.intersectionRatio >= threshold;
      setInView(!!v);
    }, { threshold: [0, threshold, 1], rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);
  return (
    <div ref={ref} className={className}>
      {inView || !unmountOnExit ? children : null}
    </div>
  );
}
