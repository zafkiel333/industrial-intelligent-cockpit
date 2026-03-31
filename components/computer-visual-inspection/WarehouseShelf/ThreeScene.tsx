import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShelfStatus } from './three-types';

interface ThreeSceneProps {
  status: ShelfStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<ShelfStatus>(status);

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
    camera.position.set(10, 8, 10);

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

    // Shelf Model
    const shelfGroup = new THREE.Group();
    scene.add(shelfGroup);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
    const alertMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });

    // Vertical Posts
    const postGeom = new THREE.BoxGeometry(0.2, 8, 0.2);
    const posts = [
      [-2, 0, -1], [2, 0, -1], [-2, 0, 1], [2, 0, 1]
    ].map(pos => {
      const post = new THREE.Mesh(postGeom, metalMat);
      post.position.set(pos[0], 4, pos[2]);
      shelfGroup.add(post);
      return post;
    });

    // Horizontal Beams
    const beamGeom = new THREE.BoxGeometry(4, 0.1, 0.1);
    const beamLevels = [2, 4, 6];
    const beams: THREE.Mesh[] = [];
    beamLevels.forEach(y => {
      const beamFront = new THREE.Mesh(beamGeom, beamMat);
      beamFront.position.set(0, y, 1);
      shelfGroup.add(beamFront);
      beams.push(beamFront);

      const beamBack = new THREE.Mesh(beamGeom, beamMat);
      beamBack.position.set(0, y, -1);
      shelfGroup.add(beamBack);
      beams.push(beamBack);
    });

    // Shelves
    const shelfPlateGeom = new THREE.BoxGeometry(4, 0.05, 2);
    beamLevels.forEach(y => {
      const plate = new THREE.Mesh(shelfPlateGeom, metalMat);
      plate.position.set(0, y, 0);
      shelfGroup.add(plate);
    });

    // Deformation Indicator
    const indicatorGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const indicator = new THREE.Mesh(indicatorGeom, alertMat);
    indicator.visible = false;
    scene.add(indicator);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Simulate Deformation
      const defFactor = s.deformationValue / 50; // Max 50mm for visual
      beams.forEach((beam, i) => {
        if (s.isDeformed && i < 2) { // Deform middle beams
          beam.scale.y = 1 + Math.sin(time * 2) * 0.1 * defFactor;
          beam.position.y = beamLevels[0] - Math.sin(time * 2) * 0.05 * defFactor;
        } else {
          beam.scale.y = 1;
          beam.position.y = beamLevels[Math.floor(i / 2)];
        }
      });

      // Alert Indicator
      if (s.isDeformed || s.hasCracks) {
        indicator.visible = true;
        indicator.position.set(0, 4 + Math.sin(time * 5) * 0.1, 1.1);
        indicator.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
      } else {
        indicator.visible = false;
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
