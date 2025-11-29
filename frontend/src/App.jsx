import React, { useState, useEffect, Suspense } from 'react';
import ThreeMinimal from './components/ThreeMinimal';
import TerminalWindow from './components/TerminalWindow';
import RollingGallery from './RollingGallery';
const GameMegastructure = React.lazy(() => import('./components/GameMegastructure'));
const GameTetris = React.lazy(() => import('./components/GameTetris'));
const GameRoguelite = React.lazy(() => import('./components/GameRoguelite'));

const clamp = (value, min = 0, max = 255) => Math.max(min, Math.min(max, value));
const hexToRgb = (hex) => {
  if (!hex) return { r: 255, g: 255, b: 255 };
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((ch) => ch + ch).join('');
  }
  if (normalized.length >= 6) {
    normalized = normalized.slice(0, 6);
  }
  const intVal = parseInt(normalized, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
};
const rgbToHex = (r, g, b) => `#${[r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('')}`;
const tintHex = (hex, ratio = 0.65) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * ratio, g + (255 - g) * ratio, b + (255 - b) * ratio);
};

const Portfolio = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [accent, setAccent] = useState('#74b0d6');
  const [accentKey, setAccentKey] = useState('blue');

  const ACCENTS = {
    red: { hex: '#fe7373', rgb: '239,68,68', contrast: '#ffffff' },
    blue: { hex: '#74b0d6', rgb: '116,176,214', contrast: '#000000' },
    green: { hex: '#34d399', rgb: '52,211,153', contrast: '#000000' },
    yellow: { hex: '#f59e0b', rgb: '245,158,11', contrast: '#000000' },
    peach: { hex: '#ffc6a1', rgb: '255,198,161', contrast: '#000000' },
    black: { hex: '#111827', rgb: '17,24,39', contrast: '#ffffff' },
    white: { hex: '#ffffff', rgb: '255,255,255', contrast: '#000000' },
  };

  const applyAccent = (key) => {
    const useAccentKey = key;
    const entry = ACCENTS[useAccentKey] || ACCENTS.blue;
    const root = document.documentElement;
    const tinted = tintHex(entry.hex, 0.82);
    const secondaryTint = tintHex(entry.hex, 0.65);
    setAccent(entry.hex);
    setAccentKey(key);
    try { localStorage.setItem('accent-key', key); } catch {}
    root.setAttribute('data-theme', key);
    root.style.setProperty('--accent-hex', entry.hex);
    root.style.setProperty('--accent-rgb', entry.rgb);
    root.style.setProperty('--accent-contrast', entry.contrast);

    const setThemeColors = ({ siteBg, siteFg, terminalBg, terminalFg, cardBg, cardFg, sectionBg }) => {
      root.style.setProperty('--site-bg', siteBg);
      root.style.setProperty('--site-fg', siteFg);
      root.style.setProperty('--terminal-bg', terminalBg);
      root.style.setProperty('--terminal-fg', terminalFg);
      root.style.setProperty('--card-bg', cardBg);
      root.style.setProperty('--card-fg', cardFg);
      root.style.setProperty('--section-bg', sectionBg);
    };

    if (key === 'black') {
      setThemeColors({
        siteBg: '#000000',
        siteFg: '#ffffff',
        terminalBg: 'rgba(0,0,0,0.85)',
        terminalFg: '#ffffff',
        cardBg: 'rgba(15,15,15,0.6)',
        cardFg: '#ffffff',
        sectionBg: 'rgba(255,255,255,0.08)',
      });
    } else if (key === 'white') {
      setThemeColors({
        siteBg: '#f8fafc',
        siteFg: '#0b0f13',
        terminalBg: 'rgba(255,255,255,0.92)',
        terminalFg: '#0b0f13',
        cardBg: '#111111',
        cardFg: '#ffffff',
        sectionBg: 'rgba(0,0,0,0.06)',
      });
    } else {
      setThemeColors({
        siteBg: '#050608',
        siteFg: tinted,
        terminalBg: 'rgba(4,7,14,0.82)',
        terminalFg: tinted,
        cardBg: 'rgba(5,8,14,0.68)',
        cardFg: secondaryTint,
        sectionBg: 'rgba(4,7,12,0.55)',
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // hydrate accent from storage
    try {
      const saved = localStorage.getItem('accent-key');
      if (saved && ACCENTS[saved]) {
        applyAccent(saved);
      } else {
        applyAccent('blue');
      }
    } catch {
      applyAccent('blue');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredProjects = [
    {
      name: 'NLP GenZ Translator',
      description: 'Full-stack translator that bridges traditional English and Gen Z slang with real-time context hints.',
      tech: ['React', 'Spring Boot', 'PostgreSQL', 'Docker', 'Vercel', 'Render'],
      link: 'https://github.com/YahyaAsmara/nlp-genz-translator',
    },
    {
      name: 'Hackathon Management Tool',
      description: 'Hack The Change 2025 ops platform streamlining registration, scheduling, and team workflows for 400+ attendees.',
      tech: ['TypeScript', 'AWS', 'Figma', 'Agile'],
      link: 'https://github.com/YahyaAsmara/hackathon-management-tool',
    },
    {
      name: 'DICOM to NIfTI Pipeline',
      description: 'Automated medical imaging conversion and visualization stack with HIPAA-conscious storage and alerts.',
      tech: ['Python', 'Streamlit', 'AWS S3', 'boto3'],
      link: 'https://github.com/YahyaAsmara/dicom-to-nifti',
    },
    {
      name: 'Experience Ventures Directory',
      description: 'Data-backed directory aligning 34+ ventures across B2B/B2C/SaaS/PaaS models for faster partner discovery.',
      tech: ['SQL', 'Data Modeling', 'Stakeholder Ops'],
      link: 'https://github.com/YahyaAsmara/experience-ventures-directory',
    },
  ];

  const archiveProjects = [
    { name: '3js_minecraft', description: 'Minecraft-inspired 3D rendering demo built with Three.js.', tech: ['Three.js', 'WebGL'], link: 'https://github.com/YahyaAsmara/3js_minecraft' },
    { name: 'calgary-crime-analysis', description: 'SQL + data visualization pipeline exploring Calgary crime trends.', tech: ['Python', 'SQL', 'Data Viz'], link: 'https://github.com/YahyaAsmara/calgary-crime-analysis' },
    { name: 'energy-simulation', description: 'Raspberry Pi energy logger + simulator with automation hooks.', tech: ['Python', 'IoT', 'Automation'], link: 'https://github.com/YahyaAsmara/energy-simulation' },
    { name: 'high-fidelity-agriculture-simulation', description: 'High-fidelity crop cycles and soil experimentation prototype.', tech: ['Unity', 'C#', 'Simulation'], link: 'https://github.com/YahyaAsmara/high-fidelity-agriculture-simulation' },
    { name: 'mining-platform', description: 'Sensor-aware mining analytics platform for real-time dashboards.', tech: ['TypeScript', 'Node.js', 'Data'], link: 'https://github.com/YahyaAsmara/mining-platform' },
    { name: 'Staircases', description: 'Vertical roguelike prototype experimenting with stair-based traversal.', tech: ['C#', 'Unity', 'Game Dev'], link: 'https://github.com/YahyaAsmara/Staircases' },
  ];

  const skillGroups = [
    {
      name: 'Languages',
      items: ['Java', 'Python', 'C', 'C++', 'C#', 'SQL', 'JavaScript', 'HTML/CSS', 'R', 'PHP', 'Haskell', 'Sage 50'],
    },
    {
      name: 'Technologies',
      items: ['TypeScript/React', 'Node/Next.js', 'Spring Boot', 'PostgreSQL', 'Microsoft SQL Server', 'MySQL', 'TailwindCSS'],
    },
    {
      name: 'Platforms & Cloud',
      items: ['AWS (DynamoDB, Amplify, EC2, Kinesis)', 'Vercel', 'Render', 'Docker'],
    },
    {
      name: 'Tools & UI',
      items: ['Figma', 'SceneBuilder', 'KeyNoteVR', 'JavaSwing'],
    },
  ];

  const sections = ['home', 'about', 'experiences', 'projects', 'game', 'contact'];
  const games = [
    { key: 'tetris', label: 'tetris · classic puzzle game', Comp: GameTetris },
    { key: 'cards', label: 'cards · quick score‑chase', Comp: GameRoguelite },
    { key: 'mega', label: 'megastructure · text horror + foggy pillars', Comp: GameMegastructure },
  ];
  const [gameIndex, setGameIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [fadeStage, setFadeStage] = useState(0); // 0 = start (opaque), 1 = faded to 0
  const fadeTimerRef = React.useRef(null);
  const switchTo = (next) => {
    if (next === gameIndex) return;
    // prepare previous overlay
    setPrevIndex(gameIndex);
    setGameIndex(((next % games.length) + games.length) % games.length);
    setFadeStage(0);
    // kick the fade on the next frame so CSS transition animates 1 -> 0
    requestAnimationFrame(() => requestAnimationFrame(() => setFadeStage(1)));
    // cleanup previous after transition
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setPrevIndex(null);
    }, 350);
  };
  const nextGame = () => switchTo(gameIndex + 1);
  const prevGame = () => switchTo(gameIndex - 1);
  const scrollToSection = (i) => {
    const el = document.getElementById(sections[i]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSection(i);
    }
  };

  // Parse terminal commands strictly and navigate
  const onTerminalCommand = (raw) => {
    const original = (raw ?? '').toString();
    let c = original.trim().toLowerCase();
    if (!c) return;

    // Strip common prefixes: cd/go/goto/open/to/nav and leading symbols (#./)
    c = c.replace(/^\s*(cd|go\s*to|goto|go|open|nav|to)\s+/, '').trim();
    c = c.replace(/^[#./]+/, '').trim();

    // theme command: theme <color>
    const themeMatch = original.trim().toLowerCase().match(/^(theme|color|accent)\s+(red|blue|green|yellow|peach|black|white)\s*$/);
    if (themeMatch) {
      const key = themeMatch[2];
      applyAccent(key);
      return;
    }
    if (/^(theme|color|accent)$/.test(c)) {
      // no-arg theme command, ignore here
      return;
    }

    // Short numeric shortcuts
    if (c === '1') return scrollToSection(0);
    if (c === '2') return scrollToSection(1);
  if (c === '3') return scrollToSection(2);
  if (c === '4') return scrollToSection(3);
  if (c === '5') return scrollToSection(4);
  if (c === '6') return scrollToSection(5);

    // Exact aliases
    const aliasMap = {
      home: ['home', 'top', 'start', 'root', 'index'],
      about: ['about', 'whoami', 'bio', 'me'],
  experiences: ['experiences', 'experience', 'xp', 'workexp'],
    projects: ['projects', 'project', 'work', 'repo', 'repos', 'portfolio'],
      game: ['game', 'roguelite', 'cards'],
      contact: ['contact', 'reach', 'email', 'connect', 'get in touch'],
    };
    for (const [id, vals] of Object.entries(aliasMap)) {
      if (vals.some(v => v === c)) {
        const idx = sections.indexOf(id);
        if (idx !== -1) scrollToSection(idx);
        return;
      }
    }

    // CSS selector fallback if user typed a selector like '#about' or '.about'
    if (/^[#.]/.test(original.trim())) {
      try {
        const el = document.querySelector(original.trim());
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const els = sections.map((id) => document.getElementById(id));
      const y = window.scrollY + window.innerHeight / 2;
      for (let i = els.length - 1; i >= 0; i--) {
        const e = els[i];
        if (e && e.offsetTop <= y) { setCurrentSection(i); break; }
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // if (isLoading) {
  //   return (
  //     <div className="fixed inset-0 bg-black flex items-center justify-center">
  //       <div className="text-emerald-300 font-mono text-sm">booting…</div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-site text-site min-h-screen font-mono overflow-x-hidden">
      {/* hero with extra negative space */}
      <section id="home" className="relative min-h-[95vh] flex items-center">
        <ThreeMinimal accent={accent} />
        <div className="relative z-10 w-full px-5 pt-24 md:pt-32">
          <div className="text-center mb-10 md:mb-16">
            <h1 className={"text-3xl sm:text-5xl md:text-6xl tracking-tight " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>yahya asmara</h1>
            <p className={"text-xs sm:text-sm md:text-base mt-3 leading-relaxed " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site opacity-80' : 'text-accent-strong opacity-80')}>
              calgary-based software developer · cs @ university of calgary · building equitable tooling for communities
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <TerminalWindow onCommand={onTerminalCommand} />
          </div>
        </div>
      </section>

      {/* floating home button (visible when not on home) */}
      {currentSection !== 0 && (
        <button
          aria-label="Back to home"
          onClick={() => scrollToSection(0)}
          className="fixed bottom-5 right-5 z-50 rounded-full btn-accent transition-colors shadow-accent px-3 py-2 text-xs md:text-sm border border-[#0b1e2a]/10"
        >
          home
        </button>
      )}

      {/* about */}
  <section id="about" className="pt-20 md:pt-28 pb-12 md:pb-16 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={"text-base md:text-lg mb-8 md:mb-12 " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>about</h2>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-stretch">
            <div className="order-2 md:order-1">
              <div className="bg-card border border-accent-25 rounded p-5 md:p-7 leading-relaxed text-card">
                <pre className="whitespace-pre-wrap text-xs md:text-sm">{`// hey there — i'm yahya
const location = 'Calgary, Alberta';
const currentRole = 'Software Developer @ CodeTheChangeYYC';
const studies = 'BSc Computer Science, UCalgary';
const focus = ['full-stack systems', 'hackathons', 'medical imaging'];`}</pre>
              </div>
            </div>
              <div className="order-1 md:order-2 h-full">
                <div className="h-full md:-mt-20 -mt-0 flex md:block items-center justify-center">
                  <RollingGallery autoplay={true} pauseOnHover={false} />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* experiences */}
      <section id="experiences" className="pt-8 md:pt-12 pb-12 md:pb-16 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={"text-base md:text-lg mb-6 md:mb-10 " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>experiences</h2>
          <div className="timeline">
            {[
              {
                title: 'Software Developer — CodeTheChangeYYC',
                date: 'Oct 2025 – Present',
                bullets: [
                  'Engineering a full-stack Hackathon Management Tool powering 400+ participants for Hack The Change 2025.',
                  'Shepherding agile delivery across 20+ branches with weekly reviews and 95%+ code quality targets.',
                  'Deploying AWS infrastructure plus TypeScript UI systems shaped from Figma mocks and Jira sprints.',
                ],
              },
              {
                title: 'Academic Tutor — EducationWise Inc. (Calgary)',
                date: 'May 2024 – Present',
                bullets: [
                  'Delivering specialized CS instruction with evidence-based pedagogy across multiple languages.',
                  'Designing study frameworks that measurably lift test scores and long-term academic performance.',
                ],
              },
              {
                title: 'Product Developer — Experience Ventures, UCalgary',
                date: 'Dec 2024 – Mar 2025',
                bullets: [
                  'Partnered with 34+ Building Bridges (TIES) ventures across B2B/B2C/SaaS/PaaS models.',
                  'Correlated insights into a living business directory that accelerated stakeholder communication.',
                ],
              },
              {
                title: 'ICT Internship Program — CAREERS',
                date: 'Jul 2022 – Aug 2022',
                bullets: [
                  'Rotational internship exploring ICT support and emerging tech exposure.',
                ],
              },
            ].map((exp, idx) => (
              <div key={exp.title} className="timeline-item">
                <div className="timeline-node">
                  <span className="timeline-dot" />
                  {idx !== 3 && <span className="timeline-line" />}
                </div>
                <div className="timeline-card bg-card border border-accent-25 rounded-2xl p-4 md:p-5">
                  <h3 className="text-sm text-card mb-1">{exp.title}</h3>
                  <p className="text-[11px] text-card opacity-70 mb-2">{exp.date}</p>
                  <ul className="text-[11px] text-card opacity-80 space-y-1 list-disc pl-4">
                    {exp.bullets.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* projects */}
      <section id="projects" className="py-20 md:py-36 px-5 md:px-8 bg-section border-y border-accent-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={"text-base md:text-lg mb-10 " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>projects</h2>
          <p className="text-[11px] text-card opacity-80 max-w-3xl mb-6">
            A mix of shipping notes, hackathon utilities, and research prototypes. Everything else lives on{' '}
            <a href="https://github.com/YahyaAsmara" target="_blank" rel="noopener noreferrer" className="border-b border-accent-40 hover:border-accent-70">github.com/YahyaAsmara</a>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredProjects.map((project) => (
              <div key={project.name} className="bg-card border border-accent-25 p-5 md:p-6 rounded hover:border-accent-40 transition-colors">
                <h3 className="text-sm md:text-base text-card mb-2 tracking-wide">{project.name}</h3>
                <p className="text-card opacity-80 mb-3 text-xs leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tech.map((tech) => (
                    <span key={tech} className="text-[10px] chip-accent border px-2 py-0.5 rounded">{tech}</span>
                  ))}
                </div>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs border-b border-accent-40 hover:border-accent-70 text-card">View Project →</a>
              </div>
            ))}
          </div>
          <h3 className={"text-sm md:text-base mt-12 mb-4 md:mb-6 " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>more builds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {archiveProjects.map((project) => (
              <a key={project.name} href={project.link} target="_blank" rel="noopener noreferrer" className="bg-card border border-accent-25 rounded p-4 hover:border-accent-40 transition-colors flex flex-col gap-2">
                <div>
                  <h4 className="text-sm text-card mb-1">{project.name}</h4>
                  <p className="text-[11px] text-card opacity-75 leading-relaxed">{project.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((tech) => (
                    <span key={tech} className="text-[9px] chip-accent border px-2 py-0.5 rounded">{tech}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
          <h3 className={"text-sm md:text-base mt-10 md:mt-16 mb-4 md:mb-6 " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>technical skills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillGroups.map((group) => (
              <div key={group.name} className="bg-card border border-accent-25 rounded p-4 md:p-5 flex flex-col gap-2">
                <h4 className="text-xs md:text-sm text-card uppercase tracking-[0.18em]">{group.name}</h4>
                <p className="text-[11px] text-card opacity-80 leading-relaxed">{group.items.join(' • ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* games */}
      <section id="game" className="py-20 md:py-36 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={"text-base md:text-lg mb-4 md:mb-6 flex items-center justify-between " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>
            <span>games</span>
            <span className="text-[11px] text-site opacity-70">use arrows to switch</span>
          </h2>
          <div className="relative">
            {/* label */}
            <div className="text-[11px] text-site opacity-70 mb-2">{games[gameIndex].label}</div>
            {/* game viewport */}
            <div className="px-10 relative">{/* padding so arrows don't overlap canvas; relative for overlay */}
              <Suspense fallback={<div className="text-[11px] text-site opacity-70">loading…</div>}>
                {(() => {
                  const C = games[gameIndex].Comp;
                  return <C themeKey={accentKey} accent={accent} />
                })()}
              </Suspense>
              {prevIndex !== null && (
                <div className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${fadeStage === 1 ? 'opacity-0' : 'opacity-100'}`}>
                  <Suspense fallback={null}>
                    {(() => {
                      const Prev = games[prevIndex].Comp;
                      return <Prev themeKey={accentKey} accent={accent} />
                    })()}
                  </Suspense>
                </div>
              )}
            </div>
            {/* arrows (placed after to sit above but not block canvas entrance) */}
            <button aria-label="previous game" onClick={prevGame} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 btn-accent rounded-full w-8 h-8 flex items-center justify-center opacity-90">‹</button>
            <button aria-label="next game" onClick={nextGame} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 btn-accent rounded-full w-8 h-8 flex items-center justify-center opacity-90">›</button>
          </div>
        </div>
      </section>

      {/* bridge hero */}
      <section className="px-5 md:px-8 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center rounded-3xl border border-accent-25 p-8 md:p-12 bg-transparent">
            <div className="sphere-stage sphere-standalone">
              <div className="sphere-ring"></div>
              <div className="dither-sphere" aria-hidden="true">
                <span className="sphere-core"></span>
                <span className="sphere-noise"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="py-20 md:py-36 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={"text-base md:text-lg mb-6 " + ((accentKey === 'white' || accentKey === 'black') ? 'text-site' : 'text-accent-strong')}>contact</h2>
          <p className="text-sm text-site opacity-80 mb-8">Always happy to talk about hackathons, research tooling, or cool Three.js experiments.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
            <a href="mailto:yahya16005@gmail.com" className="text-xs md:text-sm border-b border-accent-40 hover:border-accent-70 text-site">Email</a>
            <a href="https://linkedin.com/in/yahya-asmara" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm border-b border-accent-40 hover:border-accent-70 text-site">LinkedIn</a>
            <a href="https://github.com/YahyaAsmara" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm border-b border-accent-40 hover:border-accent-70 text-site">GitHub</a>
          </div>
          <p className="text-[11px] text-site opacity-70 mt-8">Calgary, Alberta</p>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 md:py-16 px-6 border-t border-accent-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[11px] text-site opacity-60">© 2025 yahya asmara — react • three.js</p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;