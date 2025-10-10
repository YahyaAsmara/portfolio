import React, { useEffect, useRef, useState } from 'react';

// Minimal Linux-like terminal window used in the hero
export default function TerminalWindow({ onCommand }) {
  const [lines, setLines] = useState([
    'welcome to asmara.dev — minimal linux + three.js',
    'type `help` or click a command below',
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

    const out = map[trim] || ["command not found. try 'help'"];
    setLines(prev => [...prev, ...out]);
    // forward all non-clear commands so aliases can be resolved upstream
    onCommand?.(trim);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-lg border border-[#74b0d6]/25 bg-black/70 backdrop-blur-md shadow-[0_0_40px_rgba(116,176,214,.10)] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#74b0d6]/20 text-xs text-[#cfe6f3]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
          <span className="ml-2">terminal — bash</span>
        </div>
  <div ref={logsRef} className="p-5 md:p-7 font-mono text-[12px] md:text-sm leading-relaxed text-[#e8f5fc] min-h-[260px] max-h-[55vh] overflow-auto">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">{l}</div>
          ))}
          <div />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); run(input); }}
          className="flex items-center gap-2 px-5 md:px-7 py-4 border-t border-[#74b0d6]/20"
        >
          <span className="text-[#74b0d6] font-mono text-xs md:text-sm select-none">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#e8f5fc] placeholder-[#74b0d6]/40 font-mono text-xs md:text-sm"
            placeholder="type a command and press enter"
          />
          <button
            type="submit"
            className="text-[#000000] bg-[#74b0d6] hover:bg-[#8dc0de] transition-colors rounded px-3 py-1.5 text-xs md:text-sm"
          >run</button>
        </form>

        <div className="flex flex-wrap gap-2 px-5 md:px-7 py-4 text-[11px] md:text-xs border-t border-[#74b0d6]/20">
          {['help', 'home', 'about', 'experiences', 'projects', 'contact', 'clear'].map(c => (
            <button
              key={c}
              onClick={() => run(c)}
              className="px-2.5 py-1.5 rounded bg-[#74b0d6]/10 hover:bg-[#74b0d6]/15 text-[#cfe6f3] border border-[#74b0d6]/25"
            >{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
