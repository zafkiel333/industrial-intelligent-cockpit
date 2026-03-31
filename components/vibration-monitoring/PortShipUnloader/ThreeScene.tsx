import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShipUnloaderState } from './three-types';

interface ThreeSceneProps {
  state?: ShipUnloaderState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ShipUnloaderState>(state || {
    vibrationFrequency: 50,
    vibrationAmplitude: 2.5,
    motorTemp: 45,
    grabLoad: 1200,
    trolleyPosition: 10
  });

  // Update state ref without triggering re-renders of the 3D scene
  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Requirement: Clear other canvas before adding new one
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

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

    // Ship Unloader Model (Enhanced Sci-Fi Style)
    const unloaderGroup = new THREE.Group();
    scene.add(unloaderGroup);

    // Main Structure - Gantry Legs
    const legGeom = new THREE.CylinderGeometry(0.3, 0.5, 12, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    
    const legPositions = [[-3, 6, -2], [3, 6, -2], [-3, 6, 2], [3, 6, 2]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      unloaderGroup.add(leg);
    });

    // Top Platform
    const platformGeom = new THREE.BoxGeometry(8, 0.5, 6);
    const platform = new THREE.Mesh(platformGeom, legMat);
    platform.position.y = 12;
    unloaderGroup.add(platform);

    // Boom Structure
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 12.5, 0);
    unloaderGroup.add(boomGroup);

    const boomMainGeom = new THREE.BoxGeometry(16, 0.8, 1.2);
    const boomMain = new THREE.Mesh(boomMainGeom, legMat);
    boomMain.position.x = 4;
    boomGroup.add(boomMain);

    // Boom Rails
    const railGeom = new THREE.BoxGeometry(16, 0.1, 0.1);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
    const rail1 = new THREE.Mesh(railGeom, railMat);
    rail1.position.set(4, 0.45, 0.4);
    boomGroup.add(rail1);
    const rail2 = new THREE.Mesh(railGeom, railMat);
    rail2.position.set(4, 0.45, -0.4);
    boomGroup.add(rail2);

    // Trolley
    const trolleyGroup = new THREE.Group();
    boomGroup.add(trolleyGroup);

    const trolleyGeom = new THREE.BoxGeometry(2, 1, 2);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const trolley = new THREE.Mesh(trolleyGeom, trolleyMat);
    trolleyGroup.add(trolley);

    // Cables
    const cableGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const cable1 = new THREE.Mesh(cableGeom, cableMat);
    cable1.position.set(0.6, -2, 0.6);
    trolleyGroup.add(cable1);
    const cable2 = new THREE.Mesh(cableGeom, cableMat);
    cable2.position.set(-0.6, -2, 0.6);
    trolleyGroup.add(cable2);
    const cable3 = new THREE.Mesh(cableGeom, cableMat);
    cable3.position.set(0.6, -2, -0.6);
    trolleyGroup.add(cable3);
    const cable4 = new THREE.Mesh(cableGeom, cableMat);
    cable4.position.set(-0.6, -2, -0.6);
    trolleyGroup.add(cable4);

    // Grab (Two halves)
    const grabGroup = new THREE.Group();
    grabGroup.position.y = -4;
    trolleyGroup.add(grabGroup);

    const grabHalfGeom = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI);
    const grabMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.2 });
    
    const grabLeft = new THREE.Mesh(grabHalfGeom, grabMat);
    grabLeft.rotation.y = -Math.PI / 2;
    grabGroup.add(grabLeft);

    const grabRight = new THREE.Mesh(grabHalfGeom, grabMat);
    grabRight.rotation.y = Math.PI / 2;
    grabGroup.add(grabRight);

    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x1e293b);
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { vibrationFrequency, vibrationAmplitude } = stateRef.current;
      const time = Date.now() * 0.001;

      // Trolley Movement
      const trolleyX = 2 + Math.sin(time * 0.4) * 5;
      trolleyGroup.position.x = trolleyX;
      
      // Grab Height & Opening
      const grabY = -4 + Math.sin(time * 0.6) * 3;
      grabGroup.position.y = grabY;
      
      const openAngle = (Math.sin(time * 1.2) + 1) * 0.4;
      grabLeft.rotation.z = openAngle;
      grabRight.rotation.z = -openAngle;

      // Cable Scaling
      const cableLength = Math.abs(grabY) + 1;
      [cable1, cable2, cable3, cable4].forEach(c => {
        c.scale.y = cableLength;
        c.position.y = grabY / 2;
      });

      // Vibration effect
      const vib = Math.sin(time * vibrationFrequency) * (vibrationAmplitude * 0.02);
      grabGroup.position.x += vib;
      grabGroup.position.z += vib;

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []); // Empty dependency array as requested

  return <div ref={containerRef} className="w-full h-full" />;
};
