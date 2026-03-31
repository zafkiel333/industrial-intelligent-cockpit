import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GasLeakStatus } from './three-types';

interface ThreeSceneProps {
  status: GasLeakStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<GasLeakStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Pipe Model
    const pipeGroup = new THREE.Group();
    scene.add(pipeGroup);

    const pipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x000000
    });
    
    // Main Pipe
    const pipeGeom = new THREE.CylinderGeometry(1, 1, 20, 32);
    const pipe = new THREE.Mesh(pipeGeom, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipeGroup.add(pipe);

    // Flange
    const flangeGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const flange = new THREE.Mesh(flangeGeom, pipeMat);
    flange.rotation.z = Math.PI / 2;
    flange.position.x = 0;
    pipeGroup.add(flange);

    // Leak Effect (Particles)
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = Math.random() * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particles, particleMat);
    particleSystem.visible = false;
    scene.add(particleSystem);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Leak Visualization
      if (s.leakDetected) {
        particleSystem.visible = true;
        particleSystem.position.set(s.leakLocation.x, s.leakLocation.y, s.leakLocation.z);
        
        const posAttr = particles.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          posAttr.array[i * 3] += velocities[i * 3] * (s.leakRate / 5);
          posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * (s.leakRate / 5);
          posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * (s.leakRate / 5);
          
          if (posAttr.array[i * 3 + 1] > 2) {
            posAttr.array[i * 3] = 0;
            posAttr.array[i * 3 + 1] = 0;
            posAttr.array[i * 3 + 2] = 0;
          }
        }
        posAttr.needsUpdate = true;
        
        // Pipe Glow
        pipeMat.emissive.setHex(0xef4444);
        pipeMat.emissiveIntensity = 0.2 + Math.sin(time * 10) * 0.2;
      } else {
        particleSystem.visible = false;
        pipeMat.emissiveIntensity = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
