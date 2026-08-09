import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SpreaderState } from './three-types';

interface ThreeSceneProps {
  state: SpreaderState;
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

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);

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

    // Spreader Frame
    const spreaderGroup = new THREE.Group();
    const frameGeometry = new THREE.BoxGeometry(12, 0.5, 2.4);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    spreaderGroup.add(frame);

    // Twistlocks (4 corners)
    const twistlockGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16);
    const twistlockMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const twistlocks: THREE.Mesh[] = [];
    const positions = [
      [5.8, -0.4, 1.1],
      [5.8, -0.4, -1.1],
      [-5.8, -0.4, 1.1],
      [-5.8, -0.4, -1.1]
    ];

    positions.forEach(pos => {
      const tl = new THREE.Mesh(twistlockGeometry, twistlockMaterial);
      tl.position.set(pos[0], pos[1], pos[2]);
      spreaderGroup.add(tl);
      twistlocks.push(tl);
    });

    scene.add(spreaderGroup);

    // Container (Simplified)
    const containerGeometry = new THREE.BoxGeometry(12.2, 2.6, 2.4);
    const containerMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8 });
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    container.position.y = -2;
    scene.add(container);

    // Alignment Lasers
    const laserMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const laserGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -5, 0)
    ]);
    const lasers: THREE.Line[] = [];
    positions.forEach(pos => {
      const laser = new THREE.Line(laserGeometry, laserMaterial);
      laser.position.set(pos[0], pos[1], pos[2]);
      spreaderGroup.add(laser);
      lasers.push(laser);
    });

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { lockStatus, alignmentError } = stateRef.current;
      
      // Update twistlock rotation based on status
      const targetRotation = lockStatus === 'locked' ? Math.PI / 2 : 0;
      twistlocks.forEach(tl => {
        tl.rotation.y = THREE.MathUtils.lerp(tl.rotation.y, targetRotation, 0.1);
      });

      // Update alignment error visual
      spreaderGroup.position.x = alignmentError.x / 100;
      spreaderGroup.position.z = alignmentError.y / 100;

      // Pulse lasers
      const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      laserMaterial.opacity = 0.5 + pulse * 0.5;
      laserMaterial.transparent = true;

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
