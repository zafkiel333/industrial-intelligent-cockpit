import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SecurityStatus } from './three-types';

interface ThreeSceneProps {
  status: SecurityStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<SecurityStatus>(status);

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

    // Ground
    const groundGeom = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.1, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Fence
    const fenceGroup = new THREE.Group();
    scene.add(fenceGroup);

    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    for (let i = 0; i < 4; i++) {
      const fenceGeom = new THREE.PlaneGeometry(30, 3);
      const fence = new THREE.Mesh(fenceGeom, fenceMat);
      if (i === 0) fence.position.set(0, 1.5, -15);
      if (i === 1) { fence.position.set(0, 1.5, 15); fence.rotation.y = Math.PI; }
      if (i === 2) { fence.position.set(-15, 1.5, 0); fence.rotation.y = Math.PI / 2; }
      if (i === 3) { fence.position.set(15, 1.5, 0); fence.rotation.y = -Math.PI / 2; }
      fenceGroup.add(fence);
    }

    // Boxes (Warehouse Goods)
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.1, roughness: 0.8 });
    for (let i = 0; i < 10; i++) {
      const boxGeom = new THREE.BoxGeometry(2, 2, 2);
      const box = new THREE.Mesh(boxGeom, boxMat);
      box.position.set((Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20);
      boxGroup.add(box);
    }

    // Detected Objects Group
    const detectedGroup = new THREE.Group();
    scene.add(detectedGroup);

    const personMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 });
    const objectMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 1 });

    // Scanning Beam
    const beamGeom = new THREE.CylinderGeometry(0.1, 10, 20, 32, 1, true);
    const beamMat = new THREE.MeshStandardMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.y = 5;
    scene.add(beam);

    // Grid
    const grid = new THREE.GridHelper(30, 30, 0x00ffff, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Scanning Beam
      beam.rotation.y = time * 0.5;
      beam.position.x = Math.sin(time) * 5;

      // Update Detected Objects
      if (detectedGroup.children.length !== s.detectedObjects.length) {
        detectedGroup.clear();
        s.detectedObjects.forEach(obj => {
          const geom = obj.type === 'person' ? new THREE.SphereGeometry(0.5, 16, 16) : new THREE.BoxGeometry(1, 1, 1);
          const mesh = new THREE.Mesh(geom, obj.type === 'person' ? personMat : objectMat);
          mesh.position.set(obj.x, 1, obj.z);
          detectedGroup.add(mesh);
        });
      }

      // Pulsing Detected Objects
      detectedGroup.children.forEach((mesh, i) => {
        mesh.scale.setScalar(1 + Math.sin(time * 5 + i) * 0.2);
        const mat = (mesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.5 + Math.sin(time * 10 + i) * 0.5;
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
