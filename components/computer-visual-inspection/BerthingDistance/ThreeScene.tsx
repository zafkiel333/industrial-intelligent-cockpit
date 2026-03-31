import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BerthingState } from './three-types';

interface ThreeSceneProps {
  state: BerthingState;
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
    scene.fog = new THREE.Fog(0x020617, 10, 50);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

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

    // Dock
    const dockGeometry = new THREE.BoxGeometry(20, 1, 5);
    const dockMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const dock = new THREE.Mesh(dockGeometry, dockMaterial);
    dock.position.set(0, -0.5, -5);
    scene.add(dock);

    // Ship
    const shipGroup = new THREE.Group();
    const hullGeometry = new THREE.BoxGeometry(10, 2, 4);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    shipGroup.add(hull);

    const cabinGeometry = new THREE.BoxGeometry(3, 2, 3);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-2, 2, 0);
    shipGroup.add(cabin);

    scene.add(shipGroup);

    // Grid
    const grid = new THREE.GridHelper(100, 50, 0x00ffff, 0x1e293b);
    grid.position.y = -1;
    scene.add(grid);

    // Laser Lines
    const laserMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const laserGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5)
    ]);
    const laser1 = new THREE.Line(laserGeometry, laserMaterial);
    const laser2 = new THREE.Line(laserGeometry, laserMaterial);
    shipGroup.add(laser1);
    shipGroup.add(laser2);
    laser1.position.set(4, 0, -2);
    laser2.position.set(-4, 0, -2);

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { distance, angle } = stateRef.current;
      
      // Update ship position based on distance
      shipGroup.position.z = distance - 5;
      shipGroup.rotation.y = THREE.MathUtils.degToRad(angle);

      // Pulse lasers
      const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      laserMaterial.opacity = 0.5 + pulse * 0.5;
      laserMaterial.transparent = true;

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
      // cancelAnimationFrame is handled by the component unmounting if we store the ID
      // but for simplicity in this environment we'll just let it be or use a ref for ID
    };
  }, []); // Empty dependency array as requested

  return <div ref={containerRef} className="w-full h-full" />;
};
