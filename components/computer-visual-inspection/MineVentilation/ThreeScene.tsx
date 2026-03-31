import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VentilationStatus } from './three-types';

interface ThreeSceneProps {
  status: VentilationStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<VentilationStatus>(status);

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
    camera.position.set(12, 8, 12);

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

    // Fan Model
    const fanGroup = new THREE.Group();
    scene.add(fanGroup);

    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.1 });

    // Casing
    const casingGeom = new THREE.CylinderGeometry(3, 3, 6, 32, 1, true);
    const casing = new THREE.Mesh(casingGeom, casingMat);
    casing.rotation.z = Math.PI / 2;
    fanGroup.add(casing);

    // Blades
    const bladeGroup = new THREE.Group();
    fanGroup.add(bladeGroup);

    const hubGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const hub = new THREE.Mesh(hubGeom, bladeMat);
    hub.rotation.z = Math.PI / 2;
    bladeGroup.add(hub);

    const bladeGeom = new THREE.BoxGeometry(0.1, 2.5, 0.8);
    for (let i = 0; i < 6; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      const angle = (i / 6) * Math.PI * 2;
      blade.position.set(0, Math.cos(angle) * 1.5, Math.sin(angle) * 1.5);
      blade.rotation.x = angle;
      blade.rotation.y = 0.2; // Pitch
      bladeGroup.add(blade);
    }

    // Air Flow Particles
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 10;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 4;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.05, transparent: true, opacity: 0.5 });
    const particleSystem = new THREE.Points(particles, particleMat);
    scene.add(particleSystem);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -4;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Rotation
      if (s.isOperating) {
        bladeGroup.rotation.x += (s.fanSpeed / 600) * 0.1;
      }

      // Air Flow Animation
      const positions = particles.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += 0.1 * (s.fanSpeed / 500); // Move along X axis
        if (positions[i * 3] > 5) {
          positions[i * 3] = -5;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
      }
      particles.attributes.position.needsUpdate = true;

      // Vibration effect
      if (s.vibration > 5) {
        fanGroup.position.y = Math.sin(time * 50) * (s.vibration / 100);
      } else {
        fanGroup.position.y = 0;
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
