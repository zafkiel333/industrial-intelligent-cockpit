import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MinerState } from './three-types';

interface ThreeSceneProps {
  state?: MinerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<MinerState>(state || {
    vibration: 0.5,
    drumSpeed: 45,
    travelSpeed: 0.2,
    cuttingDepth: 0.3,
    conveyorSpeed: 2.5
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
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // --- Surface Miner Model ---
    const minerGroup = new THREE.Group();
    scene.add(minerGroup);

    // Main Body (Chassis)
    const bodyGeom = new THREE.BoxGeometry(12, 3, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    minerGroup.add(body);

    // Cutting Drum (The core component)
    const drumGroup = new THREE.Group();
    drumGroup.position.set(0, -1, 0);
    minerGroup.add(drumGroup);

    const drumGeom = new THREE.CylinderGeometry(2, 2, 6, 32);
    const drumMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 1, 
      roughness: 0.1,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.1
    });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    drum.rotation.z = Math.PI / 2;
    drumGroup.add(drum);

    // Teeth on the drum
    const toothGeom = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 40; i++) {
      const tooth = new THREE.Mesh(toothGeom, toothMat);
      const angle = (i / 40) * Math.PI * 2;
      const z = (Math.random() - 0.5) * 5.5;
      tooth.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, z);
      tooth.rotation.z = angle;
      drum.add(tooth);
    }

    // Conveyor System
    const conveyorGroup = new THREE.Group();
    conveyorGroup.position.set(6, 1, 0);
    minerGroup.add(conveyorGroup);

    const conveyorGeom = new THREE.BoxGeometry(8, 0.5, 2);
    const conveyorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const conveyor = new THREE.Mesh(conveyorGeom, conveyorMat);
    conveyor.rotation.z = -Math.PI / 8;
    conveyor.position.set(3, 1, 0);
    conveyorGroup.add(conveyor);

    // Tracks (Crawlers)
    const trackGeom = new THREE.BoxGeometry(10, 1.5, 1.5);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
    const leftTrack = new THREE.Mesh(trackGeom, trackMat);
    leftTrack.position.set(0, -2, 2.5);
    minerGroup.add(leftTrack);

    const rightTrack = new THREE.Mesh(trackGeom, trackMat);
    rightTrack.position.set(0, -2, -2.5);
    minerGroup.add(rightTrack);

    // Grid Helper
    const grid = new THREE.GridHelper(100, 20, 0x06b6d4, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { vibration, drumSpeed, travelSpeed, cuttingDepth } = stateRef.current;

      // 1. Drum Rotation
      drum.rotation.y += drumSpeed * 0.001;

      // 2. Vibration Effect
      const vib = Math.sin(time * 30) * (vibration * 0.05);
      minerGroup.position.y = vib;

      // 3. Cutting Depth (Drum Height)
      drumGroup.position.y = THREE.MathUtils.lerp(drumGroup.position.y, -1 - cuttingDepth, 0.05);

      // 4. Track Movement (Simulated by grid offset or just subtle animation)
      leftTrack.position.x = Math.sin(time * 2) * (travelSpeed * 0.1);
      rightTrack.position.x = Math.sin(time * 2) * (travelSpeed * 0.1);

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
