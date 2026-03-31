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

    // Spreader Model
    const spreaderGroup = new THREE.Group();
    scene.add(spreaderGroup);

    // Main Frame
    const frameGeom = new THREE.BoxGeometry(40, 4, 10);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    spreaderGroup.add(frame);

    // Telescopic Arms (Simplified)
    const armGeom = new THREE.BoxGeometry(10, 3, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.x = -15;
    spreaderGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.x = 15;
    spreaderGroup.add(rightArm);

    // Twistlocks (4 corners)
    const lockGeom = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const lockMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.2 });
    
    const locks: THREE.Mesh[] = [];
    const lockPositions = [
      { x: -19, z: -4 },
      { x: -19, z: 4 },
      { x: 19, z: -4 },
      { x: 19, z: 4 }
    ];

    lockPositions.forEach(pos => {
      const lock = new THREE.Mesh(lockGeom, lockMat);
      lock.position.set(pos.x, -2, pos.z);
      spreaderGroup.add(lock);
      locks.push(lock);
    });

    // Container (Simplified)
    const containerGeom = new THREE.BoxGeometry(40, 10, 10);
    const containerMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 });
    const container = new THREE.Mesh(containerGeom, containerMat);
    container.position.y = -8;
    spreaderGroup.add(container);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(20, 40, 20);
    scene.add(mainLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Subtle vibration of the whole spreader
      spreaderGroup.position.y = Math.sin(time * 20) * 0.05;
      
      // Lock rotation animation (simulating lock/unlock)
      const isLocked = Math.sin(time * 0.5) > 0;
      locks.forEach(lock => {
        const targetRot = isLocked ? Math.PI / 2 : 0;
        lock.rotation.y = THREE.MathUtils.lerp(lock.rotation.y, targetRot, 0.1);
        
        // Change color based on lock state
        (lock.material as THREE.MeshStandardMaterial).color.setHex(isLocked ? 0x10b981 : 0xf59e0b);
        (lock.material as THREE.MeshStandardMaterial).emissive.setHex(isLocked ? 0x10b981 : 0xf59e0b);
      });

      // Container attachment simulation
      if (isLocked) {
        container.position.y = THREE.MathUtils.lerp(container.position.y, -8, 0.1);
      } else {
        container.position.y = THREE.MathUtils.lerp(container.position.y, -12, 0.05);
      }

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
