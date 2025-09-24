import React, { useState, useEffect, useRef } from 'react';
// using raw three.js in Scene3D, remove react-three-fiber/drei imports
import * as THREE from 'three';
import ModelViewer from './components/ModelViewer';

// Scene3D is implemented with plain three.js below




function Scene3D({ isHome }) {
  const mountRef = useRef(null);
  const controlsRef = useRef({ enabled: false });
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    // Guard against zero sizes (server-side render or hidden containers)
    const mountWidth = mount.clientWidth || window.innerWidth || 800;
    const mountHeight = mount.clientHeight || window.innerHeight || 600;
    const camera = new THREE.PerspectiveCamera(75, mountWidth / mountHeight, 0.1, 2000);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Ensure renderer canvas fills the mount element
    renderer.setSize(mountWidth, mountHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    // Ensure the mount has relative positioning and 100% size so absolute inset works
    if (!mount.style.position) mount.style.position = 'relative';
    if (!mount.style.width) mount.style.width = '100%';
    if (!mount.style.height) mount.style.height = '100%';
    mount.appendChild(renderer.domElement);

    // overlay UI is React-controlled (see JSX) — no DOM overlay appended here

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    // Stars
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- Sun ---
    const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd66 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-120, 40, -300);
    scene.add(sun);
    const sunLight = new THREE.PointLight(0xffddaa, 1.4, 1000);
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    // --- Planets ---
    const planets = [];
    const disposables = [];
    const planetSpecs = [
      { r: 10, orbitRadius: 80, zOffset: -250, color: 0x6699ff, speed: 0.6 },
      { r: 14, orbitRadius: 140, zOffset: -300, color: 0x88cc88, speed: 0.35 },
      { r: 6, orbitRadius: 40, zOffset: -200, color: 0xcc8866, speed: 1.0 }
    ];
    planetSpecs.forEach(spec => {
      const g = new THREE.SphereGeometry(spec.r, 24, 24);
      const m = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.7 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(spec.orbitRadius, 0, spec.zOffset);
      mesh.userData = { angle: Math.random() * Math.PI * 2, speed: spec.speed, orbitRadius: spec.orbitRadius, zOffset: spec.zOffset };
      scene.add(mesh);
      planets.push(mesh);
      disposables.push(g, m);
    });

    // --- Simple spaceship ---
    const ship = new THREE.Group();
    const noseGeo = new THREE.ConeGeometry(3, 8, 12);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.2 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = Math.PI / 2;
    ship.add(nose);
    const finGeo = new THREE.BoxGeometry(1, 2, 4);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x333366 });
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(0, -1.5, -2);
    ship.add(fin);
    ship.position.set(40, 0, -160);
    scene.add(ship);
    disposables.push(noseGeo, noseMat, finGeo, finMat);

    // Movement state
    let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
    let velocity = new THREE.Vector3();
    let direction = new THREE.Vector3();
    let canMove = false;
  let prevTime = performance.now();
    let pitch = 0, yaw = 0;

    // Mouse look
    function onMouseMove(e) {
      if (!controlsRef.current.enabled) return;
      yaw -= e.movementX * 0.002;
      pitch -= e.movementY * 0.002;
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      // Apply rotation via quaternion for more stable camera control
      const quat = new THREE.Quaternion();
      quat.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
      camera.quaternion.copy(quat);
    }

    // Keyboard controls
    function onKeyDown(e) {
      if (!controlsRef.current.enabled) return;
      switch (e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': moveUp = true; break;
        case 'ShiftLeft': moveDown = true; break;
      }
    }
    function onKeyUp(e) {
      if (!controlsRef.current.enabled) return;
      switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
        case 'Space': moveUp = false; break;
        case 'ShiftLeft': moveDown = false; break;
      }
    }

    // Click to enable controls is disabled — activation occurs via button only
    function onClick() {
      // intentionally empty
    }
    function onPointerLockChange() {
      const enabled = document.pointerLockElement === mount;
      controlsRef.current.enabled = enabled;
      setOverlayVisible(!enabled);
    }

  mount.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Animation loop
    let rafId = null;
    function animate() {
      const time = performance.now();
      const delta = (time - prevTime) / 1000;
      prevTime = time;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.y -= velocity.y * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.y = Number(moveUp) - Number(moveDown);
      direction.normalize();

      if (controlsRef.current.enabled) {
        if (moveForward || moveBackward) velocity.z -= direction.z * 50.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 50.0 * delta;
        if (moveUp || moveDown) velocity.y -= direction.y * 50.0 * delta;

        // Move camera in local space
        camera.translateX(velocity.x * delta);
        camera.translateY(velocity.y * delta);
        camera.translateZ(velocity.z * delta);
      } else {
        // when not in pointer-lock, keep a gentle orbit/look for nicer presentation
        // but only adjust look when pointer-lock is not active
        camera.lookAt(scene.position);
      }

      // animate planets if present
      if (typeof planets !== 'undefined' && planets.length) {
        planets.forEach(p => {
          p.userData.angle += p.userData.speed * delta;
          const a = p.userData.angle;
          const r = p.userData.orbitRadius;
          p.position.x = Math.cos(a) * r;
          p.position.z = Math.sin(a) * r + p.userData.zOffset;
        });
      }

      // animate ship if present
      if (typeof ship !== 'undefined') {
        ship.position.x = 40 + Math.sin(time * 0.0008) * 30;
        ship.position.y = Math.sin(time * 0.0012) * 6;
        ship.rotation.y += 0.6 * delta;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    // Resize handler
    function handleResize() {
      const w = mount.clientWidth || window.innerWidth || 800;
      const h = mount.clientHeight || window.innerHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // scroll-based badge visibility: only show when on home and within hero viewport
    function handleScrollBadge() {
      const visible = isHome && overlayVisible && window.scrollY < (window.innerHeight * 0.6);
      setShowBadge(visible);
    }
    handleScrollBadge();
    window.addEventListener('scroll', handleScrollBadge, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScrollBadge);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      mount.removeEventListener('click', onClick);
      if (rafId) cancelAnimationFrame(rafId);
      try {
        if (renderer) {
          renderer.forceContextLoss && renderer.forceContextLoss();
          renderer.dispose && renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      } catch (e) {
        // silent dispose errors
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 cursor-pointer"
        title="Click to explore space"
        style={{ outline: 'none' }}
      />

      {/* React-controlled overlay hint */}
      {overlayVisible && (
        <>
          <div className="absolute left-1/2 top-4 transform -translate-x-1/2 text-white px-3 py-2 rounded-md text-sm z-20 backdrop-blur-md bg-white/5 border border-white/10">
            click to explore — wasd to move · space/shift vertical · esc to exit
          </div>

          {/* centered CTA removed per user request */}
        </>
      )}

      {/* Explorer button: appears only in hero area */}
      {showBadge && isHome && (
        <button
          onClick={() => { if (isHome) mountRef.current?.requestPointerLock(); }}
          className="fixed bottom-6 right-6 z-30 px-4 py-3 text-sm text-white rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex items-center gap-2 font-medium"
          aria-label={overlayVisible ? "Exit explore mode" : "Enter explore mode"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
            <path d="M12 2L15 11H9L12 2Z" fill="currentColor" />
          </svg>
          <span className="select-none lowercase">
            {overlayVisible ? "press esc to exit explorer mode" : "explorer"}
          </span>
        </button>
      )}
    </div>
  );
}

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
      name: "genz-translator",
      description: "A translator targeting Gen Z vernacular and modern slang.",
      tech: ["JavaScript", "NLP"],
      link: "https://github.com/YahyaAsmara/genz-translator"
    },
    {
      name: "3js_minecraft",
      description: "Minecraft-inspired 3D rendering demo built with Three.js.",
      tech: ["Three.js", "WebGL"],
      link: "https://github.com/YahyaAsmara/3js_minecraft"
    },
    {
      name: "LawHub",
      description: "Legal research and document tooling platform.",
      tech: ["React", "Python"],
      link: "https://github.com/YahyaAsmara/LawHub"
    },
    {
      name: "DICOM",
      description: "Medical imaging tools around the DICOM format.",
      tech: ["Python", "Medical Imaging"],
      link: "https://github.com/YahyaAsmara/DICOM"
    },
    {
      name: "hamlet",
      description: "A project named Hamlet made in high school.",
      tech: ["Node.js"],
      link: "https://github.com/YahyaAsmara/hamlet"
    },
    {
      name: "Hackountant",
      description: "Account application for Calgary Hacks 2024.",
      tech: ["JavaScript"],
      link: "https://github.com/ShakH00/Hackountant"
    }
  ];

  const workingOn = [
    { 
      name: 'high-fidelity-agriculture-simulation', 
      description: 'farm',
      link: 'https://github.com/YahyaAsmara/high-fidelity-agriculture-simulation' 
    },
    { 
      name: 'energy-simulation', 
      description: 'raspberry pi energy',
      link: 'https://github.com/YahyaAsmara/energy-simulation' 
    },
    { 
      name: 'mining-platform', 
      description: 'real mining',
      link: 'https://github.com/YahyaAsmara/mining-platform' 
    },
    { 
      name: 'calgary-crime-analysis', 
      description: 'data w/ sql',
      link: 'https://github.com/YahyaAsmara/calgary-crime-analysis' 
    },
    { 
      name: 'staircases', 
      description: 'c sharp game',
      link: 'https://github.com/YahyaAsmara/Staircases' 
    }
  ];

  const sections = ['home', 'about', 'projects', 'contact'];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-extralight">...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-nunito overflow-x-hidden lowercase" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Decorative Glass Scrollbar */}
      <div className="fixed right-2 top-20 bottom-20 w-1 z-50">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"></div>
          <div 
            className="absolute top-0 w-full bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300"
            style={{
              height: `${Math.min(100, (window.innerHeight / document.body.scrollHeight) * 100)}%`,
              transform: `translateY(${(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * (100 - Math.min(100, (window.innerHeight / document.body.scrollHeight) * 100))}%)`
            }}
          ></div>
        </div>
      </div>

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
          <Scene3D isHome={currentSection === 0} />
        </div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl font-extralight mb-4 lowercase">
            Yahya Asmara
          </h1>
          <p className="text-xl md:text-2xl font-extralight text-gray-300 mb-8 lowercase">
            Computer Science @ University of Calgary
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="https://github.com/YahyaAsmara" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 hover:border-white/40 transition-colors font-extralight"
            >
              gitHub
            </a>
            <button 
              onClick={() => setCurrentSection(3)}
              className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 transition-colors font-extralight"
            >
              contact
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
                I'm a full stack developer passionate about developing apps that blend functionality with 3D aesthetic appeal. 
                My work focuses on clean, minimal design paired with robust technical implementation.
              </p>
              <p className="text-lg font-extralight text-gray-300 leading-relaxed">
                Currently exploring embedded technologies and three.js library.
              </p>
            </div>
            <div className="flex justify-center">
              <ModelViewer
                url="assets/shiba.glb"
                width={500}
                height={500}
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
          <h3 className="text-2xl font-extralight mt-12 mb-6">Working On</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingOn.map(project => (
              <a
                key={project.name}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all duration-300"
              >
                <h4 className="text-sm font-medium text-white truncate lowercase mb-2">
                  {project.name}
                </h4>
                <p className="text-xs text-white/70 lowercase leading-relaxed">
                  {project.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extralight mb-12">contact me</h2>
          <div className="flex justify-center gap-8">
            <a 
              href="mailto:yahya16005@gmail.com" 
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