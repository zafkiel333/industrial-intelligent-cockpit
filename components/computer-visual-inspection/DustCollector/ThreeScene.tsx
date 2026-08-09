import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DustCollectorStatus } from './three-types';

interface ThreeSceneProps {
  status: DustCollectorStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<DustCollectorStatus>(status);

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
    camera.position.set(12, 12, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Dust Collector Housing (Wireframe/Transparent)
    const housingGeom = new THREE.BoxGeometry(6, 10, 6);
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.2, 
      wireframe: true 
    });
    const housing = new THREE.Mesh(housingGeom, housingMat);
    scene.add(housing);

    // Filter Bags Array
    const bagsGroup = new THREE.Group();
    scene.add(bagsGroup);

    const bagGeom = new THREE.CylinderGeometry(0.2, 0.2, 6, 16);
    const bags: THREE.Mesh[] = [];

    for (let x = -2; x <= 2; x += 1) {
      for (let z = -2; z <= 2; z += 1) {
        const bagMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const bag = new THREE.Mesh(bagGeom, bagMat);
        bag.position.set(x, 0, z);
        bagsGroup.add(bag);
        bags.push(bag);
      }
    }

    // Particles (Smoke for broken bags)
    const particleCount = 100;
    const particlesGeom = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 0.5;
      pos[i*3+1] = Math.random() * 5;
      pos[i*3+2] = (Math.random() - 0.5) * 0.5;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.1, transparent: true, opacity: 0.6 });
    const smoke = new THREE.Points(particlesGeom, particlesMat);
    smoke.visible = false;
    scene.add(smoke);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Rotate housing slowly
      housing.rotation.y += 0.002;
      bagsGroup.rotation.y += 0.002;

      // Update broken bags visual
      const brokenIndices = new Set<number>();
      if (s.brokenBagsCount > 0) {
        for (let i = 0; i < s.brokenBagsCount; i++) {
          brokenIndices.add(i % bags.length);
        }
        smoke.visible = true;
        smoke.position.copy(bags[0].position); // Simplified: smoke at first broken bag
        smoke.position.y += Math.sin(time * 5) * 0.1;
      } else {
        smoke.visible = false;
      }

      bags.forEach((bag, idx) => {
        const mat = bag.material as THREE.MeshStandardMaterial;
        if (brokenIndices.has(idx)) {
          mat.color.setHex(0xef4444);
          mat.emissive.setHex(0xef4444);
          mat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
        } else {
          mat.color.setHex(0x94a3b8);
          mat.emissiveIntensity = 0;
        }
      });

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
