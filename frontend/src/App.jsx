import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';

// ModelViewer component
import { Suspense, useLayoutEffect, useMemo } from 'react';
import { useLoader, invalidate } from '@react-three/fiber';
import { useGLTF, useFBX, useProgress, Html, Environment, ContactShadows } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const deg2rad = d => (d * Math.PI) / 180;
const DECIDE = 8;
const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG = deg2rad(6);
const HOVER_EASE = 0.15;

const Loader = ({ placeholderSrc }) => {
  const { progress, active } = useProgress();
  if (!active && placeholderSrc) return null;
  return (
    <Html center>
      {placeholderSrc ? (
        <img src={placeholderSrc} width={128} height={128} style={{ filter: 'blur(8px)', borderRadius: 8 }} />
      ) : (
        <div className="text-white bg-gray-800 px-4 py-2 rounded-lg">
          {Math.round(progress)} %
        </div>
      )}
    </Html>
  );
};

const DesktopControls = ({ pivot, min, max, zoomEnabled }) => {
  const ref = useRef(null);
  useFrame(() => ref.current?.target.copy(pivot));
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableRotate={false}
      enableZoom={zoomEnabled}
      minDistance={min}
      maxDistance={max}
    />
  );
};

const ModelInner = ({
  url,
  xOff,
  yOff,
  pivot,
  initYaw,
  initPitch,
  minZoom,
  maxZoom,
  enableMouseParallax,
  enableManualRotation,
  enableHoverRotation,
  enableManualZoom,
  autoFrame,
  fadeIn,
  autoRotate,
  autoRotateSpeed,
  onLoaded
}) => {
  const outer = useRef(null);
  const inner = useRef(null);
  const { camera, gl } = useThree();

  const vel = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const ext = useMemo(() => url.split('.').pop().toLowerCase(), [url]);
  const content = useMemo(() => {
    if (ext === 'glb' || ext === 'gltf') return useGLTF(url).scene.clone();
    if (ext === 'fbx') return useFBX(url).clone();
    if (ext === 'obj') return useLoader(OBJLoader, url).clone();
    console.error('Unsupported format:', ext);
    return null;
  }, [url, ext]);

  const pivotW = useRef(new THREE.Vector3());
  useLayoutEffect(() => {
    if (!content) return;
    const g = inner.current;
    g.updateWorldMatrix(true, true);

    const sphere = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere());
    const s = 1 / (sphere.radius * 2);
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);

    g.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (fadeIn) {
          o.material.transparent = true;
          o.material.opacity = 0;
        }
      }
    });

    g.getWorldPosition(pivotW.current);
    pivot.copy(pivotW.current);
    outer.current.rotation.set(initPitch, initYaw, 0);

    if (autoFrame && camera.isPerspectiveCamera) {
      const persp = camera;
      const fitR = sphere.radius * s;
      const d = (fitR * 1.2) / Math.sin((persp.fov * Math.PI) / 180 / 2);
      persp.position.set(pivotW.current.x, pivotW.current.y, pivotW.current.z + d);
      persp.near = d / 10;
      persp.far = d * 10;
      persp.updateProjectionMatrix();
    }

    if (fadeIn) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.05;
        const v = Math.min(t, 1);
        g.traverse(o => {
          if (o.isMesh) o.material.opacity = v;
        });
        invalidate();
        if (v === 1) {
          clearInterval(id);
          onLoaded?.();
        }
      }, 16);
      return () => clearInterval(id);
    } else onLoaded?.();
  }, [content]);

  useEffect(() => {
    if (!enableManualRotation || isTouch) return;
    const el = gl.domElement;
    let drag = false;
    let lx = 0, ly = 0;
    const down = e => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      window.addEventListener('pointerup', up);
    };
    const move = e => {
      if (!drag) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      outer.current.rotation.y += dx * ROTATE_SPEED;
      outer.current.rotation.x += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
      invalidate();
    };
    const up = () => (drag = false);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl, enableManualRotation]);

  useFrame((_, dt) => {
    let need = false;
    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
    cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x, phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
    cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;

    const ndc = pivotW.current.clone().project(camera);
    ndc.x += xOff + cPar.current.x;
    ndc.y += yOff + cPar.current.y;
    outer.current.position.copy(ndc.unproject(camera));

    outer.current.rotation.x += cHov.current.x - phx;
    outer.current.rotation.y += cHov.current.y - phy;

    if (autoRotate) {
      outer.current.rotation.y += autoRotateSpeed * dt;
      need = true;
    }

    outer.current.rotation.y += vel.current.x;
    outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA;
    vel.current.y *= INERTIA;
    if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4) need = true;

    if (
      Math.abs(cPar.current.x - tPar.current.x) > 1e-4 ||
      Math.abs(cPar.current.y - tPar.current.y) > 1e-4 ||
      Math.abs(cHov.current.x - tHov.current.x) > 1e-4 ||
      Math.abs(cHov.current.y - tHov.current.y) > 1e-4
    )
      need = true;

    if (need) invalidate();
  });

  if (!content) return null;
  return (
    <group ref={outer}>
      <group ref={inner}>
        <primitive object={content} />
      </group>
    </group>
  );
};

const ModelViewer = ({
  url,
  width = 400,
  height = 400,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = -50,
  defaultRotationY = 20,
  defaultZoom = 0.5,
  minZoomDistance = 0.5,
  maxZoomDistance = 10,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = true,
  ambientIntensity = 0.3,
  keyLightIntensity = 1,
  fillLightIntensity = 0.5,
  rimLightIntensity = 0.8,
  environmentPreset = 'forest',
  autoFrame = false,
  placeholderSrc,
  showScreenshotButton = true,
  fadeIn = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  onModelLoaded
}) => {
  useEffect(() => void useGLTF.preload(url), [url]);
  const pivot = useRef(new THREE.Vector3()).current;
  const contactRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  const initYaw = deg2rad(defaultRotationX);
  const initPitch = deg2rad(defaultRotationY);
  const camZ = Math.min(Math.max(defaultZoom, minZoomDistance), maxZoomDistance);

  return (
    <div
      style={{
        width,
        height,
        touchAction: 'pan-y pinch-zoom',
        position: 'relative'
      }}
    >
      <Canvas
        shadows
        frameloop="demand"
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        {environmentPreset !== 'none' && <Environment preset={environmentPreset} background={false} />}

        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={keyLightIntensity} castShadow />
        <directionalLight position={[-5, 2, 5]} intensity={fillLightIntensity} />
        <directionalLight position={[0, 4, -5]} intensity={rimLightIntensity} />

        <ContactShadows ref={contactRef} position={[0, -0.5, 0]} opacity={0.35} scale={10} blur={2} />

        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          <ModelInner
            url={url}
            xOff={modelXOffset}
            yOff={modelYOffset}
            pivot={pivot}
            initYaw={initYaw}
            initPitch={initPitch}
            minZoom={minZoomDistance}
            maxZoom={maxZoomDistance}
            enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation}
            enableHoverRotation={enableHoverRotation}
            enableManualZoom={enableManualZoom}
            autoFrame={autoFrame}
            fadeIn={fadeIn}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            onLoaded={onModelLoaded}
          />
        </Suspense>

        {!isTouch && (
          <DesktopControls pivot={pivot} min={minZoomDistance} max={maxZoomDistance} zoomEnabled={enableManualZoom} />
        )}
      </Canvas>
    </div>
  );
};

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
        <div className="text-white text-xl font-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-['Nunito_Sans'] overflow-x-hidden">
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
            Creative Developer
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
                I'm a developer passionate about creating digital experiences that blend functionality with aesthetic appeal. 
                My work focuses on clean, minimal design paired with robust technical implementation.
              </p>
              <p className="text-lg font-extralight text-gray-300 leading-relaxed">
                Currently exploring the intersection of web technologies and 3D graphics to create immersive, 
                interactive experiences.
              </p>
            </div>
            <div className="flex justify-center">
              <ModelViewer
                url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb"
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

      {/* Add Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wdth,wght@0,6..12,95.8,200;1,6..12,95.8,200&display=swap');
      `}</style>
    </div>
  );
};

export default Portfolio;