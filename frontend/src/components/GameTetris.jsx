import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Minimal Three.js Tetris (grid + falling tetrominoes). Click to enter to capture keys.

const COLS = 10;
const ROWS = 20;
const SPEED_START = 0.8; // seconds per row

const SHAPES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[1,1,1],[0,1,0]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
};
const COLORS = {
  I: 0x74b0d6,
  O: 0xf59e0b,
  T: 0xa78bfa,
  S: 0x34d399,
  Z: 0xef4444,
  J: 0x60a5fa,
  L: 0xf472b6,
};

function rotate(shape) { // rotate clockwise
  const h = shape.length, w = shape[0].length;
  const res = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) res[x][h-1-y] = shape[y][x];
  return res;
}

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const t = keys[Math.floor(Math.random()*keys.length)];
  return { type: t, shape: SHAPES[t], x: Math.floor(COLS/2)-1, y: 0 };
}

function collides(grid, shape, x, y) {
  for (let sy=0; sy<shape.length; sy++) {
    for (let sx=0; sx<shape[sy].length; sx++) {
      if (!shape[sy][sx]) continue;
      const gx = x + sx, gy = y + sy;
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      if (gy >= 0 && grid[gy][gx]) return true;
    }
  }
  return false;
}

function merge(grid, piece) {
  const { shape, x, y, type } = piece;
  const color = COLORS[type] || 0xffffff;
  for (let sy=0; sy<shape.length; sy++) {
    for (let sx=0; sx<shape[sy].length; sx++) {
      if (shape[sy][sx]) {
        const gx = x + sx, gy = y + sy;
        if (gy>=0 && gy<ROWS && gx>=0 && gx<COLS) grid[gy][gx] = color;
      }
    }
  }
}

function clearLines(grid) {
  let cleared = 0;
  for (let y = ROWS-1; y>=0; y--) {
    if (grid[y].every(v => v)) {
      grid.splice(y,1);
      grid.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
  }
  return cleared;
}

function Grid({ gridRef }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const grid = gridRef.current;
    const children = group.current.children;
    const need = COLS*ROWS;
    while (children.length < need) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.95,0.95,0.95),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 })
      );
      group.current.add(cube);
    }
    let i=0;
    for (let y=0;y<ROWS;y++) {
      for (let x=0;x<COLS;x++) {
        const m = children[i++];
        const filled = !!grid[y][x];
        m.visible = filled;
        if (filled) {
          const col = grid[y][x];
          m.position.set(x - COLS/2 + 0.5, ROWS/2 - y - 0.5, 0);
          m.material.color.setHex(col);
          m.material.emissive = new THREE.Color(col);
          m.material.emissiveIntensity = 0.3;
        }
      }
    }
  });
  return <group ref={group} />;
}

function Piece({ pieceRef }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const p = pieceRef.current; if (!p) return;
    const children = group.current.children;
    // ensure enough cubes
    while (children.length < 16) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.95,0.95,0.95),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.1 })
      );
      group.current.add(cube);
    }
    let i = 0;
    const col = COLORS[p.type] || 0xffffff;
    for (let sy=0; sy<p.shape.length; sy++) {
      for (let sx=0; sx<p.shape[sy].length; sx++) {
        const m = children[i++];
        if (p.shape[sy][sx]) {
          m.visible = true;
          const gx = p.x + sx, gy = p.y + sy;
          m.position.set(gx - COLS/2 + 0.5, ROWS/2 - gy - 0.5, 0);
          m.material.color.setHex(col);
          m.material.emissive = new THREE.Color(col);
          m.material.emissiveIntensity = 0.6;
        } else {
          m.visible = false;
        }
      }
    }
  });
  return <group ref={group} />;
}

export default function GameTetris({ themeKey = 'dark', accent = '#74b0d6' }) {
  const [entered, setEntered] = useState(false);
  const containerRef = useRef(null);
  const gridRef = useRef(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const pieceRef = useRef(randomPiece());
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [speed, setSpeed] = useState(SPEED_START);
  const hudText = themeKey === 'white' ? 'text-card' : 'text-site';
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [hasFocus, setHasFocus] = useState(false);

  const reset = useCallback(() => {
    gridRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    pieceRef.current = randomPiece();
    setScore(0); setOver(false); setSpeed(SPEED_START);
  }, []);

  // gravity
  useEffect(() => {
    const active = entered && !over && !paused && inView;
    if (!active) return;
    const id = setInterval(() => {
      const p = pieceRef.current;
      const nextY = p.y + 1;
      if (!collides(gridRef.current, p.shape, p.x, nextY)) {
        pieceRef.current = { ...p, y: nextY };
      } else {
        // lock
        merge(gridRef.current, p);
        const cleared = clearLines(gridRef.current);
        if (cleared) setScore(s => s + (cleared===1?100:cleared===2?300:cleared===3?500:800));
        const np = randomPiece();
        if (collides(gridRef.current, np.shape, np.x, np.y)) {
          setOver(true);
        } else {
          pieceRef.current = np;
          setSpeed(s => Math.max(0.1, s * 0.98));
        }
      }
    }, speed*1000);
    return () => clearInterval(id);
  }, [entered, over, speed, paused, inView]);

  // controls
  useEffect(() => {
    if (!entered || over || !containerRef.current) return;
    const target = containerRef.current;
    const onKey = (e) => {
      if (!hasFocus) return;
      const p = pieceRef.current;
      // prevent page scroll for handled keys
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','w','s'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === 'p' || e.key === 'P') {
        setPaused((v) => !v);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        const nx = p.x - 1; if (!collides(gridRef.current, p.shape, nx, p.y)) pieceRef.current = { ...p, x: nx };
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        const nx = p.x + 1; if (!collides(gridRef.current, p.shape, nx, p.y)) pieceRef.current = { ...p, x: nx };
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        const r = rotate(p.shape); if (!collides(gridRef.current, r, p.x, p.y)) pieceRef.current = { ...p, shape: r };
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        const ny = p.y + 1; if (!collides(gridRef.current, p.shape, p.x, ny)) pieceRef.current = { ...p, y: ny };
      } else if (e.key === ' ') {
        // hard drop
        let ny = p.y; while (!collides(gridRef.current, p.shape, p.x, ny+1)) ny++;
        pieceRef.current = { ...p, y: ny };
      }
    };
    target.addEventListener('keydown', onKey);
    return () => target.removeEventListener('keydown', onKey);
  }, [entered, over, hasFocus]);

  // focus/blur tracking for container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onFocus = () => setHasFocus(true);
    const onBlur = () => setHasFocus(false);
    el.addEventListener('focusin', onFocus);
    el.addEventListener('focusout', onBlur);
    // initialize
    setHasFocus(document.activeElement === el);
    return () => {
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', onBlur);
    };
  }, []);

  // pause when not in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      const v = entry && entry.isIntersecting && entry.intersectionRatio > 0.25;
      setInView(!!v);
    }, { threshold: [0, 0.25, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // auto-pause when tab hidden
  useEffect(() => {
    const fn = () => { if (document.hidden) setPaused(true); };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  // Board wrapper to anchor bottom to viewport
  function GridLines() {
    // use thin plane strips for thicker grid lines
    const group = useRef();
    const color = themeKey==='white' ? 0x3a3a3a : 0x333333;
    const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }), [color]);
    const bars = useMemo(() => {
      const arr = [];
      const xMin = -COLS/2, xMax = COLS/2;
      const yMin = -ROWS/2, yMax = ROWS/2;
      const thick = 0.05;
      // vertical bars
      for (let x=0; x<=COLS; x++) {
        const xx = xMin + x;
        arr.push({ w: thick, h: ROWS, x: xx, y: 0 });
      }
      // horizontal bars
      for (let y=0; y<=ROWS; y++) {
        const yy = yMax - y;
        arr.push({ w: COLS, h: thick, x: 0, y: yy });
      }
      return arr;
    }, []);
    return (
      <group ref={group} position={[0,0,-0.51]}>
        {bars.map((b, i) => (
          <mesh key={i} position={[b.x, b.y, 0]} material={mat}>
            <planeGeometry args={[b.w, b.h]} />
          </mesh>
        ))}
      </group>
    );
  }

  function Board() {
    const group = useRef();
    const { camera } = useThree();
    useFrame(() => {
      if (!group.current) return;
      const vHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const margin = 0.6; // small breathing room
      const bottomCenter = -ROWS/2 + 0.5;
      const targetBottom = -vHeight/2 + margin;
      const dy = targetBottom - bottomCenter;
      group.current.position.y = dy;
    });
    return (
      <group ref={group}>
        <GridLines />
        <Grid gridRef={gridRef} />
        {!over && <Piece pieceRef={pieceRef} />}
      </group>
    );
  }

  // removed old gridHelper background in favor of precise per-cell lines

  const enterGame = useCallback(() => {
    setEntered(true);
    // focus container to capture keyboard interaction semantics
    if (containerRef.current && containerRef.current.focus) {
      containerRef.current.focus();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="w-full min-h-[100vh] rounded-lg border border-accent-25 bg-black/20 relative overflow-hidden outline-none"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={() => {
        // ensure focus on click anywhere inside
        if (containerRef.current && containerRef.current.focus) containerRef.current.focus();
      }}
    >
      <Canvas camera={{ position: [0, 0, 27], fov: 45 }} dpr={[1,2]}>
        <color attach="background" args={[themeKey==='white' ? '#0a0a0a' : '#000000']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6,9,8]} intensity={0.9} />
        <Board />
      </Canvas>
      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 p-4 md:p-6 flex flex-col">
        <div className={`flex justify-between text-xs md:text-sm ${hudText}`}>
          <div>tetris: arrows/WASD move & rotate · space drops · press P to pause</div>
          <div>score: <span className="font-semibold">{score}</span></div>
        </div>
        {/* Overlays */}
        {!entered && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={enterGame}>
            <button className="btn-accent px-4 py-2 rounded text-sm" onClick={enterGame}>click to enter</button>
          </div>
        )}
        {entered && !over && paused && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className={`${hudText} text-lg mb-2`}>paused</div>
              <button className="btn-accent px-4 py-2 rounded" onClick={() => setPaused(false)}>resume</button>
            </div>
          </div>
        )}
        {over && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <div className={`${hudText} text-lg mb-2`}>game over</div>
              <button className="btn-accent px-4 py-2 rounded" onClick={reset}>restart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
