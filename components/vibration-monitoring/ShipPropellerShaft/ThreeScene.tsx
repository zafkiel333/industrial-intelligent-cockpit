import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PropellerShaftState } from './three-types';

interface ThreeSceneProps {
  state?: PropellerShaftState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<PropellerShaftState>(state || {
    rpm: 120,
    vibrationIntensity: 0.15,
    torque: 450,
    thrust: 800,
    bearingTemp: 42
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
    camera.position.set(15, 10, 20);

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

    // Shaft Model
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    // Main Shaft
    const shaftGeom = new THREE.CylinderGeometry(0.4, 0.4, 15, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaftGroup.add(shaft);

    // Bearings
    const bearingGeom = new THREE.CylinderGeometry(0.8, 0.8, 1, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    
    const bearing1 = new THREE.Mesh(bearingGeom, bearingMat);
    bearing1.rotation.z = Math.PI / 2;
    bearing1.position.x = -4;
    shaftGroup.add(bearing1);

    const bearing2 = new THREE.Mesh(bearingGeom, bearingMat);
    bearing2.rotation.z = Math.PI / 2;
    bearing2.position.x = 2;
    shaftGroup.add(bearing2);

    // Propeller (at the end)
    const propGroup = new THREE.Group();
    propGroup.position.x = 7.5;
    shaftGroup.add(propGroup);

    const hubGeom = new THREE.CylinderGeometry(0.6, 0.6, 1, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.z = Math.PI / 2;
    propGroup.add(hub);

    const bladeGeom = new THREE.BoxGeometry(0.1, 3, 1);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 });
    
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(bladeGeom, bladeMat);
      const pivot = new THREE.Group();
      pivot.rotation.x = (i * Math.PI) / 2;
      b.position.y = 1.8;
      pivot.add(b);
      propGroup.add(pivot);
    }

    // Grid
    const grid = new THREE.GridHelper(30, 15, 0x00ffff, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { rpm, vibrationIntensity } = stateRef.current;
      const time = Date.now() * 0.001;

      // Rotation
      const rotSpeed = rpm * 0.001;
      shaft.rotation.y += rotSpeed;
      propGroup.rotation.x += rotSpeed;

      // Vibration effect
      const vib = Math.sin(time * 80) * (vibrationIntensity * 0.05);
      shaftGroup.position.y = vib;

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
