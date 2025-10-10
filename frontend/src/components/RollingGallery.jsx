import React from 'react';

// Minimal rolling gallery (pure CSS animation) — two tracks for seamless looping
// Pass an array of image URLs; duplicates are used to create infinite scroll illusion
export default function RollingGallery({ images = [], height = 200, speed = 40 }) {
  const list = images.length ? images : [
    // Placeholders
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop', // pink sky
    'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1400&auto=format&fit=crop', // blue/orange sky
    'https://images.unsplash.com/photo-1450849608880-6f787542c88a?q=80&w=1400&auto=format&fit=crop', // night sky with stars
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Calgary_Skyline_2023.jpg', // Calgary city (Wikimedia)
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1400&auto=format&fit=crop', // space
    'https://i.imgflip.com/30b1gx.jpg', // meme
  ];

  const trackStyle = {
    '--rg-height': `${height}px`,
    '--rg-duration': `${speed}s`,
  };

  const row = (offset = 0) => (
    <div className="rg-track" style={{ animationDelay: `${offset}s` }}>
      {list.concat(list).map((src, i) => (
        <div key={`${offset}-${i}`} className="rg-item">
          <img src={src} alt="gallery" loading="lazy" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="rg-wrap" style={trackStyle}>
      {row(0)}
      {row(speed / 2)}
    </div>
  );
}
