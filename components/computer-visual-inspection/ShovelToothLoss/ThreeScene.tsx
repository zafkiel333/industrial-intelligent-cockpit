import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ToothStatus } from './three-types';

interface ThreeSceneProps {
  teeth: ToothStatus[];
  isOperating: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ teeth, isOperating }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ teeth, isOperating });

  useEffect(() => {
    propsRef.current = { teeth, isOperating };
  }, [teeth, isOperating]);

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

    // 1. Shovel Bucket (Simplified)
    const bucketGroup = new THREE.Group();
    scene.add(bucketGroup);

    const bucketGeo = new THREE.BoxGeometry(8, 6, 6);
    const bucketMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucketGroup.add(bucket);

    // 2. Teeth
    const teethGroup = new THREE.Group();
    bucketGroup.add(teethGroup);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 100);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { teeth: currentTeeth, isOperating: currentOperating } = propsRef.current;

      if (currentOperating) {
        bucketGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
      }

      // Update teeth
      if (teethGroup.children.length !== currentTeeth.length) {
        while(teethGroup.children.length > 0) {
          teethGroup.remove(teethGroup.children[0]);
        }
        currentTeeth.forEach((tooth, i) => {
          const toothGeo = new THREE.BoxGeometry(0.8, 1.5, 0.5);
          const toothMat = new THREE.MeshPhongMaterial({ 
            color: tooth.status === 'missing' ? 0xef4444 : (tooth.status === 'worn' ? 0xf59e0b : 0x94a3b8),
            transparent: tooth.status === 'missing',
            opacity: tooth.status === 'missing' ? 0.3 : 1
          });
          const toothMesh = new THREE.Mesh(toothGeo, toothMat);
          toothMesh.position.set(i * 1.5 - 3, -3.5, 3);
          teethGroup.add(toothMesh);
        });
      }

      // Pulse missing teeth
      teethGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && currentTeeth[i].status === 'missing') {
          child.material.opacity = 0.2 + Math.sin(Date.now() * 0.01) * 0.3;
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
