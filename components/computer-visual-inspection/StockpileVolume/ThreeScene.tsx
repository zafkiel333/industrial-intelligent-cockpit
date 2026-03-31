import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StockpileState } from './three-types';

interface ThreeSceneProps {
  state: StockpileState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const pileRef = useRef<THREE.Mesh | null>(null);
  
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
    camera.position.set(10, 8, 10);
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

    // 1. Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 2. Stockpile (Dynamic Mesh)
    const geometry = new THREE.ConeGeometry(6, 4, 32, 16);
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      const dist = Math.sqrt(x * x + z * z);
      if (dist < 6) {
        vertices[i + 1] += Math.sin(x * 2) * Math.cos(z * 2) * 0.2;
      }
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x64748b,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const pile = new THREE.Mesh(geometry, material);
    pile.position.y = 2;
    pileRef.current = pile;
    scene.add(pile);

    // 3. Scanning Grid
    const gridGeo = new THREE.PlaneGeometry(15, 15, 20, 20);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.3 });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = 4.5;
    scene.add(grid);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x6366f1, 100);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Animate grid
      grid.position.y = 4.5 + Math.sin(Date.now() * 0.002) * 0.5;
      
      // Rotate pile slowly
      pile.rotation.y += 0.002;

      // Pulse color based on volume
      if (pileRef.current) {
        const mat = pileRef.current.material as THREE.MeshPhongMaterial;
        const intensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
        mat.color.setHSL(0.6, 0.5, intensity);
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
