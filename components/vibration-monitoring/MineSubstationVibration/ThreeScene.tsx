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
    vibration: 0.2,
    beltSpeed: 3.5,
    tension: 85,
    rollerTemp: 42,
    load: 70
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
    camera.position.set(20, 15, 30);

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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(0x06b6d4, 2);
    spotLight.position.set(-15, 20, 15);
    scene.add(spotLight);

    // --- Conveyor Model ---
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // Rollers (Idlers)
    const rollerGeom = new THREE.CylinderGeometry(0.8, 0.8, 12, 32);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const rollers: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const roller = new THREE.Mesh(rollerGeom, rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set((i - 2.5) * 8, 0, 0);
      conveyorGroup.add(roller);
      rollers.push(roller);

      // Roller supports
      const supportGeom = new THREE.BoxGeometry(1, 4, 1);
      const supportMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const leftSupport = new THREE.Mesh(supportGeom, supportMat);
      leftSupport.position.set((i - 2.5) * 8, -2, 6.5);
      conveyorGroup.add(leftSupport);

      const rightSupport = new THREE.Mesh(supportGeom, supportMat);
      rightSupport.position.set((i - 2.5) * 8, -2, -6.5);
      conveyorGroup.add(rightSupport);
    }

    // Belt
    const beltGeom = new THREE.BoxGeometry(48, 0.2, 11);
    const beltMat = new THREE.MeshStandardMaterial({ 
      color: 0x020617,
      roughness: 0.9,
      metalness: 0.1
    });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.y = 0.9;
    conveyorGroup.add(belt);

    // Material on belt (Simulated load)
    const materialGroup = new THREE.Group();
    belt.add(materialGroup);

    const rockGeom = new THREE.DodecahedronGeometry(0.5);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    for (let i = 0; i < 50; i++) {
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(
        (Math.random() - 0.5) * 40,
        0.3,
        (Math.random() - 0.5) * 8
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      materialGroup.add(rock);
    }

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { vibration, beltSpeed, load } = stateRef.current;

      // 1. Roller Rotation
      rollers.forEach(roller => {
        roller.rotation.y += beltSpeed * 0.02;
      });

      // 2. Material Movement
      materialGroup.children.forEach(rock => {
        rock.position.x -= beltSpeed * 0.05;
        if (rock.position.x < -24) rock.position.x = 24;
      });

      // 3. Vibration Effect
      const vib = Math.sin(time * 40) * (vibration * 0.05);
      conveyorGroup.position.y = vib;

      // 4. Load visibility
      materialGroup.visible = load > 5;
      materialGroup.scale.setScalar(0.5 + load / 100);

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
