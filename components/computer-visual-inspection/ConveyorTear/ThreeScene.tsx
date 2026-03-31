import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TearAnomalies } from './three-types';

interface ThreeSceneProps {
  anomalies: TearAnomalies[];
  speed: number;
  isScanning: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ anomalies, speed, isScanning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ anomalies, speed, isScanning });

  useEffect(() => {
    propsRef.current = { anomalies, speed, isScanning };
  }, [anomalies, speed, isScanning]);

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

    // 1. Conveyor Belt
    const beltGroup = new THREE.Group();
    scene.add(beltGroup);

    const beltGeo = new THREE.BoxGeometry(20, 0.2, 4);
    const beltMat = new THREE.MeshPhongMaterial({ color: 0x111827 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    beltGroup.add(belt);

    // Rollers
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 4.2, 32);
    const rollerMat = new THREE.MeshPhongMaterial({ color: 0x374151 });
    const roller1 = new THREE.Mesh(rollerGeo, rollerMat);
    roller1.rotation.z = Math.PI / 2;
    roller1.position.x = -9.5;
    beltGroup.add(roller1);

    const roller2 = new THREE.Mesh(rollerGeo, rollerMat);
    roller2.rotation.z = Math.PI / 2;
    roller2.position.x = 9.5;
    beltGroup.add(roller2);

    // 2. Scanning Laser
    const laserGeo = new THREE.PlaneGeometry(0.1, 4.2);
    const laserMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0.8,
      side: THREE.DoubleSide 
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    laser.position.y = 0.2;
    scene.add(laser);

    // 3. Tear Markers
    const tearGroup = new THREE.Group();
    scene.add(tearGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 50);
    spotLight.position.set(0, 10, 5);
    scene.add(spotLight);

    // 5. Animation Loop
    let beltOffset = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { speed: currentSpeed, isScanning: currentScanning, anomalies: currentAnomalies } = propsRef.current;

      // Animate belt texture/offset simulation
      if (currentSpeed > 0) {
        beltOffset += currentSpeed * 0.01;
        roller1.rotation.x += currentSpeed * 0.1;
        roller2.rotation.x += currentSpeed * 0.1;
      }

      // Laser scanning effect
      if (currentScanning) {
        laser.visible = true;
        laser.position.x = Math.sin(Date.now() * 0.005) * 8;
      } else {
        laser.visible = false;
      }

      // Update tears
      if (tearGroup.children.length !== currentAnomalies.length) {
        while(tearGroup.children.length > 0) {
          tearGroup.remove(tearGroup.children[0]);
        }
        currentAnomalies.forEach(anomaly => {
          const tearGeo = new THREE.PlaneGeometry(anomaly.length / 100, 0.1);
          const tearMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
          const tear = new THREE.Mesh(tearGeo, tearMat);
          // Map position 0-100 to -9 to 9
          tear.position.set((anomaly.position / 50 - 1) * 9, 0.11, (Math.random() - 0.5) * 3);
          tear.rotation.x = Math.PI / 2;
          tearGroup.add(tear);
        });
      }

      // Pulse tears
      tearGroup.children.forEach((child) => {
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
