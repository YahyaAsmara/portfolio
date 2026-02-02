import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import RollingGallery from './RollingGallery';

interface Project {
  title: string;
  description: string;
  tech: string[];
  link: string;
  year: string;
}

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'projects'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const projects: Project[] = [
    {
      title: 'Orbis',
      description: 'Full-stack web-based navigation system for fictional worlds inspired by Google Maps. Built with React SPA frontend, Leaflet.js, Flask RESTful API, and PostgreSQL. Features A* pathfinding with multi-modal transport route planning.',
      tech: ['TypeScript', 'React', 'Python', 'Flask', 'PostgreSQL', 'Supabase'],
      link: 'https://github.com/YahyaAsmara/orbis',
      year: '2025',
    },
    {
      title: 'Gen Z to Human Translator',
      description: 'End-to-end Gen Z slang translator with a React/Tailwind UI, Spring Boot API, and Dockerized PostgreSQL. Supports JWT-authenticated personas plus live "vibes" and "remix" sharing.',
      tech: ['React', 'Tailwind', 'Spring Boot', 'PostgreSQL', 'Docker', 'JWT'],
      link: 'https://github.com/YahyaAsmara/genz-translator',
      year: '2025',
    },
    {
      title: 'Invasion of the Blobs',
      description: 'Low-level C drivers for SPI communication on Raspberry Pi, interfacing with MCP3008 ADC and MCP23S08 GPIO expander. Engineered bidirectional communication pipeline with UART serial transmission and Python parsing.',
      tech: ['C', 'Python', 'PySerial', 'UART', 'SPI', 'Raspberry Pi'],
      link: 'https://github.com/YahyaAsmara/invasion-of-the-blobs',
      year: '2025',
    },
    {
      title: 'DICOM to NIfTI Converter',
      description: 'End-to-end medical imaging pipeline converting DICOM to NIfTI format, processing 100+ datasets with AWS S3 cloud storage. Interactive Streamlit dashboard with 3D rendering and HIPAA-compliant privacy.',
      tech: ['Python', 'AWS S3', 'boto3', 'Streamlit'],
      link: 'https://github.com/YahyaAsmara/DICOM',
      year: '2024',
    },
    {
      title: 'Experience Ventures Business Directory',
      description: 'Collaborated with 34+ businesses from the Building Bridges (TIES) entrepreneurial alumni program, analyzing B2B, B2C, SaaS, and PaaS models.',
      tech: ['Data Management', 'Business Analysis'],
      link: 'https://github.com/YahyaAsmara/experience-ventures-directory',
      year: '2024',
    },
    {
      title: '3js Minecraft',
      description: 'Minecraft-inspired 3D rendering demo built with Three.js and WebGL. Procedural terrain generation with interactive block placement.',
      tech: ['Three.js', 'WebGL', 'JavaScript'],
      link: 'https://github.com/YahyaAsmara/3js_minecraft',
      year: '2024',
    },
    {
      title: 'Calgary Crime Analysis',
      description: 'SQL and data visualization pipeline exploring Calgary crime trends with interactive charts and geospatial mapping.',
      tech: ['Python', 'SQL', 'Pandas', 'Data Viz'],
      link: 'https://github.com/YahyaAsmara/calgary-crime-analysis',
      year: '2024',
    },
  ];

  const skills = {
    languages: ['Java', 'Python', 'C', 'C++', 'C#', 'SQL', 'JavaScript', 'HTML/CSS', 'R', 'PHP', 'Haskell', 'Prolog'],
    frameworks: ['TypeScript/React', 'Next/Node.js', 'SpringBoot', 'Flask', 'JUnit', 'FastAPI'],
    tools: ['AWS', 'Git', 'Vercel', 'Render', 'Docker', 'MySQL', 'PowerBI', 'VS Code', 'PyCharm', 'IntelliJ'],
  };

  return (
    <div className="app">
      <div className="app-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
        <div className="sidebar-content">
          <h1 className="name">yahya asmara</h1>
          <p className="title">computer science</p>
          <p className="location">calgary, canada</p>
          
          <nav className="nav">
            <a 
              href="#about" 
              className={activeSection === 'about' ? 'active' : ''}
              onClick={() => setActiveSection('about')}
            >
              about
            </a>
            <a 
              href="#experience" 
              className={activeSection === 'experience' ? 'active' : ''}
              onClick={() => setActiveSection('experience')}
            >
              experience
            </a>
            <a 
              href="#projects" 
              className={activeSection === 'projects' ? 'active' : ''}
              onClick={() => setActiveSection('projects')}
            >
              projects
            </a>
            <Link to="/blog" className="nav-blog">
              blog
            </Link>
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
      <div className="sidebar-spacer"></div>

      {/* Main Content */}
      <main className="main-content">
        <section id="about" className="section">
          <h2>about</h2>
          <p>
            I'm a Computer Science student at the University of Calgary with a passion for building 
            systems from low-level hardware to full-stack applications. Currently in my third year, I enjoy learning new technologies
            while exploring everything from embedded systems to cloud infrastructure.
          </p>
          <p>
            My work spans hardware interfacing with C, full-stack web development with TypeScript and React, 
            and cloud architecture with AWS. I'm particularly interested in systems programming, data pipelines, 
            and the intersection of software and hardware. Outside of coding, I love hiking, photography, and badminton.
          </p>
          <p>
            Currently enrolled in CPSC 526 and 411 for the Winter semester, I am expanding my knowledge in computer network systems security and compiler construction.
          </p>

          <div className="gallery-container">
            <RollingGallery autoplay={true} pauseOnHover={false} />
          </div>

          <div className="skills-section">
            <h3>technical skills</h3>
            <div className="skills-minimal">
              <div className="skill-line">
                <span className="skill-label">languages</span>
                <span className="skill-list">{skills.languages.join(' · ')}</span>
              </div>
              <div className="skill-line">
                <span className="skill-label">frameworks</span>
                <span className="skill-list">{skills.frameworks.join(' · ')}</span>
              </div>
              <div className="skill-line">
                <span className="skill-label">tools</span>
                <span className="skill-list">{skills.tools.join(' · ')}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <h2>experience</h2>
          
          <div className="experience-item">
            <div className="experience-header">
              <h3>Student Software Developer</h3>
              <span className="date">Oct 2025 - Present</span>
            </div>
            <p className="company">
              <a href="https://github.com/Code-the-Change-YYC" target="_blank" rel="noopener noreferrer">
                Code the Change YYC
              </a> • Calgary, AB
            </p>
            <ul>
                <li>
                    working on the hackathon management tool
                </li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3>Software Developer and Tutor</h3>
              <span className="date">May 2024 - Present</span>
            </div>
            <p className="company">EducationWise Inc. • Calgary, AB</p>
            <ul>
              <li>delivering specialized cs instruction with evidence-based pedagogy across multiple languages</li>
              <li>designing ai workflows using internal tools that measurably lift test scores and long-term academic performance</li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3>Product Development</h3>
              <span className="date">Dec 2024 - Mar 2025</span>
            </div>
            <p className="company">Experience Ventures • UCalgary</p>
            <ul>
              <li>partnered with 34+ building bridges (ties) ventures across b2b/b2c/saas/paas models</li>
              <li>correlated insights into a living business directory that accelerated stakeholder communication</li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3>ICT Intern</h3>
              <span className="date">Jul 2022 - Aug 2022</span>
            </div>
            <p className="company">CAREERS • Internship Program</p>
            <ul>
              <li>rotational internship exploring ict support and emerging tech exposure</li>
            </ul>
          </div>

          <div className="education">
            <h3>education</h3>
            <div className="education-item">
              <div className="education-header">
                <h4>University of Calgary</h4>
                <span className="date">Sep 2023 - Present</span>
              </div>
              <p>Bachelor of Science, Computer Science</p>
              <p className="courses">
                Relevant Courses: Computer Networks, Database Management Systems, 
                Introduction to Software Engineering, Computing Machinery I & II, 
                Explorations in AI and Machine Learning
              </p>
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <h2>projects</h2>
          
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-header">
                  <h3>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      {project.title}
                    </a>
                  </h3>
                  <span className="project-year">{project.year}</span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map(tech => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="more-github">
            more on <a href="https://github.com/YahyaAsmara" target="_blank" rel="noopener noreferrer">github</a>
          </p>
        </section>

        <footer className="footer">
          <p>© 2026 Yahya Asmara</p>
        </footer>
      </main>
      </div>
    </div>
  );
};

export default App;
