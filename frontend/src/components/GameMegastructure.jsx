import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// A minimalist interactive fiction game with a Three.js ambience layer.
// Theme: decayed megastructures, signal noise, claustrophobic corridors (inspired by Blame!).

const NODES = [
  {
    id: 'wakeup',
    text: [
      'you wake to the sound of distant hydraulics. the corridor is a repeatable segment, looped to infinity.',
      'a maintenance console hums with a dying green. the walls flex like tendon.'
    ],
    choices: [
      { label: 'examine console', next: 'console', effect: { signal: +1 } },
      { label: 'walk the corridor', next: 'corridor', effect: { depth: +1 } }
    ]
  },
  {
    id: 'console',
    text: [
      'the login prompt blinks. glyphs you don\'t recognize crawl in the periphery.',
      'a map renders: a shaft descending beyond measurable scale. annotations: deprecated, hostile, obsolete.'
    ],
    choices: [
      { label: 'descend the shaft', next: 'shaft', effect: { depth: +2 } },
      { label: 'ping the network', next: 'ping', effect: { signal: +2, entropy: +1 } }
    ]
  },
  {
    id: 'corridor',
    text: [
      'you walk for a day or a second. the corridor repeats until it doesn\'t. the air tastes of arcing capacitors.',
      'a hatch misaligns by less than a millimeter. it\'s enough to not be factory.'
    ],
    choices: [
      { label: 'force the hatch', next: 'hatch', effect: { entropy: +1 } },
      { label: 'mark the wall and continue', next: 'loop', effect: { depth: +1 } }
    ]
  },
  {
    id: 'shaft',
    text: [
      'you freefall in controlled intervals, latching onto rungs that are not for hands like yours.',
      'somewhere above, something releases a pressure. the sound arrives late.'
    ],
    choices: [
      { label: 'drop faster', next: 'infra', effect: { depth: +2, entropy: +1 } },
      { label: 'stop and listen', next: 'listen', effect: { signal: +2 } }
    ]
  },
  {
    id: 'ping',
    text: [
      'return codes flood in: 403, 451, 410, 000. the machine language is older than ruin.',
      'one response persists: AUTHORITY::DENIED but it keeps watching.'
    ],
    choices: [
      { label: 'spoof credentials', next: 'auth', effect: { entropy: +2 } },
      { label: 'cut the signal', next: 'wakeup', effect: { signal: -1 } }
    ]
  },
  {
    id: 'hatch',
    text: [
      'behind the hatch: a cavity filled with carbon bones. not human. not machine.',
      'etched into the wall: VECTOR TO CORE.'
    ],
    choices: [
      { label: 'take the vector', next: 'core', effect: { depth: +2 } },
      { label: 'close it and keep walking', next: 'loop', effect: {} }
    ]
  },
  {
    id: 'loop',
    text: [
      'your mark returns. the loop is tighter now. the corridor is learning you.',
      'footsteps that are yours but offset by one segment.'
    ],
    choices: [
      { label: 'confront the offset', next: 'offset', effect: { entropy: +1 } },
      { label: 'break the lights', next: 'dark', effect: { entropy: +2 } }
    ]
  },
  {
    id: 'listen',
    text: [
      'you hear the city\'s circulatory system: pumps, fans, the heartbeat of a dead god.',
      'something hears you hearing it.'
    ],
    choices: [
      { label: 'continue', next: 'infra', effect: {} }
    ]
  },
  {
    id: 'infra',
    text: [
      'infrastructure level: cantilevered platforms over a void. the drop swallows light.',
      'cranes move without operators. the script remains but the author is gone.'
    ],
    choices: [
      { label: 'navigate the cranes', next: 'cranes', effect: { depth: +2 } },
      { label: 'scan for routes', next: 'scan', effect: { signal: +2 } }
    ]
  },
  {
    id: 'auth',
    text: [
      'you feed the system a ghost of someone you never were. it believes enough to open a door somewhere else.',
      'you are tracked. you were already tracked.'
    ],
    choices: [
      { label: 'follow the opened door', next: 'door', effect: { depth: +1 } },
      { label: 'cut every transmitter', next: 'dark', effect: { signal: -2, entropy: +1 } }
    ]
  },
  {
    id: 'offset',
    text: [
      'you turn the corner into yourself turning the corner. you are misaligned by a frame.',
      'one of you speaks a word you don\'t know and both of you understand it.'
    ],
    choices: [
      { label: 'merge', next: 'merge', effect: { entropy: +3 } },
      { label: 'refuse', next: 'loop', effect: {} }
    ]
  },
  {
    id: 'dark',
    text: [
      'the dark is not empty. it is crowded with old decisions.',
      'far below, a light answers in the wrong direction.'
    ],
    choices: [
      { label: 'descend towards the wrong light', next: 'core', effect: { depth: +3, entropy: +1 } }
    ]
  },
  {
    id: 'cranes',
    text: [
      'you cross cranes that don\'t respect weight limits anymore. halfway, you see the core housing: a cylinder the size of continents.',
      'something inside is still processing.'
    ],
    choices: [
      { label: 'enter the core housing', next: 'core', effect: { depth: +2 } },
      { label: 'watch it process', next: 'watch', effect: { signal: +1 } }
    ]
  },
  {
    id: 'scan',
    text: [
      'routes compile and dissolve. the city refuses pathfinding, but a corridor blinks green for a moment to be polite.',
      'it is enough.'
    ],
    choices: [
      { label: 'take the corridor', next: 'core', effect: { depth: +1 } }
    ]
  },
  {
    id: 'door',
    text: [
      'the door leads to an elevator with no buttons. it moves because you are inside.',
      'the cabin is full of fingerprints you almost recognize.'
    ],
    choices: [
      { label: 'let it take you', next: 'core', effect: { depth: +2 } }
    ]
  },
  {
    id: 'merge',
    text: [
      'two trajectories attempt to become one. you feel heavier and lighter.',
      'the corridor exhales. somewhere a version of you never woke up.'
    ],
    choices: [
      { label: 'continue', next: 'infra', effect: {} }
    ]
  },
  {
    id: 'watch',
    text: [
      'you watch for a duration that outlives your watchfulness. the process identifies you as a process and lets you pass.',
      'courtesy is indistinguishable from predation here.'
    ],
    choices: [
      { label: 'approach the core', next: 'core', effect: {} }
    ]
  },
  {
    id: 'core',
    text: [
      'the core is not a room. it\'s a continent of machinery arranged like an altar.',
      'in the center, a column climbs until it doesn\'t. encoded along its face: a command you cannot read.'
    ],
    choices: [
      { label: 'touch the command', next: 'ending', effect: { depth: +1, signal: +1, entropy: +1 } },
      { label: 'turn away', next: 'ending2', effect: {} }
    ]
  },
  {
    id: 'atrium',
    text: [
      'an atrium opens like a wound in the grid. gardens once hung here, now cables and dust.',
      'drones drift past bearing nothing, still following routes to nowhere.'
    ],
    choices: [
      { label: 'trace the drone route', next: 'scan', effect: { signal: +1 } },
      { label: 'cut a cable', next: 'dark', effect: { entropy: +1 } }
    ]
  },
  {
    id: 'reservoir',
    text: [
      'a dry reservoir the size of a city district. the tide line is coded in centimeter-high kanji.',
      'someone once measured until measuring failed.'
    ],
    choices: [
      { label: 'descend to the basin', next: 'infra', effect: { depth: +1 } },
      { label: 'follow the tide line', next: 'loop', effect: { signal: +1 } }
    ]
  },
  {
    id: 'ending',
    text: [
      'your hand becomes the correct signature. the column flexes. for a moment the city is aligned.',
      'you remember a different wakeup that you might reach if you keep walking.'
    ],
    choices: [
      { label: 'restart', next: 'wakeup', effect: { depth: 0, signal: 0, entropy: 0 }, reset: true }
    ]
  },
  {
    id: 'ending2',
    text: [
      'you turn away. the city does not. it records your refusal as acceptance.',
      'the elevator arrives for someone else who is you.'
    ],
    choices: [
      { label: 'restart', next: 'wakeup', effect: { depth: 0, signal: 0, entropy: 0 }, reset: true }
    ]
  }
];

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function usePillars(count = 240) {
  const group = useRef();
  const rng = useMemo(() => Math.random() * 1000, []);
  const pillars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      const h = 6 + Math.random() * 24;
      arr.push({ x, z, h });
    }
    return arr;
  }, []);
  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.05) * 0.05;
    // subtle flicker via material opacity jitter
    group.current.children.forEach((m, i) => {
      if (m.material && m.material.opacity !== undefined) {
        m.material.opacity = 0.06 + Math.abs(Math.sin(t * 0.5 + i * 0.13)) * 0.06;
      }
    });
  });
  return { group, pillars };
}

function PillarField({ accent = '#74b0d6' }) {
  const { group, pillars } = usePillars();
  const color = new THREE.Color(accent);
  return (
    <group ref={group}>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, p.z]} receiveShadow castShadow>
          <boxGeometry args={[0.6, p.h, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} opacity={0.08} transparent />
        </mesh>
      ))}
    </group>
  );
}

function Cables() {
  // Minimal moving cables as thin boxes oscillating
  const group = useRef();
  const cables = useMemo(() => Array.from({ length: 12 }, () => ({
    x: (Math.random()-0.5)*40, z: (Math.random()-0.5)*40, len: 8+Math.random()*12
  })), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((m, i) => {
      m.rotation.z = Math.sin(t*0.8 + i*0.6)*0.2;
    });
  });
  return (
    <group ref={group}>
      {cables.map((c, i) => (
        <mesh key={i} position={[c.x, 6, c.z]}>
          <boxGeometry args={[0.05, c.len, 0.05]} />
          <meshStandardMaterial color={0x333333} roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

export default function GameMegastructure({ themeKey = 'dark', accent = '#74b0d6' }) {
  const [node, setNode] = useState('wakeup');
  const [stats, setStats] = useState({ depth: 0, signal: 0, entropy: 0 });
  const [toast, setToast] = useState('');

  const applyEffect = useCallback((effect) => {
    setStats((s) => {
      if (!effect) return s;
      if (effect.depth === 0 && effect.signal === 0 && effect.entropy === 0) return { depth: 0, signal: 0, entropy: 0 };
      return {
        depth: clamp((s.depth + (effect.depth || 0)), 0, 999),
        signal: clamp((s.signal + (effect.signal || 0)), 0, 999),
        entropy: clamp((s.entropy + (effect.entropy || 0)), 0, 999),
      };
    });
  }, []);

  const current = useMemo(() => NODES.find(n => n.id === node) || NODES[0], [node]);

  const onChoose = (choice) => {
    applyEffect(choice.effect);
    if (choice.reset) setStats({ depth: 0, signal: 0, entropy: 0 });
    setNode(choice.next);
    try {
      localStorage.setItem('mega-node', choice.next);
      localStorage.setItem('mega-stats', JSON.stringify(stats));
    } catch {}
  };

  useEffect(() => {
    try {
      const savedNode = localStorage.getItem('mega-node');
      const savedStats = JSON.parse(localStorage.getItem('mega-stats') || 'null');
      if (savedNode && NODES.some(n => n.id === savedNode)) setNode(savedNode);
      if (savedStats) setStats(savedStats);
    } catch {}
  }, []);

  const darkBg = themeKey === 'white' ? '#0a0a0a' : '#000000';
  const hudText = themeKey === 'white' ? 'text-card' : 'text-site';

  const onCollectShard = useCallback(() => {
    setStats((s) => ({ ...s, signal: clamp(s.signal + 1, 0, 999) }));
    setToast('signal +1');
    setTimeout(() => setToast(''), 1200);
  }, []);

  function CameraRig() {
    const { camera } = useThree();
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      const r = 0.8;
      camera.position.x = Math.sin(t * 0.1) * r;
      camera.position.z = 10 + Math.cos(t * 0.13) * r;
      camera.position.y = 9 + Math.sin(t * 0.07) * 0.6;
      camera.lookAt(0, 4, 0);
    });
    return null;
  }

  function Monolith({ accent }) {
    const color = new THREE.Color(accent);
    const ringRef = useRef();
    useFrame(({ clock }) => {
      if (ringRef.current) {
        ringRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      }
    });
    return (
      <group>
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 20, 32]} />
          <meshStandardMaterial color={0x0b0b0b} roughness={0.95} metalness={0.02} />
        </mesh>
        <mesh ref={ringRef} position={[0, 6, 0]} rotation-x={Math.PI/2}>
          <torusGeometry args={[1.6, 0.03, 8, 64]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.5} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  function SignalShards({ accent, onCollect }) {
    const group = useRef();
    const shards = useMemo(() => Array.from({ length: 8 }, () => ({
      x: (Math.random()-0.5)*30, z: (Math.random()-0.5)*30, y: 1 + Math.random()*6, p: Math.random()*Math.PI*2
    })), []);
    const color = new THREE.Color(accent);
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      if (!group.current) return;
      group.current.children.forEach((m, i) => {
        const s = shards[i];
        m.position.y = s.y + Math.sin(t*1.3 + s.p)*0.4;
        m.rotation.y = t*0.8;
      });
    });
    return (
      <group ref={group}>
        {shards.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, s.z]} onClick={onCollect}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.2} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <div className="w-full min-h-[85vh] rounded-lg border border-accent-25 bg-black/30 relative overflow-hidden">
      {/* Three.js ambience */}
      <Canvas camera={{ position: [0, 9, 10], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={[darkBg]} />
        <fog attach="fog" args={[darkBg, 10, 40]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 18, 8]} intensity={0.85} castShadow />
        <CameraRig />
        <PillarField accent={accent} />
        <Monolith accent={accent} />
        <Cables />
        <SignalShards accent={accent} onCollect={onCollectShard} />
        {/* floor */}
        <mesh rotation-x={-Math.PI/2} position={[0,0,0]} receiveShadow>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color={0x0b0b0b} roughness={1} metalness={0} />
        </mesh>
      </Canvas>

      {/* IF UI overlay */}
      <div className="pointer-events-none absolute inset-0 p-4 md:p-6 flex flex-col">
        <div className={`text-[11px] md:text-xs ${hudText}/80 font-mono`}>megastructure.if — v0.1</div>
        <div className="mt-1 flex items-center justify-between text-xs md:text-sm">
          <div className="text-green-300/90 font-mono">depth: {stats.depth} · signal: {stats.signal} · entropy: {stats.entropy}</div>
          <div className={`${hudText}/60 font-mono`}>save auto</div>
        </div>
        <div className="mt-4 bg-card border border-accent-25 rounded p-4 md:p-5 text-card leading-relaxed pointer-events-auto">
          {current.text.map((line, i) => (
            <p key={i} className="text-[12px] md:text-sm mb-2 last:mb-0">{line}</p>
          ))}
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            {current.choices.map((c, i) => (
              <button key={i} className="btn-accent px-3 py-1.5 rounded text-xs text-center" onClick={() => onChoose(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {toast && (
        <div className="absolute top-4 right-4 bg-card border border-accent-25 text-card text-xs px-2 py-1 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
