import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PPEStatus } from './three-types';

interface ThreeSceneProps {
  status: PPEStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<PPEStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Mannequin Model (Simplified)
    const mannequin = new THREE.Group();
    scene.add(mannequin);

    // Body parts
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.8 });
    const ppeMatOk = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5 });
    const ppeMatFail = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.8), bodyMat);
    torso.position.y = 3.5;
    mannequin.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), bodyMat);
    head.position.y = 5.2;
    mannequin.add(head);

    // Helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), ppeMatOk);
    helmet.position.y = 5.3;
    mannequin.add(helmet);

    // Vest
    const vest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.9), ppeMatOk);
    vest.position.y = 3.5;
    vest.visible = false; // Will be toggled
    mannequin.add(vest);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.6, 2.5, 0.6);
    const legL = new THREE.Mesh(legGeom, bodyMat);
    legL.position.set(-0.4, 1.25, 0);
    mannequin.add(legL);
    const legR = new THREE.Mesh(legGeom, bodyMat);
    legR.position.set(0.4, 1.25, 0);
    mannequin.add(legR);

    // Boots
    const bootGeom = new THREE.BoxGeometry(0.7, 0.4, 1);
    const bootL = new THREE.Mesh(bootGeom, ppeMatOk);
    bootL.position.set(-0.4, 0.2, 0.2);
    mannequin.add(bootL);
    const bootR = new THREE.Mesh(bootGeom, ppeMatOk);
    bootR.position.set(0.4, 0.2, 0.2);
    mannequin.add(bootR);

    // Detection Boxes
    const boxGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 6, 1.5));
    const boxMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const detectionBox = new THREE.LineSegments(boxGeom, boxMat);
    detectionBox.position.y = 3;
    scene.add(detectionBox);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Update PPE Visuals
      helmet.material = s.helmetDetected ? ppeMatOk : ppeMatFail;
      helmet.visible = true; // Always show to indicate check

      bootL.material = s.bootsDetected ? ppeMatOk : ppeMatFail;
      bootR.material = s.bootsDetected ? ppeMatOk : ppeMatFail;

      // Scanning effect
      detectionBox.position.y = 3 + Math.sin(time * 2) * 0.1;
      boxMat.color.setHex(s.isViolation ? 0xff0000 : 0x00ffff);

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
