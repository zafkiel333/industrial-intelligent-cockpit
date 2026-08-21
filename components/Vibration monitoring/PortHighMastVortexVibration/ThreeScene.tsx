import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MastState } from './three-types';

interface ThreeSceneProps {
  state: MastState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<MastState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 15, 20);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // High Mast Model
    const mastGroup = new THREE.Group();

    // Pole
    const poleGeom = new THREE.CylinderGeometry(0.2, 0.5, 15, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.y = 7.5;
    mastGroup.add(pole);

    // Lamp Head
    const headGeom = new THREE.CylinderGeometry(1.5, 1.2, 0.5, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 15;
    mastGroup.add(head);

    // Lamps (Glow)
    for (let i = 0; i < 8; i++) {
      const lampGeom = new THREE.SphereGeometry(0.2, 8, 8);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lamp = new THREE.Mesh(lampGeom, lampMat);
      const angle = (i / 8) * Math.PI * 2;
      lamp.position.set(Math.cos(angle) * 1.3, 15, Math.sin(angle) * 1.3);
      mastGroup.add(lamp);
    }

    scene.add(mastGroup);

    // Ground
    const groundGeom = new THREE.CircleGeometry(10, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Vortex Particles (Abstract)
    const particleCount = 50;
    const particles = new THREE.Group();
    scene.add(particles);

    const pGeom = new THREE.SphereGeometry(0.05, 4, 4);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
    const pList: THREE.Mesh[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeom, pMat);
      p.position.set(Math.random() * 4 - 2, Math.random() * 15, Math.random() * 4 - 2);
      particles.add(p);
      pList.push(p);
    }

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const { windSpeed, vibrationAmplitude, isLockIn } = stateRef.current;
      const time = Date.now() * 0.001;

      // Swaying Logic
      const swayX = Math.sin(time * 2) * vibrationAmplitude * 0.05;
      const swayZ = Math.cos(time * 2.1) * vibrationAmplitude * 0.05;
      mastGroup.rotation.x = swayX;
      mastGroup.rotation.z = swayZ;

      // Vortex Particles Logic
      pList.forEach((p, i) => {
        p.position.x += 0.1 * windSpeed * 0.1;
        if (p.position.x > 5) p.position.x = -5;
        
        // Spiral motion for vortex
        p.position.y += Math.sin(time + i) * 0.02;
        p.position.z += Math.cos(time + i) * 0.02;
        
        const mat = p.material as THREE.MeshBasicMaterial;
        if (isLockIn) {
          mat.color.setHex(0xff00ff);
          mat.opacity = 0.8;
        } else {
          mat.color.setHex(0x00ffff);
          mat.opacity = 0.4;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }

      // Cleanup scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" id="mast-3d-container" />;
};
