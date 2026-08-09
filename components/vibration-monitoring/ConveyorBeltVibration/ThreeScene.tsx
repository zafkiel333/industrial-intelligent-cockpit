import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(30, 30, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Conveyor Drum
    const drumGeom = new THREE.CylinderGeometry(10, 10, 30, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    drum.rotation.z = Math.PI / 2;
    scene.add(drum);

    // Belt (Simplified)
    const beltGeom = new THREE.BoxGeometry(100, 1, 20);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.y = 10;
    scene.add(belt);

    // Vibration Sensors (Small glowing boxes)
    const sensorGeom = new THREE.BoxGeometry(1, 1, 1);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    
    const sensor1 = new THREE.Mesh(sensorGeom, sensorMat);
    sensor1.position.set(15, 0, 10);
    scene.add(sensor1);

    const sensor2 = sensor1.clone();
    sensor2.position.set(-15, 0, 10);
    scene.add(sensor2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      drum.rotation.x += 0.1;
      
      // Vibration simulation
      const vib = Math.sin(time * 30) * 0.05;
      drum.position.y = vib;
      sensor1.scale.setScalar(1 + vib * 5);
      sensor2.scale.setScalar(1 + vib * 5);

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

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
