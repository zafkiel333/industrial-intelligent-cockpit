import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OilMistState } from './three-types';

interface ThreeSceneProps {
  state: OilMistState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Engine Block (Simplified)
    const engineGroup = new THREE.Group();
    const blockGeometry = new THREE.BoxGeometry(6, 4, 3);
    const blockMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    engineGroup.add(block);

    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for (let i = 0; i < 6; i++) {
      const cyl = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cyl.position.set(-2.5 + i, 2.5, 0);
      engineGroup.add(cyl);
    }

    scene.add(engineGroup);

    // Oil Mist Particles
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      velocities[i * 3 + 1] = 0.01 + Math.random() * 0.02;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.1,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Hotspot Markers
    const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.8 });
    const markers: THREE.Mesh[] = [];

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { concentration, hotspots } = stateRef.current;
      
      // Update particles
      const posAttr = particles.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setY(i, posAttr.getY(i) + velocities[i * 3 + 1] * (1 + concentration));
        if (posAttr.getY(i) > 4) {
          posAttr.setY(i, -2);
          posAttr.setX(i, (Math.random() - 0.5) * 8);
          posAttr.setZ(i, (Math.random() - 0.5) * 5);
        }
      }
      posAttr.needsUpdate = true;
      particleMaterial.opacity = Math.min(0.8, concentration * 0.5);

      // Pulse markers
      const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      markerMaterial.opacity = 0.4 + pulse * 0.4;

      // Update markers (Simplified: just show/hide based on hotspots)
      if (markers.length === 0 && hotspots.length > 0) {
        hotspots.forEach(h => {
          const m = new THREE.Mesh(markerGeometry, markerMaterial);
          m.position.set(h.x, h.y, h.z);
          scene.add(m);
          markers.push(m);
        });
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
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
