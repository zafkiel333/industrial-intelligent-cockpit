
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RemanThreeProps } from './three-types';

export const RemanThreeScene: React.FC<RemanThreeProps> = ({ 
  activePart, 
  scanProgress,
  isRunning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Deep green/black fog for "Matrix" feel
    scene.fog = new THREE.FogExp2(0x020a05, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = isRunning;
    controls.autoRotateSpeed = 1.0;

    // --- Scene Objects ---

    const group = new THREE.Group();
    scene.add(group);

    // 1. The Part (Dual Layer: Old Wireframe vs New Solid)
    let geometry;
    if (activePart.type === 'piston') {
      geometry = new THREE.CylinderGeometry(2, 2, 4, 32);
    } else if (activePart.type === 'turbine') {
      geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 100, 16);
    } else {
      geometry = new THREE.BoxGeometry(3, 3, 3);
    }

    // "Old" State (Wireframe, damaged look)
    const oldMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, // Red for damaged
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const oldMesh = new THREE.Mesh(geometry, oldMat);
    group.add(oldMesh);

    // "New" State (Solid, pristine)
    const newMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // Green for renewed
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.2,
      clearcoat: 1.0
    });
    const newMesh = new THREE.Mesh(geometry, newMat);
    group.add(newMesh);

    // Clipping Planes for the transition effect
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    renderer.localClippingEnabled = true;
    newMesh.material.clippingPlanes = [clipPlane];
    // oldMesh.material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)]; // Optional: Inverse clip

    // 2. Scanner Ring (The "Re-Genesis" Field)
    const ringGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
    const scannerRing = new THREE.Mesh(ringGeo, ringMat);
    scannerRing.rotation.x = Math.PI / 2;
    scene.add(scannerRing);

    // 3. Floating Particles (Nanobots/Energy)
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0x10b981, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    
    // Repair light
    const pointLight = new THREE.PointLight(0x10b981, 2, 20);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Update Scan Position (-2 to 2 based on scanProgress 0-1)
      const scanY = -2 + (scanProgress * 4);
      
      // Move Ring & Light
      scannerRing.position.y = scanY;
      pointLight.position.set(0, scanY, 0);
      
      // Update Clipping Plane constant
      // Plane equation: Ax + By + Cz + D = 0. Here normal is (0,-1,0).
      // So -y + D = 0 => y = D. 
      // We want visible BELOW the plane for "New Mesh" if normal is (0,-1,0) -> NO, clipping keeps "inside" usually
      // Let's adjust simply:
      clipPlane.constant = scanY; 

      // Particle Swirl
      particles.rotation.y = time * 0.1;
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pCount; i++) {
          const i3 = i*3;
          // Suck particles towards the scan ring
          if (isRunning) {
              const x = positions[i3];
              const z = positions[i3+2];
              // Spiral in
              // positions[i3] *= 0.99;
              // positions[i3+2] *= 0.99;
              // Reset if too close
              if (Math.abs(x) < 0.2) {
                 positions[i3] = (Math.random()-0.5) * 10;
                 positions[i3+2] = (Math.random()-0.5) * 10;
              }
          }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [activePart, scanProgress, isRunning]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
