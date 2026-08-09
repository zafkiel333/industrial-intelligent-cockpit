import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { NavigationState } from './three-types';

interface ThreeSceneProps {
  state: NavigationState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
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
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 50, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Sea Surface
    const seaGeometry = new THREE.PlaneGeometry(2000, 2000, 10, 10);
    const seaMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.8 });
    const sea = new THREE.Mesh(seaGeometry, seaMaterial);
    sea.rotation.x = -Math.PI / 2;
    scene.add(sea);

    // Grid Helper (Radar-like)
    const grid = new THREE.GridHelper(1000, 20, 0x00ffff, 0x334155);
    scene.add(grid);

    // Ship (Simplified)
    const shipGeometry = new THREE.BoxGeometry(10, 5, 30);
    const shipMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const ship = new THREE.Mesh(shipGeometry, shipMaterial);
    scene.add(ship);

    // Radar Scan Line
    const scanGeometry = new THREE.PlaneGeometry(1000, 2);
    const scanMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const scan = new THREE.Mesh(scanGeometry, scanMaterial);
    scan.rotation.x = -Math.PI / 2;
    scene.add(scan);

    // Obstacle Markers
    const obstacleGroup = new THREE.Group();
    scene.add(obstacleGroup);

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { obstacles, heading } = stateRef.current;
      
      // Update ship heading
      ship.rotation.y = THREE.MathUtils.degToRad(heading);

      // Update scan line
      scan.rotation.y += 0.02;

      // Update obstacles
      obstacleGroup.clear();
      obstacles.forEach(obs => {
        const distance = obs.distance / 10; // Scale for visualization
        const angle = THREE.MathUtils.degToRad(obs.bearing);
        
        const x = Math.sin(angle) * distance;
        const z = -Math.cos(angle) * distance;

        const geometry = obs.type === 'ship' ? new THREE.BoxGeometry(5, 3, 15) : new THREE.SphereGeometry(2, 16, 16);
        const color = obs.risk === 'high' ? 0xf43f5e : obs.risk === 'medium' ? 0xf59e0b : 0x06b6d4;
        const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 1.5, z);
        obstacleGroup.add(mesh);

        // Risk Ring
        if (obs.risk === 'high') {
          const ringGeo = new THREE.TorusGeometry(8, 0.2, 16, 100);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.3 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(x, 0.1, z);
          obstacleGroup.add(ring);
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
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
