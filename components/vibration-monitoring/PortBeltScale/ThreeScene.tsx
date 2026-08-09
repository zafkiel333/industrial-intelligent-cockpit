import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeltScaleState } from './three-types';

interface ThreeSceneProps {
  state?: BeltScaleState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<BeltScaleState>(state || {
    flowRate: 1500,
    vibrationIntensity: 0.12,
    beltSpeed: 2.5,
    totalWeight: 45000,
    loadCellStatus: 'normal'
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
    camera.position.set(10, 8, 12);

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

    const directionalLight = new THREE.DirectionalLight(0x00ff88, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Belt Scale Model
    const scaleGroup = new THREE.Group();
    scene.add(scaleGroup);

    // Frame
    const frameGeom = new THREE.BoxGeometry(8, 0.5, 4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    scaleGroup.add(frame);

    // Belt
    const beltGeom = new THREE.BoxGeometry(8, 0.1, 3.5);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.y = 0.35;
    scaleGroup.add(belt);

    // Rollers
    const rollerGeom = new THREE.CylinderGeometry(0.3, 0.3, 3.8, 16);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    
    const rollers: THREE.Mesh[] = [];
    for (let i = -3; i <= 3; i += 1.5) {
      const roller = new THREE.Mesh(rollerGeom, rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(i, 0.35, 0);
      scaleGroup.add(roller);
      rollers.push(roller);
    }

    // Load Cells (indicators)
    const cellGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const cellMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5 });
    
    const cell1 = new THREE.Mesh(cellGeom, cellMat);
    cell1.position.set(0, -0.5, 1.8);
    scaleGroup.add(cell1);

    const cell2 = new THREE.Mesh(cellGeom, cellMat);
    cell2.position.set(0, -0.5, -1.8);
    scaleGroup.add(cell2);

    // Grid
    const grid = new THREE.GridHelper(20, 10, 0x00ff88, 0x1e293b);
    grid.position.y = -1;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { beltSpeed, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Roller rotation
      rollers.forEach(r => {
        r.rotation.z -= beltSpeed * 0.05;
      });

      // Vibration effect
      const vib = Math.sin(time * 120) * (vibrationIntensity * 0.02);
      scaleGroup.position.y = vib;

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
