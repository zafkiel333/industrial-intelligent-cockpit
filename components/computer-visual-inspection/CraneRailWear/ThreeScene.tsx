import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CraneRailWearStatus } from './three-types';

interface ThreeSceneProps {
  status: CraneRailWearStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<CraneRailWearStatus>(status);

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
    camera.position.set(12, 8, 12);

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

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Rail Model
    const railGroup = new THREE.Group();
    scene.add(railGroup);

    const railMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x000000
    });
    
    // Main Rail Body
    const railGeom = new THREE.BoxGeometry(0.6, 0.8, 20);
    const rail = new THREE.Mesh(railGeom, railMat);
    railGroup.add(rail);

    // Wear Surface (Top of the rail)
    const surfaceGeom = new THREE.PlaneGeometry(0.6, 20);
    const surfaceMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 1, 
      roughness: 0.05,
      emissive: 0x00ffff,
      emissiveIntensity: 0.1
    });
    const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0.401;
    railGroup.add(surface);

    // Supports/Mounts
    const mountGeom = new THREE.BoxGeometry(1.2, 0.2, 0.6);
    const mountMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    for (let z = -9; z <= 9; z += 3) {
      const mount = new THREE.Mesh(mountGeom, mountMat);
      mount.position.set(0, -0.5, z);
      railGroup.add(mount);
      
      // Bolts
      const boltGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
      const boltMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const b1 = new THREE.Mesh(boltGeom, boltMat);
      b1.position.set(0.4, 0.15, 0);
      mount.add(b1);
      const b2 = new THREE.Mesh(boltGeom, boltMat);
      b2.position.set(-0.4, 0.15, 0);
      mount.add(b2);
    }

    // Scanning Laser Effect
    const laserGroup = new THREE.Group();
    scene.add(laserGroup);

    const laserLineGeom = new THREE.CylinderGeometry(0.01, 0.01, 2, 8);
    const laserLineMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.6 
    });
    const laserLine = new THREE.Mesh(laserLineGeom, laserLineMat);
    laserLine.rotation.z = Math.PI / 2;
    laserLine.position.y = 1;
    laserGroup.add(laserLine);

    const scanPlaneGeom = new THREE.PlaneGeometry(2, 1);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeom, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scanPlane.position.y = 0.5;
    laserGroup.add(scanPlane);

    // Grid
    const grid = new THREE.GridHelper(25, 25, 0x00ffff, 0x1e293b);
    grid.position.y = -0.6;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Laser movement
      const scanRange = 9;
      laserGroup.position.z = Math.sin(time * 0.5) * scanRange;
      
      // Laser pulse
      laserLineMat.opacity = 0.4 + Math.sin(time * 10) * 0.2;
      scanPlaneMat.opacity = 0.05 + Math.sin(time * 10) * 0.05;

      // Anomaly Visual
      if (s.isAnomalyDetected) {
        surfaceMat.emissive.setHex(0xef4444);
        surfaceMat.emissiveIntensity = 0.3 + Math.sin(time * 12) * 0.3;
        laserLineMat.color.setHex(0xef4444);
        scanPlaneMat.color.setHex(0xef4444);
      } else if (s.wearDepth > 2) {
        surfaceMat.emissive.setHex(0xf59e0b);
        surfaceMat.emissiveIntensity = 0.2 + Math.sin(time * 6) * 0.2;
        laserLineMat.color.setHex(0xf59e0b);
        scanPlaneMat.color.setHex(0xf59e0b);
      } else {
        surfaceMat.emissive.setHex(0x00ffff);
        surfaceMat.emissiveIntensity = 0.1;
        laserLineMat.color.setHex(0x00ffff);
        scanPlaneMat.color.setHex(0x00ffff);
      }

      // Vibration effect
      if (s.vibrationAmplitude > 0.5) {
        railGroup.position.x = (Math.random() - 0.5) * (s.vibrationAmplitude * 0.05);
        railGroup.position.y = (Math.random() - 0.5) * (s.vibrationAmplitude * 0.02);
      } else {
        railGroup.position.x = 0;
        railGroup.position.y = 0;
      }

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
