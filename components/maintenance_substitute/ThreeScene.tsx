import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SubstituteThreeProps } from './three-types';

export const SubstituteThreeScene: React.FC<SubstituteThreeProps> = ({ 
  originalType,
  substituteType,
  matchScore
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // --- Geometries Helper ---
    const getGeometry = (type: string) => {
      switch (type) {
        case 'bearing': 
          return new THREE.TorusGeometry(1.5, 0.5, 16, 50);
        case 'gear':
          return new THREE.CylinderGeometry(1.8, 1.8, 0.5, 12); // Low poly cylinder looks like a nut/gear blank
        case 'valve':
          return new THREE.SphereGeometry(1.5, 32, 32);
        case 'shaft':
          return new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
        default:
          return new THREE.BoxGeometry(2, 2, 2);
      }
    };

    // Group to hold both parts
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // 1. Original Part (Left, Wireframe/Hologram)
    const originalGeo = getGeometry(originalType);
    const originalMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, // Cyan
      wireframe: true,
      transparent: true, 
      opacity: 0.4
    });
    const originalMesh = new THREE.Mesh(originalGeo, originalMat);
    originalMesh.position.set(-2.5, 0, 0);
    pivotGroup.add(originalMesh);

    // Label for Original
    // (Simplified as a glowing ring below)
    const ringGeo = new THREE.RingGeometry(2, 2.1, 32);
    const ringMatOrg = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ringOrg = new THREE.Mesh(ringGeo, ringMatOrg);
    ringOrg.rotation.x = Math.PI / 2;
    ringOrg.position.set(-2.5, -2.5, 0);
    pivotGroup.add(ringOrg);


    // 2. Substitute Part (Right, Solid)
    const subGeo = getGeometry(substituteType);
    const subMat = new THREE.MeshStandardMaterial({ 
      color: 0xf59e0b, // Amber
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.1
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.set(2.5, 0, 0);
    
    // Simulate slight mismatch if score is low
    if (matchScore < 90) {
       subMesh.scale.set(0.9, 0.9, 0.9); 
    }
    
    pivotGroup.add(subMesh);

    const ringMatSub = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ringSub = new THREE.Mesh(ringGeo, ringMatSub);
    ringSub.rotation.x = Math.PI / 2;
    ringSub.position.set(2.5, -2.5, 0);
    pivotGroup.add(ringSub);

    // Connection Lines (Laser Scan Effect)
    const laserGroup = new THREE.Group();
    scene.add(laserGroup);
    
    const laserGeo = new THREE.PlaneGeometry(8, 0.05);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const laserPlane = new THREE.Mesh(laserGeo, laserMat);
    laserGroup.add(laserPlane);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 10);
    blueLight.position.set(-5, 2, 0);
    scene.add(blueLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2, 10);
    amberLight.position.set(5, 2, 0);
    scene.add(amberLight);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Scan effect
      laserPlane.position.y = Math.sin(time) * 2;
      laserPlane.scale.x = 1 + Math.sin(time * 2) * 0.1;

      // Pulse
      ringOrg.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
      ringSub.scale.setScalar(1 + Math.cos(time * 3) * 0.05);

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
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [originalType, substituteType, matchScore]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};