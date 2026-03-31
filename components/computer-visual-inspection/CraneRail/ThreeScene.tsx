import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CraneRailStatus } from './three-types';

interface ThreeSceneProps {
  status: CraneRailStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<CraneRailStatus>(status);

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
    camera.position.set(10, 5, 10);

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
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Rail Track Model
    const trackGroup = new THREE.Group();
    scene.add(trackGroup);

    const railMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x000000
    });
    
    // Left Rail
    const railGeom = new THREE.BoxGeometry(0.4, 0.6, 20);
    const leftRail = new THREE.Mesh(railGeom, railMat);
    leftRail.position.x = -2.5;
    trackGroup.add(leftRail);

    // Right Rail
    const rightRail = new THREE.Mesh(railGeom, railMat);
    rightRail.position.x = 2.5;
    trackGroup.add(rightRail);

    // Sleepers/Supports (Futuristic look)
    const sleeperGeom = new THREE.BoxGeometry(6, 0.15, 0.4);
    const sleeperMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a,
      metalness: 0.5,
      roughness: 0.5
    });
    for (let z = -10; z <= 10; z += 1.5) {
      const sleeper = new THREE.Mesh(sleeperGeom, sleeperMat);
      sleeper.position.set(0, -0.4, z);
      trackGroup.add(sleeper);
      
      // Add small lights to sleepers
      const lightGeom = new THREE.BoxGeometry(0.1, 0.05, 0.1);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const l1 = new THREE.Mesh(lightGeom, lightMat);
      l1.position.set(-2.8, 0.1, 0);
      sleeper.add(l1);
      const l2 = new THREE.Mesh(lightGeom, lightMat);
      l2.position.set(2.8, 0.1, 0);
      sleeper.add(l2);
    }

    // Crane Carriage (Simplified but high-tech)
    const carriageGroup = new THREE.Group();
    scene.add(carriageGroup);

    const carriageBodyGeom = new THREE.BoxGeometry(6, 0.5, 2);
    const carriageMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const carriageBody = new THREE.Mesh(carriageBodyGeom, carriageMat);
    carriageBody.position.y = 1.2;
    carriageGroup.add(carriageBody);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1, roughness: 0.1 });
    
    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      [-2.5, 0.5, 0.8], [-2.5, 0.5, -0.8],
      [2.5, 0.5, 0.8], [2.5, 0.5, -0.8]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      carriageGroup.add(wheel);
      wheels.push(wheel);
    });

    // Laser Scanner Effect
    const laserGroup = new THREE.Group();
    carriageGroup.add(laserGroup);

    const laserLineGeom = new THREE.CylinderGeometry(0.02, 0.02, 6, 8);
    const laserLineMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.5 
    });
    const laserLine = new THREE.Mesh(laserLineGeom, laserLineMat);
    laserLine.rotation.z = Math.PI / 2;
    laserLine.position.y = -0.5;
    laserGroup.add(laserLine);

    // Laser Plane (Scan area)
    const scanPlaneGeom = new THREE.PlaneGeometry(6, 2);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeom, scanPlaneMat);
    scanPlane.rotation.x = Math.PI / 2;
    scanPlane.position.y = -0.6;
    laserGroup.add(scanPlane);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x00ffff, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Carriage movement
      const moveRange = 8;
      const zPos = Math.sin(time * 0.3) * moveRange;
      carriageGroup.position.z = zPos;
      
      // Wheel rotation
      wheels.forEach(w => {
        w.rotation.x += 0.05;
      });

      // Laser pulse
      laserLineMat.opacity = 0.3 + Math.sin(time * 10) * 0.2;
      scanPlaneMat.opacity = 0.05 + Math.sin(time * 10) * 0.05;

      // Gauge Deviation Visual (Dynamic rail shift)
      const targetX = 2.5 + (s.gaugeDeviation * 0.02); // Scaled for visual
      rightRail.position.x += (targetX - rightRail.position.x) * 0.05;
      
      // Update wheels on right side to follow rail
      wheels[2].position.x = rightRail.position.x;
      wheels[3].position.x = rightRail.position.x;

      // Wear Visual (Color/Emissive)
      if (s.railWear > 3 || s.isDeformed) {
        railMat.emissive.setHex(0xef4444);
        railMat.emissiveIntensity = 0.3 + Math.sin(time * 12) * 0.3;
        laserLineMat.color.setHex(0xef4444);
        scanPlaneMat.color.setHex(0xef4444);
      } else if (s.railWear > 1.5) {
        railMat.emissive.setHex(0xf59e0b);
        railMat.emissiveIntensity = 0.2 + Math.sin(time * 6) * 0.2;
        laserLineMat.color.setHex(0xf59e0b);
        scanPlaneMat.color.setHex(0xf59e0b);
      } else {
        railMat.emissiveIntensity = 0.05;
        railMat.emissive.setHex(0x00ffff);
        laserLineMat.color.setHex(0x00ffff);
        scanPlaneMat.color.setHex(0x00ffff);
      }

      // Vibration (Shake carriage)
      if (s.vibrationLevel > 5) {
        carriageGroup.position.x = (Math.random() - 0.5) * (s.vibrationLevel * 0.01);
        carriageGroup.position.y = (Math.random() - 0.5) * (s.vibrationLevel * 0.005);
      } else {
        carriageGroup.position.x = 0;
        carriageGroup.position.y = 0;
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
