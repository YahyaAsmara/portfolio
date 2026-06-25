import React from 'react';
import './App.css';
import RollingGallery from './RollingGallery';
import {
  SymendLogo,
  CsfLogo,
  CtcLogo,
  EducationWiseLogo,
  UCalgaryLogo,
  CareersLogo,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
} from './components/Logos';

interface Experience {
  title: string;
  company: string;
  date: string;
  Logo: React.FC<{ className?: string }>;
  link?: string;
  tag?: 'Full-time' | 'Part-time' | 'Volunteer';
}

const experience: Experience[] = [
  {
    title: 'AI Engineer Intern',
    company: 'Symend',
    date: 'Jun 2026 — Present',
    Logo: SymendLogo,
    link: 'https://www.symend.com/',
    tag: 'Full-time',
  },
  {
    title: 'Software Developer Intern',
    company: 'Canadian Sheep Federation',
    date: 'Jun 2026 — Present',
    Logo: CsfLogo,
    link: 'https://www.cansheep.ca/',
    tag: 'Part-time',
  },
  {
    title: 'Software Developer',
    company: 'Code the Change YYC',
    date: 'Oct 2025 — Present',
    Logo: CtcLogo,
    link: 'https://www.codethechangeyyc.ca/',
    tag: 'Volunteer',
  },
  {
    title: 'Software Developer & Tutor',
    company: 'EducationWise Inc.',
    date: 'May 2024 — Present',
    Logo: EducationWiseLogo,
    link: 'https://www.educationwisetutors.ca/',
    tag: 'Part-time',
  },
  {
    title: 'Product Development',
    company: 'Experience Ventures × TIES',
    date: 'Dec 2024 — Mar 2025',
    Logo: UCalgaryLogo,
    link: 'https://www.ucalgary.ca/hunter-hub/programs/powered-hunter-hub/experienceventures',
  },
  {
    title: 'ICT Intern',
    company: 'CAREERS',
    date: 'Jul 2022 — Aug 2022',
    Logo: CareersLogo,
    link: 'https://www.careersnextgen.ca/get-an-internship/',
  },
];

const App: React.FC = () => {
  return (
    <div className="app">
      <main className="layout">
        <div className="col-left">
          <header className="intro">
            <h1 className="name">yahya asmara</h1>
            <p className="title">studying computer science</p>
            <p className="location">based in calgary, canada · from kagoshima, japan / depok, indonesia</p>
            <p className="about">"an agent is a wish that learned to act."</p>

            <div className="contact">
              <a
                href="https://github.com/YahyaAsmara"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="contact-icon"
              >
                <GithubIcon />
              </a>
              <a
                href="https://linkedin.com/in/yahya-asmara"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="contact-icon"
              >
                <LinkedinIcon />
              </a>
              <a href="mailto:yahya16005@gmail.com" aria-label="Email" className="contact-icon">
                <MailIcon />
              </a>
            </div>
          </header>

          <section className="experience" aria-label="Experience">
            <ul className="exp-list">
              {experience.map(({ title, company, date, Logo, link, tag }) => (
                <li key={title + company} className="exp-item">
                  <span className="exp-logo">
                    <Logo />
                  </span>
                  <span className="exp-body">
                    <span className="exp-title">
                      {title}
                      {tag && <span className={`exp-tag exp-tag--${tag.toLowerCase()}`}>{tag}</span>}
                    </span>
                    <span className="exp-company">
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {company}
                        </a>
                      ) : (
                        company
                      )}
                    </span>
                  </span>
                  <span className="exp-date">{date}</span>
                </li>
              ))}

              <li className="exp-item exp-item--edu">
                <span className="exp-logo">
                  <UCalgaryLogo />
                </span>
                <span className="exp-body">
                  <span className="exp-title">Bachelor of Science</span>
                  <span className="exp-company">University of Calgary · Computer Science · Co-op</span>
                </span>
                <span className="exp-date">2023 — Present</span>
              </li>
            </ul>

            <div className="clubs">
              <span className="clubs-label">clubs</span>
              <span className="clubs-list">
                Code the Change YYC · Agentic Engineering Club · IEEE UCalgary Chapter
              </span>
            </div>
          </section>
        </div>

        <div className="col-right">
          <div className="gallery-wrap">
            <RollingGallery autoplay={true} pauseOnHover={false} />
          </div>

          <a
            className="projects-link"
            href="https://github.com/YahyaAsmara"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="projects-icon">
              <GithubIcon />
            </span>
            projects on github
          </a>
        </div>
      </main>
    </div>
  );
};

export default App;
