import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LeakPoint } from './three-types';

interface ThreeSceneProps {
  leaks: LeakPoint[];
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ leaks }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ leaks });

  useEffect(() => {
    propsRef.current = { leaks };
  }, [leaks]);

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
    camera.position.set(8, 8, 8);
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
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // 1. Transformer Body (Simplified)
    const bodyGeo = new THREE.BoxGeometry(4, 5, 4);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    scene.add(body);

    // Cooling Fins
    for (let i = -1.5; i <= 1.5; i += 0.5) {
      const finGeo = new THREE.BoxGeometry(0.1, 4, 4.5);
      const finMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
      const finLeft = new THREE.Mesh(finGeo, finMat);
      finLeft.position.set(-2.1, 0, 0);
      finLeft.position.x += i * 0.1;
      scene.add(finLeft);

      const finRight = new THREE.Mesh(finGeo, finMat);
      finRight.position.set(2.1, 0, 0);
      finRight.position.x += i * 0.1;
      scene.add(finRight);
    }

    // 2. Leak Markers
    const leakGroup = new THREE.Group();
    scene.add(leakGroup);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 10);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { leaks: currentLeaks } = propsRef.current;

      // Update leaks
      if (leakGroup.children.length !== currentLeaks.length) {
        while(leakGroup.children.length > 0) {
          leakGroup.remove(leakGroup.children[0]);
        }
        currentLeaks.forEach(leak => {
          const dripGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const dripMat = new THREE.MeshBasicMaterial({ 
            color: leak.severity === 'high' ? 0xef4444 : 0xf59e0b,
            transparent: true,
            opacity: 0.8
          });
          const drip = new THREE.Mesh(dripGeo, dripMat);
          drip.position.set(leak.position[0], leak.position[1], leak.position[2]);
          leakGroup.add(drip);

          // Add a "stain" below
          const stainGeo = new THREE.CircleGeometry(0.4, 32);
          const stainMat = new THREE.MeshBasicMaterial({ color: dripMat.color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
          const stain = new THREE.Mesh(stainGeo, stainMat);
          stain.position.set(leak.position[0], leak.position[1] - 1, leak.position[2]);
          stain.rotation.x = Math.PI / 2;
          leakGroup.add(stain);
        });
      }

      // Drip animation
      leakGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry') {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.005 + i) * 0.2);
        }
      });

      scene.rotation.y += 0.005;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

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
