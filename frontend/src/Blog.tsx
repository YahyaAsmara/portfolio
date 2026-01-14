import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const Blog: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-content">
          <h1 className="name">yahya asmara</h1>
          <p className="title">computer science</p>
          <p className="location">calgary, canada</p>
          
          <nav className="nav">
            <Link to="/">home</Link>
            <Link to="/blog" className="active">blog</Link>
          </nav>

          <div className="social-links">
            <a href="https://github.com/YahyaAsmara" target="_blank" rel="noopener noreferrer">
              github
            </a>
            <a href="https://linkedin.com/in/yahya-asmara" target="_blank" rel="noopener noreferrer">
              linkedin
            </a>
            <a href="mailto:yahya16005@gmail.com">
              email
            </a>
          </div>

          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? 'light' : 'dark'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <section className="section">
          <h2>blog</h2>
          <div className="construction-notice">
            <p>🚧 under construction 🚧</p>
            <p className="construction-sub">coming soon with thoughts on systems, projects, and other stuff.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Blog;
