import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpStatus } from './three-types';

interface ThreeSceneProps {
  status: PumpStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<PumpStatus>(status);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Pump Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Main Body
    const bodyGeom = new THREE.CylinderGeometry(3, 3, 8, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x0f172a
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.z = Math.PI / 2;
    pumpGroup.add(body);

    // Motor Section
    const motorGeom = new THREE.CylinderGeometry(2.5, 2.5, 6, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.x = -7;
    pumpGroup.add(motor);

    // Mechanical Seal Area (The focus)
    const sealGeom = new THREE.CylinderGeometry(1.5, 1.5, 1, 32);
    const sealMat = new THREE.MeshStandardMaterial({ 
      color: 0x00ffff, 
      emissive: 0x00ffff, 
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const seal = new THREE.Mesh(sealGeom, sealMat);
    seal.rotation.z = Math.PI / 2;
    seal.position.x = -3.5;
    pumpGroup.add(seal);

    // Shaft
    const shaftGeom = new THREE.CylinderGeometry(0.5, 0.5, 14, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    pumpGroup.add(shaft);

    // Impeller Housing
    const housingGeom = new THREE.TorusGeometry(3.5, 1, 16, 100);
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
    const housing = new THREE.Mesh(housingGeom, housingMat);
    housing.rotation.y = Math.PI / 2;
    housing.position.x = 4;
    pumpGroup.add(housing);

    // Leak Particles
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = -3.5;
      posArray[i * 3 + 1] = 0;
      posArray[i * 3 + 2] = 0;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.1 + 0.05;
      velArray[i * 3] = (Math.random() - 0.5) * 0.02;
      velArray[i * 3 + 1] = Math.sin(angle) * speed;
      velArray[i * 3 + 2] = Math.cos(angle) * speed;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pMat = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const leakSystem = new THREE.Points(particles, pMat);
    scene.add(leakSystem);

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x00ffff, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Rotation
      shaft.rotation.x += s.rotationSpeed * 0.01;
      
      // Vibration
      pumpGroup.position.y = Math.sin(time * 50) * s.vibrationLevel * 0.05;

      // Leak Animation
      if (s.isLeaking) {
        leakSystem.visible = true;
        const positions = particles.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velArray[i * 3];
          positions[i * 3 + 1] += velArray[i * 3 + 1];
          positions[i * 3 + 2] += velArray[i * 3 + 2];

          // Reset if too far
          const dist = Math.sqrt(
            Math.pow(positions[i * 3] + 3.5, 2) + 
            Math.pow(positions[i * 3 + 1], 2) + 
            Math.pow(positions[i * 3 + 2], 2)
          );
          if (dist > 3) {
            positions[i * 3] = -3.5;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
          }
        }
        particles.attributes.position.needsUpdate = true;
        pMat.opacity = s.leakRate / 10;
      } else {
        leakSystem.visible = false;
      }

      // Pulse Seal
      if (s.isLeaking) {
        sealMat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
        sealMat.color.setHex(0xff0000);
        sealMat.emissive.setHex(0xff0000);
      } else {
        sealMat.emissiveIntensity = 0.5;
        sealMat.color.setHex(0x00ffff);
        sealMat.emissive.setHex(0x00ffff);
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
