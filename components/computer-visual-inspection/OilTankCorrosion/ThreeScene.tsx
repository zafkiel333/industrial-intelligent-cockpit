import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OilTankStatus } from './three-types';

interface ThreeSceneProps {
  status: OilTankStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<OilTankStatus>(status);

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
    camera.position.set(15, 10, 15);

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

    // Tank Model
    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x000000
    });
    
    // Main Cylinder
    const tankGeom = new THREE.CylinderGeometry(5, 5, 12, 32);
    const tank = new THREE.Mesh(tankGeom, metalMat);
    tank.position.y = 6;
    tankGroup.add(tank);

    // Top Dome
    const domeGeom = new THREE.SphereGeometry(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeom, metalMat);
    dome.position.y = 12;
    tankGroup.add(dome);

    // Corrosion Patches
    const corrosionGroup = new THREE.Group();
    tankGroup.add(corrosionGroup);

    const corrosionMat = new THREE.MeshStandardMaterial({ 
      color: 0x92400e, 
      transparent: true, 
      opacity: 0,
      emissive: 0x92400e,
      emissiveIntensity: 0.5
    });

    for (let i = 0; i < 5; i++) {
      const patchGeom = new THREE.SphereGeometry(0.5 + Math.random(), 16, 16);
      const patch = new THREE.Mesh(patchGeom, corrosionMat);
      const angle = Math.random() * Math.PI * 2;
      const h = Math.random() * 10 + 1;
      patch.position.set(Math.cos(angle) * 5.1, h, Math.sin(angle) * 5.1);
      corrosionGroup.add(patch);
    }

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
      velocities[i * 3 + 1] = -Math.random() * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ 
      color: 0x000000, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particles, particleMat);
    particleSystem.visible = false;
    scene.add(particleSystem);

    // Grid
    const grid = new THREE.GridHelper(25, 25, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Corrosion Visual
      corrosionMat.opacity = (s.corrosionArea / 10) * 0.8;
      corrosionMat.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.2;

      // Leak Visualization
      if (s.leakDetected) {
        particleSystem.visible = true;
        particleSystem.position.set(5.1, 3, 0); // Mock leak position
        
        const posAttr = particles.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          posAttr.array[i * 3] += velocities[i * 3] * (s.leakRate / 2);
          posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * (s.leakRate / 2);
          posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * (s.leakRate / 2);
          
          if (posAttr.array[i * 3 + 1] < -3) {
            posAttr.array[i * 3] = 0;
            posAttr.array[i * 3 + 1] = 0;
            posAttr.array[i * 3 + 2] = 0;
          }
        }
        posAttr.needsUpdate = true;
        
        // Tank Glow
        metalMat.emissive.setHex(0xef4444);
        metalMat.emissiveIntensity = 0.1 + Math.sin(time * 5) * 0.1;
      } else {
        particleSystem.visible = false;
        metalMat.emissiveIntensity = 0;
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
