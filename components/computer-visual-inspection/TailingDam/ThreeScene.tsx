import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DamStatus } from './three-types';

interface ThreeSceneProps {
  status: DamStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<DamStatus>(status);

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
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ff88, 1.2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(-20, 10, -20);
    scene.add(pointLight);

    // Dam Model
    const damGroup = new THREE.Group();
    scene.add(damGroup);

    // Dam Body (Trapezoid-ish)
    const damGeom = new THREE.BoxGeometry(40, 10, 10);
    const damMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.3, 
      roughness: 0.8 
    });
    const dam = new THREE.Mesh(damGeom, damMat);
    dam.position.y = 0;
    damGroup.add(dam);

    // Water Body
    const waterGeom = new THREE.BoxGeometry(40, 5, 20);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.set(0, -2.5, -15);
    damGroup.add(water);

    // Dry Beach
    const beachGeom = new THREE.PlaneGeometry(40, 10);
    const beachMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      side: THREE.DoubleSide 
    });
    const beach = new THREE.Mesh(beachGeom, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, 5, -5);
    damGroup.add(beach);

    // Saturation Line (Glowy line inside dam)
    const linePoints = [];
    for (let i = -20; i <= 20; i++) {
      linePoints.push(new THREE.Vector3(i, 0, 0));
    }
    const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
    const saturationLine = new THREE.Line(lineGeom, lineMat);
    saturationLine.position.set(0, 0, 0);
    damGroup.add(saturationLine);

    // Grid
    const grid = new THREE.GridHelper(100, 50, 0x00ff88, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Beach length visual (scale beach)
      beach.scale.y = s.beachLength / 50;
      beach.position.z = -5 - (s.beachLength / 2);

      // Water level visual
      water.scale.y = s.waterLevel / 5;
      water.position.y = -5 + (s.waterLevel / 2);

      // Saturation line visual (depth)
      saturationLine.position.y = 5 - s.saturationLine;
      lineMat.color.setHex(s.safetyFactor < 1.2 ? 0xef4444 : 0x00ff88);

      // Water ripple
      waterMat.opacity = 0.5 + Math.sin(time * 2) * 0.1;

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
