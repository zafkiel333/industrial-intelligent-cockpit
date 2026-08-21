import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ConveyorState } from './three-types';

interface ThreeSceneProps {
  state?: ConveyorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ConveyorState>(state || {
    beltSpeed: 3.5,
    vibrationIntensity: 0.2,
    idlerStatus: 'normal',
    loadWeight: 150,
    tensionForce: 45
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

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
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Conveyor Model
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // Frame
    const frameGeom = new THREE.BoxGeometry(20, 0.5, 4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    conveyorGroup.add(frame);

    // Idlers (Rollers)
    const idlerGeom = new THREE.CylinderGeometry(0.4, 0.4, 3.8, 16);
    const idlerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const idlers: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const idler = new THREE.Mesh(idlerGeom, idlerMat);
      idler.rotation.x = Math.PI / 2;
      idler.position.set(-8 + i * 3.2, 0.6, 0);
      conveyorGroup.add(idler);
      idlers.push(idler);
    }

    // Belt
    const beltGeom = new THREE.BoxGeometry(20, 0.1, 3.6);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 1 });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.y = 1.1;
    conveyorGroup.add(belt);

    // Faulty Idler Highlight
    const highlightGeom = new THREE.RingGeometry(0.5, 0.6, 32);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const highlight = new THREE.Mesh(highlightGeom, highlightMat);
    highlight.rotation.x = Math.PI / 2;
    scene.add(highlight);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { beltSpeed, vibrationIntensity, idlerStatus } = stateRef.current;
      const time = Date.now() * 0.001;

      // Rollers rotation
      idlers.forEach((idler, idx) => {
        idler.rotation.y += beltSpeed * 0.05;
        
        // Vibration effect on a specific idler if warning/critical
        if (idx === 3 && idlerStatus !== 'normal') {
          const vib = Math.sin(time * 60) * (vibrationIntensity * 0.1);
          idler.position.y = 0.6 + vib;
          
          highlight.position.copy(idler.position);
          highlight.position.y = 1.2;
          highlight.material.opacity = 0.5 + Math.sin(time * 10) * 0.5;
        } else if (idx === 3) {
          idler.position.y = 0.6;
          highlight.material.opacity = 0;
        }
      });

      // Belt texture scrolling (simulated by subtle movement or just context)
      belt.position.x = Math.sin(time * beltSpeed * 0.1) * 0.05;

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
