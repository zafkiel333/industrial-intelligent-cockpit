import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SealDefect } from './three-types';

interface ThreeSceneProps {
  defects: SealDefect[];
  leakageRate: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ defects, leakageRate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ defects, leakageRate });

  useEffect(() => {
    propsRef.current = { defects, leakageRate };
  }, [defects, leakageRate]);

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
    camera.position.set(5, 5, 5);
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

    // 1. Gate Section (Simplified)
    const gateGeo = new THREE.BoxGeometry(1, 10, 4);
    const gateMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    scene.add(gate);

    // 2. Rubber Seal (Highlighted)
    const sealGeo = new THREE.BoxGeometry(0.2, 10, 0.5);
    const sealMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.x = 0.6;
    scene.add(seal);

    // 3. Water Particles (Leakage)
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      
      velocities[i * 3] = 0.1 + Math.random() * 0.2;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particles, pMaterial);
    scene.add(particleSystem);

    // 4. Defect Markers
    const defectGroup = new THREE.Group();
    scene.add(defectGroup);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 6. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { leakageRate: currentLeakage, defects: currentDefects } = propsRef.current;

      // Update particles based on leakage rate
      const posAttr = particles.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        if (i < currentLeakage * 10) {
          posAttr.setX(i, posAttr.getX(i) + velocities[i * 3]);
          posAttr.setY(i, posAttr.getY(i) + velocities[i * 3 + 1]);
          posAttr.setZ(i, posAttr.getZ(i) + velocities[i * 3 + 2]);

          if (posAttr.getX(i) > 5) {
            posAttr.setX(i, 0.6);
            posAttr.setY(i, (Math.random() - 0.5) * 10);
            posAttr.setZ(i, (Math.random() - 0.5) * 4);
          }
        } else {
          posAttr.setX(i, -100); // Hide
        }
      }
      posAttr.needsUpdate = true;

      // Update defects
      if (defectGroup.children.length !== currentDefects.length) {
        while(defectGroup.children.length > 0) {
          defectGroup.remove(defectGroup.children[0]);
        }
        currentDefects.forEach(defect => {
          const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(defect.position[0], defect.position[1], defect.position[2]);
          defectGroup.add(marker);
        });
      }

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
