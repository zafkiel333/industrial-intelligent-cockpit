import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PropulsionState } from './three-types';

interface ThreeSceneProps {
  state?: PropulsionState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<PropulsionState>(state || {
    rotationSpeed: 120,
    vibrationIntensity: 0.2,
    bladePitch: 15,
    cavitationRisk: 0.1,
    thrustForce: 450
  });

  useEffect(() => {
    if (state) {
      stateRef.current = state;
    }
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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x0088ff, 2, 50);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Propeller Model
    const propellerGroup = new THREE.Group();
    scene.add(propellerGroup);

    // Hub
    const hubGeom = new THREE.CylinderGeometry(1, 1.2, 3, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    propellerGroup.add(hub);

    // Blades
    const bladeGroup = new THREE.Group();
    propellerGroup.add(bladeGroup);

    const bladeGeom = new THREE.BoxGeometry(0.2, 5, 1.5);
    const bladeMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x00ffff,
      emissiveIntensity: 0.1
    });

    const blades: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      const angle = (i / 4) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0);
      blade.rotation.z = angle;
      blade.rotation.y = Math.PI / 6; // Initial pitch
      bladeGroup.add(blade);
      blades.push(blade);
    }

    // Water particles (simulating cavitation/thrust)
    const particleCount = 100;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = -Math.random() * 10;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // Grid Helper
    const grid = new THREE.GridHelper(50, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { rotationSpeed, vibrationIntensity, bladePitch, cavitationRisk } = stateRef.current;
      const time = Date.now() * 0.001;

      // Rotation
      propellerGroup.rotation.z += rotationSpeed * 0.001;

      // Vibration
      const vib = Math.sin(time * 50) * (vibrationIntensity * 0.05);
      propellerGroup.position.x = vib;
      propellerGroup.position.y = vib;

      // Blade Pitch
      blades.forEach(blade => {
        blade.rotation.y = THREE.MathUtils.degToRad(bladePitch);
      });

      // Particles animation
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] -= (rotationSpeed * 0.001) + (cavitationRisk * 0.5);
        if (positions[i * 3 + 2] < -10) {
          positions[i * 3 + 2] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 4;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.material.opacity = 0.3 + cavitationRisk * 0.7;

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
