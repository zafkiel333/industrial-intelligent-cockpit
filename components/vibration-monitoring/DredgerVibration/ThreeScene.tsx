import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DredgerState } from './three-types';

interface ThreeSceneProps {
  state?: DredgerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<DredgerState>(state || {
    cutterSpeed: 30,
    vibrationIntensity: 0.4,
    pumpPressure: 2.5,
    swingSpeed: 15,
    dredgingDepth: 12
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
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Dredger Model (Simplified)
    const dredgerGroup = new THREE.Group();
    scene.add(dredgerGroup);

    // Hull
    const hullGeom = new THREE.BoxGeometry(15, 3, 6);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const hull = new THREE.Mesh(hullGeom, hullMat);
    dredgerGroup.add(hull);

    // Ladder (The arm holding the cutter)
    const ladderGroup = new THREE.Group();
    ladderGroup.position.set(7.5, 0, 0);
    dredgerGroup.add(ladderGroup);

    const ladderGeom = new THREE.BoxGeometry(10, 1, 2);
    const ladder = new THREE.Mesh(ladderGeom, hullMat);
    ladder.position.set(5, 0, 0);
    ladderGroup.add(ladder);

    // Cutter Head
    const cutterGeom = new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cutterMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, wireframe: true });
    const cutter = new THREE.Mesh(cutterGeom, cutterMat);
    cutter.position.set(10, 0, 0);
    cutter.rotation.z = -Math.PI / 2;
    ladderGroup.add(cutter);

    // Spuds (The legs at the back)
    const spudGeom = new THREE.CylinderGeometry(0.3, 0.3, 10);
    const spudMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const spud1 = new THREE.Mesh(spudGeom, spudMat);
    spud1.position.set(-6, 2, 2);
    dredgerGroup.add(spud1);

    const spud2 = new THREE.Mesh(spudGeom, spudMat);
    spud2.position.set(-6, 2, -2);
    dredgerGroup.add(spud2);

    // Water Surface
    const waterGeom = new THREE.PlaneGeometry(100, 100, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0088ff, transparent: true, opacity: 0.3, wireframe: true });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.5;
    scene.add(water);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { cutterSpeed, vibrationIntensity, swingSpeed, dredgingDepth } = stateRef.current;
      const time = Date.now() * 0.001;

      // Cutter rotation
      cutter.rotation.y += cutterSpeed * 0.01;

      // Ladder swing & depth
      ladderGroup.rotation.z = THREE.MathUtils.lerp(ladderGroup.rotation.z, -dredgingDepth * 0.05, 0.05);
      ladderGroup.rotation.y = Math.sin(time * swingSpeed * 0.1) * 0.3;

      // Vibration
      const vib = Math.sin(time * 60) * (vibrationIntensity * 0.05);
      ladder.position.y = vib;
      cutter.position.y = vib;

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
