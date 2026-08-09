import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeepageStatus } from './three-types';

interface ThreeSceneProps {
  status: SeepageStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<SeepageStatus>(status);

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

    // Dam Model
    const damGeom = new THREE.PlaneGeometry(20, 20, 32, 32);
    const pos = damGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, (y + 10) * 0.5);
    }
    pos.needsUpdate = true;
    damGeom.computeVertexNormals();

    const damMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.1, roughness: 0.9 });
    const dam = new THREE.Mesh(damGeom, damMat);
    dam.rotation.x = -Math.PI / 2;
    scene.add(dam);

    // Phreatic Line
    const phreaticLineGeom = new THREE.BufferGeometry();
    const phreaticLineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    const phreaticLine = new THREE.Line(phreaticLineGeom, phreaticLineMat);
    scene.add(phreaticLine);

    // Seepage Spot Group
    const seepageGroup = new THREE.Group();
    scene.add(seepageGroup);

    const seepageMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e3a8a, 
      transparent: true, 
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -0.1;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Update Phreatic Line
      const points = [];
      for (let x = -10; x <= 10; x += 1) {
        const depth = s.phreaticLineDepth;
        points.push(new THREE.Vector3(x, depth + Math.sin(time + x) * 0.1, 0));
      }
      phreaticLineGeom.setFromPoints(points);

      // Update Seepage Spots
      if (seepageGroup.children.length !== s.seepageSpots.length) {
        seepageGroup.clear();
        s.seepageSpots.forEach(spot => {
          const geom = new THREE.CircleGeometry(spot.size, 32);
          const mesh = new THREE.Mesh(geom, seepageMat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.set(spot.x, spot.z + 0.1, -spot.y);
          seepageGroup.add(mesh);
        });
      }

      // Pulsing Seepage
      seepageGroup.children.forEach((mesh, i) => {
        const m = mesh as THREE.Mesh;
        const mat = m.material as THREE.MeshStandardMaterial;
        m.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.1);
        mat.opacity = 0.4 + Math.sin(time * 2 + i) * 0.2;
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
