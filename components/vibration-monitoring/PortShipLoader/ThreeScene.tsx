import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShipLoaderState } from './three-types';

interface ThreeSceneProps {
  state?: ShipLoaderState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ShipLoaderState>(state || {
    vibrationFrequency: 45,
    vibrationAmplitude: 1.8,
    motorLoad: 75,
    boomAngle: 15,
    loadingRate: 2500
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Ship Loader Model (Enhanced Sci-Fi Style)
    const loaderGroup = new THREE.Group();
    scene.add(loaderGroup);

    // Base - Rotating Platform
    const baseGeom = new THREE.CylinderGeometry(4, 4.5, 1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    loaderGroup.add(base);

    // Tower
    const towerGeom = new THREE.BoxGeometry(2.5, 8, 2.5);
    const tower = new THREE.Mesh(towerGeom, baseMat);
    tower.position.y = 4.5;
    loaderGroup.add(tower);

    // Boom Structure
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 8, 0);
    loaderGroup.add(boomGroup);

    const boomMainGeom = new THREE.BoxGeometry(16, 1, 1.5);
    const boomMain = new THREE.Mesh(boomMainGeom, baseMat);
    boomMain.position.x = 8;
    boomGroup.add(boomMain);

    // Counterweight
    const cwGeom = new THREE.BoxGeometry(3, 2, 2);
    const cw = new THREE.Mesh(cwGeom, baseMat);
    cw.position.x = -2;
    boomGroup.add(cw);

    // Telescopic Chute
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(15, -0.5, 0);
    boomGroup.add(chuteGroup);

    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.7 });
    
    const chute1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3, 16), chuteMat);
    chute1.position.y = -1.5;
    chuteGroup.add(chute1);

    const chute2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 16), chuteMat);
    chute2.position.y = -3.5;
    chuteGroup.add(chute2);

    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x1e293b);
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { vibrationFrequency, vibrationAmplitude, boomAngle } = stateRef.current;
      const time = Date.now() * 0.001;

      // Boom Rotation & Slewing
      loaderGroup.rotation.y = Math.sin(time * 0.2) * 0.5;
      boomGroup.rotation.z = THREE.MathUtils.degToRad(boomAngle) + Math.sin(time * 0.3) * 0.05;

      // Chute Extension
      chute2.position.y = -3.5 + Math.sin(time * 0.5) * 1.5;

      // Vibration effect
      const vib = Math.sin(time * vibrationFrequency) * (vibrationAmplitude * 0.02);
      chuteGroup.position.x = 15 + vib;
      chuteGroup.position.z = vib;

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
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
