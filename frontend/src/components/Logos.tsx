import React from 'react';

// All marks are monochrome and inherit `currentColor`, so they render pure
// white on the dark background. Where a logo needs an internal "cut-out"
// (e.g. overlapping shapes), the cut uses var(--bg-primary) to read as negative
// space against the page.

type LogoProps = {
  className?: string;
  title?: string;
};

const base = (title?: string) => ({
  viewBox: '0 0 24 24',
  width: '100%',
  height: '100%',
  role: 'img' as const,
  'aria-label': title,
  'aria-hidden': title ? undefined : true,
});

// Symend — supplied brand icon, processed to white-on-transparent.
export const SymendLogo: React.FC<LogoProps> = ({ className, title = 'Symend' }) => (
  <img src="/assets/symend-icon.png" alt={title} className={className} />
);

// Canadian Sheep Federation — woolly sheep in profile.
export const CsfLogo: React.FC<LogoProps> = ({ className, title = 'Canadian Sheep Federation' }) => (
  <svg
    {...base(title)}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* woolly back */}
    <path d="M5.5 13a2.6 2.6 0 0 1-1.2-4.9A2.6 2.6 0 0 1 8 4.8a2.7 2.7 0 0 1 5.1.2 2.6 2.6 0 0 1 4.6 1.7 2.6 2.6 0 0 1 .6 5.1" />
    {/* underbelly + head */}
    <path d="M5.5 13c.4 2 3 3.2 6.2 3.2 2.4 0 4.2-.7 5.2-1.9" />
    <path d="M17.4 12.8c1.4.2 2.3 1 2.3 2.1 0 .9-.7 1.5-1.6 1.5-.8 0-1.4-.5-1.4-1.3" />
    {/* eye */}
    <circle cx="18" cy="14.4" r="0.6" fill="currentColor" stroke="none" />
    {/* legs */}
    <path d="M8.5 16.4V19M14 16.4V19" />
  </svg>
);

// Code the Change YYC — keycap with an "@" whose centre is a heart.
export const CtcLogo: React.FC<LogoProps> = ({ className, title = 'Code the Change YYC' }) => (
  <svg
    {...base(title)}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" />
    {/* @ ring, open on the lower-right with a short tail */}
    <path d="M15.1 16.2a5.2 5.2 0 1 1 2.1-4.2c0 1.6-.7 2.7-2 2.7-1 0-1.5-.8-1.5-1.9" />
    {/* heart at centre */}
    <path
      d="M12 14.2c-2.1-1.5-3.2-2.5-3.2-3.9 0-1 .8-1.7 1.7-1.7.7 0 1.2.4 1.5.9.3-.5.8-.9 1.5-.9.9 0 1.7.7 1.7 1.7 0 1.4-1.1 2.4-3.2 3.9Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

// EducationWise — two figures sprouting leaves above an open book.
export const EducationWiseLogo: React.FC<LogoProps> = ({ className, title = 'EducationWise' }) => (
  <svg
    {...base(title)}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* open book */}
    <path d="M12 14.2c-2.2-1.2-5-1.2-7.5 0v6c2.5-1.2 5.3-1.2 7.5 0 2.2-1.2 5-1.2 7.5 0v-6c-2.5-1.2-5.3-1.2-7.5 0Z" />
    <path d="M12 14.2v6" />
    {/* growth / figures */}
    <path d="M12 11.8V7.4" />
    <circle cx="12" cy="5.6" r="1.7" fill="currentColor" stroke="none" />
    {/* leaves */}
    <path d="M12 9.6c-1.3.1-2.6-.6-3.1-2 1.3-.1 2.6.6 3.1 2Z" fill="currentColor" stroke="none" />
    <path d="M12 9.6c1.3.1 2.6-.6 3.1-2-1.3-.1-2.6.6-3.1 2Z" fill="currentColor" stroke="none" />
  </svg>
);

// University of Calgary — supplied lockup, cropped to the crest and recoloured
// white-on-transparent.
export const UCalgaryLogo: React.FC<LogoProps> = ({ className, title = 'University of Calgary' }) => (
  <img src="/assets/uofc-crest.png" alt={title} className={className} />
);

// CAREERS — radiating sunburst (~290°) open at the upper-right, where a solid
// triangle sits. Lines are generated around the circle, skipping that sector.
export const CareersLogo: React.FC<LogoProps> = ({ className, title = 'CAREERS' }) => {
  const cx = 12;
  const cy = 12;
  const rIn = 5.4;
  const rOut = 11;
  const lines = [];
  for (let a = 80; a <= 370; a += 8.5) {
    const rad = (a * Math.PI) / 180;
    lines.push(
      <line
        key={a}
        x1={cx + rIn * Math.cos(rad)}
        y1={cy - rIn * Math.sin(rad)}
        x2={cx + rOut * Math.cos(rad)}
        y2={cy - rOut * Math.sin(rad)}
      />,
    );
  }
  return (
    <svg {...base(title)} className={className} fill="none" stroke="currentColor" strokeWidth={0.95} strokeLinecap="round">
      <g>{lines}</g>
      <path d="M16 2.8 21.6 11.4 11.6 11.4Z" fill="currentColor" stroke="none" />
    </svg>
  );
};

// ---- Contact / social icons ----

export const GithubIcon: React.FC<LogoProps> = ({ className, title = 'GitHub' }) => (
  <svg {...base(title)} className={className} fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export const LinkedinIcon: React.FC<LogoProps> = ({ className, title = 'LinkedIn' }) => (
  <svg {...base(title)} className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const MailIcon: React.FC<LogoProps> = ({ className, title = 'Email' }) => (
  <svg {...base(title)} className={className} fill="currentColor">
    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm2.4-.2L12 11l7.6-5.2a.6.6 0 0 0-.3-.1H4.7a.6.6 0 0 0-.3.1ZM20 7.7l-7.4 5.1a1 1 0 0 1-1.2 0L4 7.7V18h16V7.7Z" />
  </svg>
);
