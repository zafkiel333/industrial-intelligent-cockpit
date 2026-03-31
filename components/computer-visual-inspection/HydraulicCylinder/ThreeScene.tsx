import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CylinderScratch } from './three-types';

interface ThreeSceneProps {
  scratches: CylinderScratch[];
  isMoving: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ scratches, isMoving }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ scratches, isMoving });

  useEffect(() => {
    propsRef.current = { scratches, isMoving };
  }, [scratches, isMoving]);

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
    camera.position.set(5, 5, 10);
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

    // 1. Cylinder Body
    const cylinderGroup = new THREE.Group();
    scene.add(cylinderGroup);

    const bodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 6, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    cylinderGroup.add(body);

    // 2. Piston Rod
    const rodGroup = new THREE.Group();
    cylinderGroup.add(rodGroup);
    const rodGeo = new THREE.CylinderGeometry(0.6, 0.6, 8, 32);
    const rodMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 100 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.y = 4;
    rodGroup.add(rod);

    // 3. Scratches
    const scratchMarkers = new THREE.Group();
    rodGroup.add(scratchMarkers);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 100);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { scratches: currentScratches, isMoving: currentMoving } = propsRef.current;

      if (currentMoving) {
        rodGroup.position.y = Math.sin(Date.now() * 0.002) * 2;
      }

      // Update scratches
      if (scratchMarkers.children.length !== currentScratches.length) {
        while(scratchMarkers.children.length > 0) {
          scratchMarkers.remove(scratchMarkers.children[0]);
        }
        currentScratches.forEach((scratch) => {
          const scratchGeo = new THREE.BoxGeometry(0.1, scratch.length / 10, 0.1);
          const scratchMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const scratchMesh = new THREE.Mesh(scratchGeo, scratchMat);
          scratchMesh.position.set(0.61, (scratch.position * 8) - 4, 0);
          scratchMarkers.add(scratchMesh);
        });
      }

      // Pulse scratches
      scratchMarkers.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.material.opacity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
        }
      });

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
