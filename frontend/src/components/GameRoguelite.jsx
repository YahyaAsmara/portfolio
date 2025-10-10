import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Minimal procedural texture generator
function makeCardTexture(label, seed = 1, dark = false) {
  const rng = mulberry32(seed);
  const w = 256, h = 384; // 2:3 card ratio
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  // Background gradient
  const hue = Math.floor(rng() * 360);
  const g = ctx.createLinearGradient(0, 0, w, h);
  if (dark) {
    g.addColorStop(0, `hsl(${hue}, 60%, 25%)`);
    g.addColorStop(1, `hsl(${(hue+40)%360}, 60%, 18%)`);
  } else {
    g.addColorStop(0, `hsl(${hue}, 70%, 65%)`);
    g.addColorStop(1, `hsl(${(hue+40)%360}, 70%, 55%)`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Overlay geometric lines
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(rng()*w, 0);
    ctx.lineTo(rng()*w, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Center icon (simple polygon)
  const cx = w/2, cy = h/2;
  const rad = Math.min(w, h) * 0.18;
  const sides = 5 + Math.floor(rng()*3);
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
  ctx.beginPath();
  for (let i=0;i<sides;i++){
    const a = (i/sides)*Math.PI*2 + rng()*0.3;
    const r = rad*(0.85 + rng()*0.25);
    ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
  }
  ctx.closePath();
  ctx.fill();

  // Label
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)';
  ctx.font = '600 28px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, h - 24);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Card types and effects
const CARD_POOL = [
  { key: 'spark', label: 'Spark', effect: (s) => ({ ...s, score: s.score + 3, log: '+3' }) },
  { key: 'gem', label: 'Gem', effect: (s) => ({ ...s, score: s.score + 5, log: '+5' }) },
  { key: 'void', label: 'Void', effect: (s) => ({ ...s, score: Math.max(0, s.score - 2), log: '-2' }) },
  { key: 'boost', label: 'Boost', effect: (s) => ({ ...s, bonus: s.bonus + 1, log: 'Bonus +1' }) },
  { key: 'x2', label: 'x2', effect: (s) => ({ ...s, mult: 2, log: 'Next x2' }) },
];

function pickCard(rng) {
  return CARD_POOL[Math.floor(rng() * CARD_POOL.length)];
}

function Card({ texture, position, onClick }) {
  const ref = useRef();
  const glow = useRef();
  const baseY = 0;
  useFrame((_, dt) => {
    if (!ref.current) return;
    const t = performance.now() * 0.001;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.12);
    ref.current.rotation.x = Math.sin(t + position[0]) * 0.03;
    // idle float
    ref.current.position.y = Math.sin(t*1.5 + position[0]) * 0.03;
  });
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerOver={() => {
          ref.current.rotation.y = 0.35;
          ref.current.scale.set(1.04, 1.04, 1.04);
          if (glow.current) glow.current.material.opacity = 0.22;
        }}
        onPointerOut={() => {
          ref.current.rotation.y = 0;
          ref.current.scale.set(1, 1, 1);
          if (glow.current) glow.current.material.opacity = 0.12;
        }}
      >
        <planeGeometry args={[1.2, 1.8, 1, 1]} />
        <meshStandardMaterial map={texture} roughness={0.4} metalness={0.05} />
      </mesh>
      {/* accent glow */}
      <mesh ref={glow} position={[0, 0, -0.02]}>
        <planeGeometry args={[1.26, 1.86]} />
        <meshBasicMaterial color={0x74b0d6} transparent opacity={0.12} />
      </mesh>
      {/* subtle shadow */}
      <mesh position={[0, -0.95, -0.03]} rotation-x={-Math.PI/2}>
        <planeGeometry args={[1.0, 1.6]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function Scene({ state, playCard, darkCards }) {
  const { size } = useThree();
  useFrame(() => {});
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3,5,4]} intensity={0.7} />
      {/* table */}
      <mesh position={[0,-1.2,-0.2]} rotation-x={-Math.PI/2}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={darkCards ? 0x0d0d0d : 0x111111} roughness={0.9} metalness={0} />
      </mesh>
      {/* cards */}
      {state.cards.map((c, i) => (
        <Card key={c.id} texture={c.tex} position={[i*1.7 - 1.7, 0, 0]} onClick={() => playCard(i)} />
      ))}
    </>
  );
}

export default function GameRoguelite({ themeKey = 'dark', accent = '#74b0d6' }) {
  const darkCards = themeKey === 'white'; // in white theme, render dark cards for contrast
  const hudText = themeKey === 'white' ? 'text-card' : 'text-site';
  const [seed, setSeed] = useState(() => Math.floor(Math.random()*1e9));
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const makeCard = useCallback(() => {
    const type = pickCard(rng);
    const id = `${type.key}-${Math.floor(rng()*1e9)}`;
    const tex = makeCardTexture(type.label, Math.floor(rng()*1e6), darkCards);
    return { id, type, tex };
  }, [rng, darkCards]);

  const [state, setState] = useState(() => ({
    score: 0,
    goal: 20,
    turns: 10,
    mult: 1,
    bonus: 0,
    combo: 0,
    relics: [], // simple passive bonuses
    log: 'Pick a card',
    cards: [0,1,2].map(() => makeCard()),
    over: false,
    win: false,
  }));

  const reset = () => {
    const newSeed = Math.floor(Math.random()*1e9);
    setSeed(newSeed);
    const rng2 = mulberry32(newSeed);
    setState({
      score: 0, goal: 20, turns: 10, mult: 1, bonus: 0, combo: 0, relics: [], log: 'Pick a card',
      cards: [0,1,2].map(() => {
        const t = pickCard(rng2);
        const id = `${t.key}-${Math.floor(rng2()*1e9)}`;
        return { id, type: t, tex: makeCardTexture(t.label, Math.floor(rng2()*1e6), darkCards) };
      }),
      over: false, win: false,
    });
  };

  const playCard = (idx) => {
    if (state.over) return;
    const chosen = state.cards[idx];
    const apply = chosen.type.effect;
    // compute next
    let next = { ...state };
    next = apply(next);
    // apply multiplier and bonus on positive gains
    const gain = next.score - state.score;
    if (gain > 0 && state.mult > 1) {
      next.score = state.score + gain * state.mult;
      next.mult = 1; // consume multiplier
    }
    if (state.bonus > 0 && gain > 0) {
      next.score += state.bonus;
    }
    // combo: if gain positive, increase streak; every 3 streaks grant +1 bonus
    if (gain > 0) {
      next.combo = (next.combo + 1);
      if (next.combo % 3 === 0) {
        next.bonus += 1;
        next.log = `${next.log} · combo! +1 bonus`;
      }
    } else {
      next.combo = 0;
    }
    // relic chance: 10% chance to gain a relic that grants permanent +1 bonus or a one-time x2
    if (Math.random() < 0.10 && next.relics.length < 3) {
      const kind = Math.random() < 0.5 ? 'ember' : 'lens';
      next.relics = [...next.relics, kind];
      if (kind === 'ember') { next.bonus += 1; next.log = `${next.log} · found EMBER (+1 bonus)`; }
      if (kind === 'lens') { next.mult = Math.max(next.mult, 2); next.log = `${next.log} · found LENS (x2)`; }
    }
    next.turns -= 1;
    next.log = `${chosen.type.label} → ${next.log}`;
    // draw new card
    const newCards = [...state.cards];
    newCards[idx] = makeCard();
    next.cards = newCards;
    // win/lose
    if (next.score >= next.goal) { next.over = true; next.win = true; }
    else if (next.turns <= 0) { next.over = true; next.win = false; }
    setState(next);
    // persist best
    try {
      const bestKey = 'roguelite-best';
      const best = parseInt(localStorage.getItem(bestKey) || '0', 10);
      if (next.score > best) localStorage.setItem(bestKey, String(next.score));
    } catch {}
  };

  return (
    <div className="w-full h-[85vh] rounded-lg border border-accent-25 bg-black/20 relative overflow-hidden">
      <Canvas camera={{ position: [0, 1.8, 3.6], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={[darkCards ? '#0b0b0b' : '#0a0a0a']} />
        <Scene state={state} playCard={playCard} darkCards={darkCards} />
      </Canvas>
      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 p-4 md:p-6 flex flex-col">
        <div className={`flex justify-between text-xs md:text-sm ${hudText}`}>
          <div>
            <div>score: <span className="font-semibold">{state.score}</span> / {state.goal}</div>
            <div>turns: <span className="font-semibold">{state.turns}</span></div>
          </div>
          <div className="text-right">
            <div>bonus: {state.bonus}</div>
            <div>mult: x{state.mult}</div>
            <div>combo: {state.combo}</div>
            {state.relics.length > 0 && (
              <div className="mt-1 opacity-80">relics: {state.relics.join(', ')}</div>
            )}
          </div>
        </div>
        {/* instructions */}
        <div className={`mt-auto text-center text-[11px] md:text-xs ${hudText} opacity-80`}>
          {state.log} · click a card to play · goal 20 in 10 turns · combos grant bonus
        </div>
      </div>
      {/* Overlay */}
      {state.over && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className={`${hudText} text-lg md:text-2xl mb-2`}>{state.win ? 'victory' : 'defeat'}</div>
            <button onClick={reset} className="pointer-events-auto btn-accent px-4 py-2 rounded">play again</button>
          </div>
        </div>
      )}
    </div>
  );
}
