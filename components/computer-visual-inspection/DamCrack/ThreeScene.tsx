import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DamCrackStatus } from './three-types';

interface ThreeSceneProps {
  status: DamCrackStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<DamCrackStatus>(status);

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
    camera.position.set(15, 10, 15);

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

    // Dam Model (Sloped Terrain)
    const damGeom = new THREE.PlaneGeometry(20, 20, 32, 32);
    const pos = damGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Create a slope
      pos.setZ(i, (y + 10) * 0.5 + Math.sin(x * 0.5) * 0.2);
    }
    pos.needsUpdate = true;
    damGeom.computeVertexNormals();

    const damMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.1, 
      roughness: 0.9,
      wireframe: false
    });
    const dam = new THREE.Mesh(damGeom, damMat);
    dam.rotation.x = -Math.PI / 2;
    scene.add(dam);

    // Crack Group
    const crackGroup = new THREE.Group();
    scene.add(crackGroup);

    const crackMatLow = new THREE.LineBasicMaterial({ color: 0xf59e0b });
    const crackMatHigh = new THREE.LineBasicMaterial({ color: 0xef4444 });

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -0.1;
    scene.add(grid);

    // Drone / Camera Icon
    const droneGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const droneMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const drone = new THREE.Mesh(droneGeom, droneMat);
    scene.add(drone);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Drone Movement
      drone.position.set(Math.sin(time) * 8, 5, Math.cos(time * 0.5) * 8);

      // Update Cracks
      if (crackGroup.children.length !== s.detectedCracks.length) {
        crackGroup.clear();
        s.detectedCracks.forEach(crack => {
          const points = [];
          points.push(new THREE.Vector3(crack.x, crack.z + 0.1, -crack.y));
          points.push(new THREE.Vector3(crack.x + crack.length * 0.5, crack.z + 0.1, -crack.y + crack.length * 0.5));
          const geom = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geom, crack.severity === 'high' ? crackMatHigh : crackMatLow);
          crackGroup.add(line);
        });
      }

      // Pulsing Cracks
      crackGroup.children.forEach((line, i) => {
        const l = line as THREE.Line;
        const mat = l.material as THREE.LineBasicMaterial;
        mat.opacity = 0.5 + Math.sin(time * 5 + i) * 0.5;
        mat.transparent = true;
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
