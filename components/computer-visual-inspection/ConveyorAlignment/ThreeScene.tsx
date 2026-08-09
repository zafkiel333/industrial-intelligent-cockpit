import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AlignmentState } from './three-types';

interface ThreeSceneProps {
  state: AlignmentState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ state });

  useEffect(() => {
    propsRef.current = { state };
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 1. Conveyor Structure
    const beltGroup = new THREE.Group();
    scene.add(beltGroup);

    const beltGeo = new THREE.BoxGeometry(20, 0.2, 4);
    const beltMat = new THREE.MeshPhongMaterial({ color: 0x111827 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    beltGroup.add(belt);

    // Rollers
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const rollerMat = new THREE.MeshPhongMaterial({ color: 0x374151 });
    
    for (let i = -8; i <= 8; i += 4) {
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.rotation.z = Math.PI / 2;
      roller.position.x = i;
      roller.position.y = -0.6;
      beltGroup.add(roller);
    }

    // 2. Alignment Markers
    const markerGeo = new THREE.PlaneGeometry(0.1, 6);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.5 });
    const leftMarker = new THREE.Mesh(markerGeo, markerMat);
    leftMarker.rotation.x = Math.PI / 2;
    leftMarker.position.set(0, 0.1, -2);
    scene.add(leftMarker);

    const rightMarker = new THREE.Mesh(markerGeo, markerMat);
    rightMarker.rotation.x = Math.PI / 2;
    rightMarker.position.set(0, 0.1, 2);
    scene.add(rightMarker);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 100);
    spotLight.position.set(0, 15, 5);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Simulate belt deviation
      // Map deviation mm to three units (e.g., 100mm = 0.5 units)
      const targetZ = currentState.deviation / 200;
      belt.position.z = THREE.MathUtils.lerp(belt.position.z, targetZ, 0.1);

      // Color belt based on deviation severity
      if (Math.abs(currentState.deviation) > 150) {
        belt.material.color.set(0xef4444);
      } else if (Math.abs(currentState.deviation) > 80) {
        belt.material.color.set(0xf59e0b);
      } else {
        belt.material.color.set(0x111827);
      }

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
