import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RackStatus } from './three-types';

interface ThreeSceneProps {
  status: RackStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<RackStatus>(status);

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
    camera.position.set(10, 10, 20);

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

    const directionalLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Rack Model
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const frameMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    const beamMat = new THREE.MeshStandardMaterial({ 
      color: 0xfacc15, 
      metalness: 0.7, 
      roughness: 0.3 
    });

    // Vertical Posts
    const postGeom = new THREE.BoxGeometry(0.5, 12, 0.5);
    const posts = [];
    for (let x of [-4, 4]) {
      for (let z of [-2, 2]) {
        const post = new THREE.Mesh(postGeom, frameMat);
        post.position.set(x, 6, z);
        rackGroup.add(post);
        posts.push(post);
      }
    }

    // Horizontal Beams
    const beamGeom = new THREE.BoxGeometry(8, 0.3, 0.3);
    const beams = [];
    for (let y of [3, 6, 9]) {
      for (let z of [-2, 2]) {
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.set(0, y, z);
        rackGroup.add(beam);
        beams.push(beam);
      }
    }

    // Shelves
    const shelfGeom = new THREE.BoxGeometry(8, 0.1, 4);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
    for (let y of [3, 6, 9]) {
      const shelf = new THREE.Mesh(shelfGeom, shelfMat);
      shelf.position.set(0, y, 0);
      rackGroup.add(shelf);
    }

    // Pallets/Loads
    const loadGeom = new THREE.BoxGeometry(2, 2, 2);
    const loadMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const loads = [];
    for (let y of [4, 7, 10]) {
      for (let x of [-2, 2]) {
        const load = new THREE.Mesh(loadGeom, loadMat);
        load.position.set(x, y, 0);
        rackGroup.add(load);
        loads.push(load);
      }
    }

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x3b82f6, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const s = statusRef.current;

      // Deformation visual (bend beams)
      beams.forEach((b: any) => {
        b.scale.y = 1 + (s.deformation / 100);
        b.position.y = b.userData.originalY || b.position.y;
        if (!b.userData.originalY) b.userData.originalY = b.position.y;
        b.position.y -= (s.deformation / 50);
      });

      // Tilt visual
      rackGroup.rotation.z = THREE.MathUtils.degToRad(s.tiltAngle);

      // Overload visual
      const targetColor = s.isOverloaded ? 0xef4444 : 0x3b82f6;
      loadMat.color.lerp(new THREE.Color(targetColor), 0.1);

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
