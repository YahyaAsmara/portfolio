import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import ModelViewer from './components/ModelViewer';

// 3D Scene Components
const FloatingCube = ({ position, color = '#4F46E5' }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Box ref={meshRef} position={position} args={[1, 1, 1]} castShadow>
      <meshStandardMaterial color={color} />
    </Box>
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <FloatingCube position={[-4, 2, -2]} color="#4F46E5" />
      <FloatingCube position={[4, 1, -3]} color="#06B6D4" />
      <FloatingCube position={[0, -1, -4]} color="#10B981" />
      
      <Plane 
        position={[0, -2, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        args={[20, 20]} 
        receiveShadow
      >
        <meshStandardMaterial color="#111827" />
      </Plane>
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main Portfolio Component
const Portfolio = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const projects = [
    {
      name: "Project Alpha",
      description: "A minimal web application built with React and Node.js",
      tech: ["React", "Node.js", "MongoDB"],
      link: "https://github.com/YahyaAsmara"
    },
    {
      name: "Project Beta", 
      description: "Mobile-first responsive design with modern UI patterns",
      tech: ["Vue.js", "Tailwind", "Firebase"],
      link: "https://github.com/YahyaAsmara"
    },
    {
      name: "Project Gamma",
      description: "Data visualization dashboard with real-time updates",
      tech: ["D3.js", "Python", "PostgreSQL"],
      link: "https://github.com/YahyaAsmara"
    }
  ];

  const sections = ['Home', 'About', 'Projects', 'Contact'];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-extralight">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-nunito overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-extralight">YA</div>
          <div className="flex gap-8">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => setCurrentSection(index)}
                className={`text-sm font-extralight transition-colors ${
                  currentSection === index ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Scene3D />
          </Canvas>
        </div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl font-extralight mb-4">
            Yahya Asmara
          </h1>
          <p className="text-xl md:text-2xl font-extralight text-gray-300 mb-8">
            Computer Science @ University of Calgary
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="https://github.com/YahyaAsmara" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 hover:border-white/40 transition-colors font-extralight"
            >
              GitHub
            </a>
            <button 
              onClick={() => setCurrentSection(3)}
              className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 transition-colors font-extralight"
            >
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extralight mb-12 text-center">About</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg font-extralight text-gray-300 leading-relaxed mb-6">
                I'm a full stack developer passionate about creating digital experiences that blend functionality with aesthetic appeal. 
                My work focuses on clean, minimal design paired with robust technical implementation.
              </p>
              <p className="text-lg font-extralight text-gray-300 leading-relaxed">
                Currently exploring the intersection of web technologies and 3D graphics to create immersive, 
                interactive experiences.
              </p>
            </div>
            <div className="flex justify-center">
              <ModelViewer
                url="frontend/src/assets/space_boi.glb"
                width={350}
                height={350}
                autoRotate={true}
                environmentPreset="sunset"
                showScreenshotButton={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-6 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extralight mb-12 text-center">Projects</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={project.name} className="bg-gray-800/50 p-6 hover:bg-gray-800/70 transition-colors">
                <h3 className="text-xl font-extralight mb-3">{project.name}</h3>
                <p className="text-gray-300 font-extralight mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map(tech => (
                    <span key={tech} className="text-xs bg-gray-700 px-2 py-1 font-extralight">
                      {tech}
                    </span>
                  ))}
                </div>
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-extralight border-b border-white/20 hover:border-white/40 transition-colors"
                >
                  View Project →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extralight mb-12">Get in Touch</h2>
          <p className="text-lg font-extralight text-gray-300 mb-8 leading-relaxed">
            Interested in collaborating or have a project in mind? Let's create something amazing together.
          </p>
          <div className="flex justify-center gap-8">
            <a 
              href="mailto:hello@example.com" 
              className="text-lg font-extralight border-b border-white/20 hover:border-white/40 transition-colors"
            >
              Email
            </a>
            <a 
              href="https://github.com/YahyaAsmara" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-extralight border-b border-white/20 hover:border-white/40 transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://linkedin.com/in/yahya-asmara" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-extralight border-b border-white/20 hover:border-white/40 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-extralight text-gray-400">
            © 2025 Yahya Asmara. Crafted with React & Three.js
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;