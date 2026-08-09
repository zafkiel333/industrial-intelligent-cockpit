import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LightingStatus } from './three-types';

interface ThreeSceneProps {
  status: LightingStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<LightingStatus>(status);

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
    camera.position.set(20, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Darker ambient
    scene.add(ambientLight);

    // Streetlight Model
    const lightGroup = new THREE.Group();
    scene.add(lightGroup);

    const poleGeom = new THREE.CylinderGeometry(0.1, 0.15, 6, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    
    const headGeom = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });

    const lightSourceGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const lightSourceMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

    const poles: THREE.Group[] = [];
    const sources: THREE.Mesh[] = [];
    const glows: THREE.PointLight[] = [];

    const rows = 3;
    const cols = 4;
    const spacing = 8;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const poleContainer = new THREE.Group();
        poleContainer.position.set(c * spacing - (cols * spacing) / 2, 0, r * spacing - (rows * spacing) / 2);
        
        const pole = new THREE.Mesh(poleGeom, poleMat);
        pole.position.y = 3;
        poleContainer.add(pole);

        const head = new THREE.Mesh(headGeom, headMat);
        head.position.set(0.3, 6, 0);
        poleContainer.add(head);

        const source = new THREE.Mesh(lightSourceGeom, lightSourceMat.clone());
        source.position.set(0.3, 5.9, 0);
        poleContainer.add(source);
        sources.push(source);

        const glow = new THREE.PointLight(0xffffcc, 1, 10);
        glow.position.set(0.3, 5.5, 0);
        poleContainer.add(glow);
        glows.push(glow);

        lightGroup.add(poleContainer);
        poles.push(poleContainer);
      }
    }

    // Grid
    const grid = new THREE.GridHelper(60, 60, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Update light status
      const failedCount = s.failedLights;
      sources.forEach((source, idx) => {
        const isFailed = idx < failedCount;
        const mat = source.material as THREE.MeshBasicMaterial;
        const glow = glows[idx];

        if (isFailed) {
          // Flickering or off
          const flicker = Math.random() > 0.9 ? 0.5 : 0;
          mat.color.setRGB(flicker, flicker, flicker * 0.5);
          glow.intensity = flicker * 2;
        } else {
          mat.color.setHex(0xffffcc);
          glow.intensity = 1 + Math.sin(time * 2) * 0.1;
        }
      });

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
