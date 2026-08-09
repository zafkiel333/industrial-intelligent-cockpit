import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BucketState } from './three-types';

interface ThreeSceneProps {
  state: BucketState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const cracksGroupRef = useRef<THREE.Group | null>(null);
  
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
    camera.position.set(5, 5, 8);
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

    // 1. Excavator Bucket (Simplified Model)
    const bucketGroup = new THREE.Group();
    scene.add(bucketGroup);

    // Main body
    const bodyGeo = new THREE.BoxGeometry(4, 3, 3);
    const bodyMat = new THREE.MeshPhongMaterial({ 
      color: 0x475569, 
      transparent: true, 
      opacity: 0.8,
      wireframe: false 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bucketGroup.add(body);

    // Teeth
    const toothGeo = new THREE.ConeGeometry(0.2, 0.8, 4);
    const toothMat = new THREE.MeshPhongMaterial({ color: 0x1e293b });
    for (let i = 0; i < 5; i++) {
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set((i - 2) * 0.8, -1.5, 1.5);
      tooth.rotation.x = Math.PI;
      bucketGroup.add(tooth);
    }

    // 2. Cracks Group
    const cracksGroup = new THREE.Group();
    cracksGroupRef.current = cracksGroup;
    bucketGroup.add(cracksGroup);

    // 3. Scanning Effect
    const scanGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });
    const scanRing = new THREE.Mesh(scanGeo, scanMat);
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xef4444, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Rotate bucket slowly
      bucketGroup.rotation.y += 0.005;

      // Update scan ring
      scanRing.position.y = Math.sin(Date.now() * 0.001) * 3;

      // Update cracks
      if (cracksGroupRef.current) {
        // Clear old cracks
        while(cracksGroupRef.current.children.length > 0) {
          const child = cracksGroupRef.current.children[0] as THREE.Mesh;
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
          cracksGroupRef.current.remove(child);
        }
        
        // Add current cracks
        currentState.cracks.forEach(crack => {
          const crackGeo = new THREE.SphereGeometry(0.15, 16, 16);
          const crackMat = new THREE.MeshBasicMaterial({ 
            color: crack.severity === 'high' ? 0xef4444 : crack.severity === 'medium' ? 0xf59e0b : 0x10b981,
            transparent: true,
            opacity: 0.8 + Math.sin(Date.now() * 0.01) * 0.2
          });
          const crackMesh = new THREE.Mesh(crackGeo, crackMat);
          crackMesh.position.set(crack.position[0], crack.position[1], crack.position[2]);
          cracksGroupRef.current?.add(crackMesh);
        });
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
