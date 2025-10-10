import React, { useState, useEffect } from 'react';
import ThreeMinimal from './components/ThreeMinimal';
import TerminalWindow from './components/TerminalWindow';
import RollingGallery from './RollingGallery';

const Portfolio = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [accent, setAccent] = useState('#74b0d6');
  const [accentKey, setAccentKey] = useState('blue');

  const ACCENTS = {
    red: { hex: '#ef4444', rgb: '239,68,68', contrast: '#ffffff' },
    blue: { hex: '#74b0d6', rgb: '116,176,214', contrast: '#000000' },
    green: { hex: '#34d399', rgb: '52,211,153', contrast: '#000000' },
    yellow: { hex: '#f59e0b', rgb: '245,158,11', contrast: '#000000' },
    peach: { hex: '#ffc6a1', rgb: '255,198,161', contrast: '#000000' },
    black: { hex: '#111827', rgb: '17,24,39', contrast: '#ffffff' },
    white: { hex: '#ffffff', rgb: '255,255,255', contrast: '#000000' },
  };

  const applyAccent = (key) => {
    // Use a contrasting accent for black/white themes to preserve readability
    const useAccentKey = (key === 'white' || key === 'black') ? 'blue' : key;
    const entry = ACCENTS[useAccentKey] || ACCENTS.blue;
    setAccent(entry.hex);
    setAccentKey(key);
    const root = document.documentElement;
    root.style.setProperty('--accent-hex', entry.hex);
    root.style.setProperty('--accent-rgb', entry.rgb);
    root.style.setProperty('--accent-contrast', entry.contrast);
    // Adjust site/terminal colors for black/white themes
    if (key === 'black') {
      root.style.setProperty('--site-bg', '#0b0b0b');
      root.style.setProperty('--site-fg', '#e5e5e5');
      root.style.setProperty('--terminal-bg', 'rgba(0,0,0,0.78)');
      root.style.setProperty('--terminal-fg', '#e5e7eb');
    } else if (key === 'white') {
      root.style.setProperty('--site-bg', '#f8fafc');
      root.style.setProperty('--site-fg', '#0b0f13');
      root.style.setProperty('--terminal-bg', 'rgba(255,255,255,0.80)');
      root.style.setProperty('--terminal-fg', '#0b0f13');
    } else {
      // default scheme
      root.style.setProperty('--site-bg', '#0f0b0a');
      root.style.setProperty('--site-fg', '#ffe5d6');
      root.style.setProperty('--terminal-bg', 'rgba(0, 0, 0, 0.70)');
      root.style.setProperty('--terminal-fg', '#e8f5fc');
    }
    try { localStorage.setItem('accent-key', key); } catch {}
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

  const projects = [
    { name: 'genz-translator', description: 'A translator targeting Gen Z vernacular and modern slang.', tech: ['JavaScript', 'NLP', 'Java', 'PostgreSQL'], link: 'https://github.com/YahyaAsmara/genz-translator' },
    { name: '3js_minecraft', description: 'Minecraft-inspired 3D rendering demo built with Three.js.', tech: ['Three.js', 'WebGL'], link: 'https://github.com/YahyaAsmara/3js_minecraft' },
    { name: 'LawHub', description: 'Legal research and document tooling platform.', tech: ['HTML', 'CSS', 'JavaScript'], link: 'https://github.com/YahyaAsmara/LawHub' },
    { name: 'DICOM', description: 'Medical imaging tools around the DICOM format.', tech: ['Python', 'Medical Imaging', 'AWS'], link: 'https://github.com/YahyaAsmara/DICOM' },
    { name: 'hamlet', description: 'A project named Hamlet made in high school.', tech: ['HTML', 'CSS', 'JavaScript'], link: 'https://github.com/YahyaAsmara/hamlet' },
    { name: 'Hackountant', description: 'Account application for Calgary Hacks 2024.', tech: ['Java'], link: 'https://github.com/ShakH00/Hackountant' },
  ];

  const workingOn = [
    { name: 'high-fidelity-agriculture-simulation', description: 'farm', link: 'https://github.com/YahyaAsmara/high-fidelity-agriculture-simulation' },
    { name: 'energy-simulation', description: 'raspberry pi energy', link: 'https://github.com/YahyaAsmara/energy-simulation' },
    { name: 'mining-platform', description: 'real mining', link: 'https://github.com/YahyaAsmara/mining-platform' },
    { name: 'calgary-crime-analysis', description: 'data w/ sql', link: 'https://github.com/YahyaAsmara/calgary-crime-analysis' },
    { name: 'staircases', description: 'c sharp game', link: 'https://github.com/YahyaAsmara/Staircases' },
  ];

  const sections = ['home', 'about', 'experiences', 'projects', 'contact'];
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

    // Exact aliases
    const aliasMap = {
      home: ['home', 'top', 'start', 'root', 'index'],
      about: ['about', 'whoami', 'bio', 'me'],
  experiences: ['experiences', 'experience', 'xp', 'workexp'],
  projects: ['projects', 'project', 'work', 'repo', 'repos', 'portfolio'],
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
            <h1 className={"text-3xl sm:text-5xl md:text-6xl tracking-tight " + (accentKey === 'white' ? 'text-site' : 'text-accent-strong')}>yahya asmara</h1>
            <p className={"text-xs sm:text-sm md:text-base mt-3 " + (accentKey === 'white' ? 'text-site opacity-80' : 'text-accent-strong opacity-80')}>cs @ university of calgary · full‑stack · three.js</p>
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
          <h2 className={"text-base md:text-lg mb-8 md:mb-12 " + (accentKey === 'white' ? 'text-site' : 'text-accent-strong')}>about</h2>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-stretch">
            <div className="order-2 md:order-1">
              <div className="bg-black/40 border border-accent-25 rounded p-5 md:p-7 leading-relaxed text-site">
                <pre className="whitespace-pre-wrap text-xs md:text-sm">{`// hello, i'm yahya
// i build minimalist interfaces and playful 3d experiments.
stack = ['react', 'three.js', 'python', 'java', 'c']
interests = ['embedded', 'graphics', 'data']`}</pre>
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
        <div className="max-w-6xl mx-auto">
          <h2 className={"text-base md:text-lg mb-6 md:mb-8 " + (accentKey === 'white' ? 'text-site' : 'text-accent-strong')}>experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-black/40 border border-accent-25 rounded p-4 md:p-5">
              <h3 className="text-sm text-[#e8f5fc] mb-1">Experience Ventures × Building Bridges (TIES), University of Calgary</h3>
              <p className="text-[11px] text-[#e8f5fc]/70 mb-2">Dec 2024 – Mar 2025</p>
              <ul className="text-[11px] text-[#e8f5fc]/80 space-y-1 list-disc pl-4">
                <li>Worked with 34+ businesses across B2B/B2C/SaaS/PaaS; sharpened venture strategy.</li>
                <li>Built a searchable business directory to streamline stakeholder communication.</li>
                <li>Collaborated with peers to deliver insights and expand partner networks.</li>
              </ul>
            </div>
            <div className="bg-black/40 border border-accent-25 rounded p-4 md:p-5">
              <h3 className="text-sm text-[#e8f5fc] mb-1">Academic Tutor, EducationWise Inc. — Calgary, AB</h3>
              <p className="text-[11px] text-[#e8f5fc]/70 mb-2">May 2024 – Present</p>
              <ul className="text-[11px] text-[#e8f5fc]/80 space-y-1 list-disc pl-4">
                <li>Delivered CS instruction using evidence-based methods across multiple languages.</li>
                <li>Designed study strategies leading to measurable gains in test scores and outcomes.</li>
              </ul>
            </div>
            <div className="bg-black/40 border border-accent-25 rounded p-4 md:p-5">
              <h3 className="text-sm text-[#e8f5fc] mb-1">ICT Internship Program, CAREERS</h3>
              <p className="text-[11px] text-[#e8f5fc]/70">Jul 2022 – Aug 2022</p>
            </div>
          </div>
        </div>
      </section>

      {/* projects */}
      <section id="projects" className="py-20 md:py-36 px-5 md:px-8 bg-black/30 border-y border-accent-20">
        <div className="max-w-6xl mx-auto">
          <h2 className={"text-base md:text-lg mb-10 " + (accentKey === 'white' ? 'text-site' : 'text-accent-strong')}>projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => (
              <div key={project.name} className="bg-black/40 border border-accent-25 p-5 md:p-6 rounded hover:border-accent-40 transition-colors">
                <h3 className="text-sm md:text-base text-[#ffe5d6] mb-2 tracking-wide">{project.name}</h3>
                <p className="text-[#ffe5d6]/80 mb-3 text-xs leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tech.map((tech) => (
                    <span key={tech} className="text-[10px] chip-accent border px-2 py-0.5 rounded">{tech}</span>
                  ))}
                </div>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs border-b border-accent-40 hover:border-accent-70 text-[#ffe5d6]">View Project →</a>
              </div>
            ))}
          </div>
          <h3 className={"text-sm md:text-base mt-10 md:mt-16 mb-4 md:mb-6 " + (accentKey === 'white' ? 'text-site' : 'text-accent-strong')}>working on</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingOn.map((project) => (
              <a key={project.name} href={project.link} target="_blank" rel="noopener noreferrer" className="bg-black/40 border border-accent-25 rounded p-4 hover:border-accent-40 transition-all duration-300">
                <h4 className="text-xs text-[#ffe5d6] truncate mb-1">{project.name}</h4>
                <p className="text-[11px] text-[#ffe5d6]/70 leading-relaxed">{project.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="py-20 md:py-36 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={"text-base md:text-lg mb-8 " + (accentKey === 'white' ? 'text-site' : 'text-accent-strong')}>contact</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
            <a href="mailto:yahya16005@gmail.com" className="text-xs md:text-sm border-b border-accent-40 hover:border-accent-70 text-[#ffe5d6]">Email</a>
            <a href="https://github.com/YahyaAsmara" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm border-b border-accent-40 hover:border-accent-70 text-[#ffe5d6]">GitHub</a>
            <a href="https://linkedin.com/in/yahya-asmara" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm border-b border-accent-40 hover:border-accent-70 text-[#ffe5d6]">LinkedIn</a>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 md:py-16 px-6 border-t border-accent-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[11px] text-[#ffe5d6]/60">© 2025 yahya asmara — react • three.js</p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;