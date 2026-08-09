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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // STS Crane Model
    const craneGroup = new THREE.Group();
    scene.add(craneGroup);

    const structureMat = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6, 
      metalness: 0.7, 
      roughness: 0.3,
      wireframe: false 
    });

    // Main Portal Frame
    const legGeom = new THREE.BoxGeometry(2, 20, 2);
    const leg1 = new THREE.Mesh(legGeom, structureMat);
    leg1.position.set(-8, 10, -8);
    craneGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, structureMat);
    leg2.position.set(8, 10, -8);
    craneGroup.add(leg2);

    const leg3 = new THREE.Mesh(legGeom, structureMat);
    leg3.position.set(-8, 10, 8);
    craneGroup.add(leg3);

    const leg4 = new THREE.Mesh(legGeom, structureMat);
    leg4.position.set(8, 10, 8);
    craneGroup.add(leg4);

    // Main Girder
    const girderGeom = new THREE.BoxGeometry(40, 2, 6);
    const girder = new THREE.Mesh(girderGeom, structureMat);
    girder.position.set(8, 20, 0);
    craneGroup.add(girder);

    // Trolley
    const trolleyGroup = new THREE.Group();
    const trolleyGeom = new THREE.BoxGeometry(4, 2, 4);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x1e40af });
    const trolley = new THREE.Mesh(trolleyGeom, trolleyMat);
    trolleyGroup.add(trolley);
    trolleyGroup.position.set(10, 19, 0);
    craneGroup.add(trolleyGroup);

    // Spreader (Container)
    const spreaderGeom = new THREE.BoxGeometry(6, 2.5, 2.5);
    const spreaderMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const spreader = new THREE.Mesh(spreaderGeom, spreaderMat);
    spreader.position.set(0, -10, 0);
    trolleyGroup.add(spreader);

    // Cables
    const cableGeom = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const cable1 = new THREE.Mesh(cableGeom, cableMat);
    cable1.position.set(2, -5, 1);
    trolleyGroup.add(cable1);

    const cable2 = new THREE.Mesh(cableGeom, cableMat);
    cable2.position.set(-2, -5, 1);
    trolleyGroup.add(cable2);

    const cable3 = new THREE.Mesh(cableGeom, cableMat);
    cable3.position.set(2, -5, -1);
    trolleyGroup.add(cable3);

    const cable4 = new THREE.Mesh(cableGeom, cableMat);
    cable4.position.set(-2, -5, -1);
    trolleyGroup.add(cable4);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight.position.set(0, 30, 0);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Trolley movement
      trolleyGroup.position.x = 5 + Math.sin(time * 0.5) * 15;
      
      // Spreader hoisting
      spreader.position.y = -10 + Math.sin(time * 0.8) * 5;
      
      // Update cables
      const cableHeight = Math.abs(spreader.position.y);
      [cable1, cable2, cable3, cable4].forEach(c => {
        c.scale.y = cableHeight / 10;
        c.position.y = spreader.position.y / 2;
      });

      // Subtle vibration effect on spreader
      spreader.position.x = Math.sin(time * 50) * 0.05;

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
