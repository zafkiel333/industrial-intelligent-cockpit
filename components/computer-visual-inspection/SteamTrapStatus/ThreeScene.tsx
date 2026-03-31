import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrapStatus } from './three-types';

interface ThreeSceneProps {
  status: TrapStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<TrapStatus>(status);

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
    camera.position.set(10, 8, 10);

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

    const pointLight = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Trap Model
    const trapGroup = new THREE.Group();
    scene.add(trapGroup);

    // Main Body
    const bodyGeom = new THREE.CylinderGeometry(2, 2.2, 4, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x0f172a
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    trapGroup.add(body);

    // Inlet Pipe
    const pipeGeom = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const inlet = new THREE.Mesh(pipeGeom, pipeMat);
    inlet.rotation.z = Math.PI / 2;
    inlet.position.x = -4;
    trapGroup.add(inlet);

    // Outlet Pipe
    const outlet = new THREE.Mesh(pipeGeom, pipeMat);
    outlet.rotation.z = Math.PI / 2;
    outlet.position.x = 4;
    trapGroup.add(outlet);

    // Cap
    const capGeom = new THREE.CylinderGeometry(2.2, 2, 0.5, 32);
    const cap = new THREE.Mesh(capGeom, bodyMat);
    cap.position.y = 2.2;
    trapGroup.add(cap);

    // Steam Particles (Leaking)
    const particleCount = 300;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount * 3);
    const lifeArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = 4;
      posArray[i * 3 + 1] = 0;
      posArray[i * 3 + 2] = 0;
      
      velArray[i * 3] = Math.random() * 0.1 + 0.05;
      velArray[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      velArray[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      
      lifeArray[i] = Math.random();
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pMat = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const steamSystem = new THREE.Points(particles, pMat);
    scene.add(steamSystem);

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x00ffff, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Heat Glow
      const heatFactor = (s.inletTemp - 100) / 100;
      bodyMat.emissive.setRGB(heatFactor * 0.5, heatFactor * 0.2, 0);
      bodyMat.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2;

      // Steam Animation
      if (s.isLeaking) {
        steamSystem.visible = true;
        const positions = particles.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          lifeArray[i] += 0.02;
          if (lifeArray[i] > 1) {
            lifeArray[i] = 0;
            positions[i * 3] = 4;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
          }
          positions[i * 3] += velArray[i * 3] * (s.leakRate / 5);
          positions[i * 3 + 1] += velArray[i * 3 + 1];
          positions[i * 3 + 2] += velArray[i * 3 + 2];
        }
        particles.attributes.position.needsUpdate = true;
        pMat.opacity = Math.min(0.6, s.leakRate / 10);
      } else {
        steamSystem.visible = false;
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
