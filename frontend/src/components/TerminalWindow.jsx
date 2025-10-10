import React, { useEffect, useRef, useState } from 'react';

// Minimal Linux-like terminal window used in the hero
export default function TerminalWindow({ onCommand }) {
  const [lines, setLines] = useState([
    'welcome to asmara.dev — minimal linux + three.js',
    'type `help` or click a command below',
    'tip: theme <red|blue|green|yellow|peach|black|white>',
  ]);
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState('ya@asmara:~$');
  const endRef = useRef(null); // kept for potential future use
  const logsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // keep terminal log scrolled without moving the page
    const el = logsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    // autofocus input on mount
    try {
      inputRef.current?.focus({ preventScroll: true });
    } catch {
      inputRef.current?.focus();
    }
  }, []);

  const run = (cmd) => {
    const trim = cmd.trim();
    if (!trim) return;
    setLines(prev => [...prev, `${prompt} ${trim}`]);
    setInput('');

    const map = {
      help: [
        'commands:',
        '  home    — back to top',
        '  about   — who am i',
        '  experiences — brief roles',
        '  projects— selected repos',
        '  contact — get in touch',
        '  theme <color> — switch accent color',
        '  clear   — clear terminal',
      ],
      about: ['navigating to section: about…'],
      experiences: ['navigating to section: experiences…'],
      projects: ['navigating to section: projects…'],
      contact: ['navigating to section: contact…'],
      home: ['navigating to section: home…'],
      clear: ['[screen cleared]'],
    };

    if (trim === 'clear') {
      setLines([]);
      return;
    }

    // Suppress 'not found' for theme commands so App can handle them cleanly
    if (/^(theme|color|accent)(\s+(red|blue|green|yellow|peach|black|white))?$/i.test(trim)) {
      // Show a friendly echo only when color is provided
      const m = trim.toLowerCase().match(/^(theme|color|accent)\s+(red|blue|green|yellow|peach|black|white)$/);
      if (m) {
        setLines(prev => [...prev, `switching theme to ${m[2]}…`]);
      }
      onCommand?.(trim);
      return;
    }

    const out = map[trim] || ["command not found. try 'help'"];
    setLines(prev => [...prev, ...out]);
    // forward all non-clear commands so aliases can be resolved upstream
    onCommand?.(trim);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-lg border border-accent-25 bg-terminal backdrop-blur-md shadow-accent overflow-hidden">
  <div className="flex items-center gap-2 px-3 py-2 border-b border-accent-20 text-xs text-terminal">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
          <span className="ml-2">terminal — bash</span>
        </div>
  <div ref={logsRef} className="p-5 md:p-7 font-mono text-[12px] md:text-sm leading-relaxed text-terminal min-h-[260px] max-h-[55vh] overflow-auto">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">{l}</div>
          ))}
          <div />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); run(input); }}
          className="flex items-center gap-2 px-5 md:px-7 py-4 border-t border-accent-20"
        >
          <span className="text-accent font-mono text-xs md:text-sm select-none">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-terminal placeholder-[#94a3b8] font-mono text-xs md:text-sm"
            placeholder="type a command and press enter"
          />
          <button
            type="submit"
            className="btn-accent transition-colors rounded px-3 py-1.5 text-xs md:text-sm"
          >run</button>
        </form>

  <div className="flex flex-wrap gap-2 px-5 md:px-7 py-4 text-[11px] md:text-xs border-t border-accent-20 text-terminal">
          {['help', 'home', 'about', 'experiences', 'projects', 'contact', 'clear'].map(c => (
            <button
              key={c}
              onClick={() => run(c)}
              className="px-2.5 py-1.5 rounded bg-accent-10 hover:bg-accent-15 text-[#cfe6f3] border border-accent-25"
            >{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
