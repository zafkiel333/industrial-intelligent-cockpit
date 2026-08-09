import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    speed: 5,
    depth: 400,
    vibration: 0.5,
  });

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
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(120, 80, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Hoist Structure
    const hoistGroup = new THREE.Group();
    scene.add(hoistGroup);

    // Main Drum
    const drumGeom = new THREE.CylinderGeometry(20, 20, 40, 64);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    drum.rotation.z = Math.PI / 2;
    hoistGroup.add(drum);

    // Drum Wireframe
    const drumWire = new THREE.WireframeGeometry(drumGeom);
    const drumWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const drumWireMesh = new THREE.LineSegments(drumWire, drumWireMat);
    drumWireMesh.rotation.z = Math.PI / 2;
    hoistGroup.add(drumWireMesh);

    // Shaft Structure (Tower)
    const towerGeom = new THREE.BoxGeometry(100, 200, 100);
    const towerWire = new THREE.WireframeGeometry(towerGeom);
    const towerMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1 });
    const tower = new THREE.LineSegments(towerWire, towerMat);
    tower.position.y = -100;
    scene.add(tower);

    // Cables
    const cableGeom = new THREE.CylinderGeometry(0.5, 0.5, 300, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const cable1 = new THREE.Mesh(cableGeom, cableMat);
    cable1.position.set(10, -150, 0);
    scene.add(cable1);

    const cable2 = new THREE.Mesh(cableGeom, cableMat);
    cable2.position.set(-10, -150, 0);
    scene.add(cable2);

    // Cage
    const cageGeom = new THREE.BoxGeometry(15, 25, 15);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2 });
    const cage = new THREE.Mesh(cageGeom, cageMat);
    scene.add(cage);

    const cageWire = new THREE.WireframeGeometry(cageGeom);
    const cageWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8 });
    const cageWireMesh = new THREE.LineSegments(cageWire, cageWireMat);
    cage.add(cageWireMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 200);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Rotate Drum
      drum.rotation.x += speed * 0.01;
      drumWireMesh.rotation.x += speed * 0.01;

      // Move Cage
      const cageY = Math.sin(time * 0.5) * 80 - 100;
      cage.position.y = cageY;
      
      // Vibration
      cage.position.x = Math.sin(time * 20) * vibration;

      // Update Cables
      cable1.scale.y = (200 - cageY) / 150;
      cable1.position.y = (cageY + 20) / 2;
      cable2.scale.y = (200 - cageY) / 150;
      cable2.position.y = (cageY + 20) / 2;

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
