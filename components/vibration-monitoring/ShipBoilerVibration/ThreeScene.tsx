import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BoilerState } from './three-types';

interface ThreeSceneProps {
  state?: BoilerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<BoilerState>(state || {
    steamPressure: 1.2,
    vibrationIntensity: 0.1,
    waterLevel: 50,
    burnerStatus: 'normal',
    temperature: 180
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
    camera.position.set(12, 10, 15);

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

    const directionalLight = new THREE.DirectionalLight(0xffaa00, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Boiler Model
    const boilerGroup = new THREE.Group();
    scene.add(boilerGroup);

    // Main Drum
    const drumGeom = new THREE.CylinderGeometry(2.5, 2.5, 6, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    drum.rotation.z = Math.PI / 2;
    boilerGroup.add(drum);

    // Burner
    const burnerGeom = new THREE.CylinderGeometry(1, 1, 1.5, 32);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const burner = new THREE.Mesh(burnerGeom, burnerMat);
    burner.rotation.z = Math.PI / 2;
    burner.position.set(-3.5, 0, 0);
    boilerGroup.add(burner);

    // Flame (glow)
    const flameGeom = new THREE.SphereGeometry(0.8, 16, 16);
    const flameMat = new THREE.MeshStandardMaterial({ 
      color: 0xff4400, 
      emissive: 0xff4400, 
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.8
    });
    const flame = new THREE.Mesh(flameGeom, flameMat);
    flame.position.set(-4.5, 0, 0);
    boilerGroup.add(flame);

    // Pipes
    const pipeGeom = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    
    const pipe1 = new THREE.Mesh(pipeGeom, pipeMat);
    pipe1.position.set(1, 3, 0);
    boilerGroup.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeGeom, pipeMat);
    pipe2.position.set(-1, 3, 0);
    boilerGroup.add(pipe2);

    // Grid
    const grid = new THREE.GridHelper(20, 10, 0xffaa00, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { vibrationIntensity, burnerStatus } = stateRef.current;
      const time = Date.now() * 0.001;

      // Flame pulse
      if (burnerStatus === 'normal') {
        flame.scale.setScalar(0.8 + Math.sin(time * 10) * 0.2);
        flame.material.emissiveIntensity = 2 + Math.sin(time * 15) * 0.5;
      } else {
        flame.scale.setScalar(0.5);
        flame.material.emissiveIntensity = 0.5;
      }

      // Vibration effect
      const vib = Math.sin(time * 100) * (vibrationIntensity * 0.03);
      boilerGroup.position.y = vib;

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
