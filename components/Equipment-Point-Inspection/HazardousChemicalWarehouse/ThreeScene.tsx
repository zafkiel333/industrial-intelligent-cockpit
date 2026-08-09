import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HazardousChemicalWarehouseProps } from './three-types';

export const ThreeScene: React.FC<HazardousChemicalWarehouseProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950
    scene.fog = new THREE.FogExp2('#020617', 0.015);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 30, 0);
    scene.add(pointLight);

    // Warehouse Environment
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    // Grid pattern for floor
    const gridHelper = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.1;
    scene.add(gridHelper);
    
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Chemical Barrels
    const barrelGroup = new THREE.Group();
    const barrelGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
    const barrelMatNormal = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6, roughness: 0.4 }); // sky-500
    const barrelMatAlert = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.4 }); // red-500
    
    const barrels: THREE.Mesh[] = [];
    
    // Create a grid of barrels
    for (let x = -15; x <= 15; x += 5) {
      for (let z = -15; z <= 15; z += 5) {
        // Leave a center aisle
        if (Math.abs(x) < 5) continue;
        
        const barrel = new THREE.Mesh(barrelGeo, barrelMatNormal.clone());
        barrel.position.set(x, 2, z);
        barrelGroup.add(barrel);
        barrels.push(barrel);
      }
    }
    scene.add(barrelGroup);

    // Gas/VOC Visualization (Particles)
    const particleCount = 1500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 40;
      particlePos[i + 1] = Math.random() * 15;
      particlePos[i + 2] = (Math.random() - 0.5) * 40;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    // Custom shader for glowing particles
    const particleMat = new THREE.PointsMaterial({ 
      color: 0x10b981, // emerald-500
      size: 0.5, 
      transparent: true, 
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Scanning Laser (Robot or Ceiling mounted)
    const scannerGeo = new THREE.ConeGeometry(8, 20, 32);
    const scannerMat = new THREE.MeshBasicMaterial({ 
      color: 0x3b82f6, // blue-500
      transparent: true, 
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.position.set(0, 20, 0);
    scanner.rotation.x = Math.PI; // Point down
    scene.add(scanner);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { vocConcentration, temperature, humidity, isAlert } = propsRef.current;

      // Scanner animation (sweeping back and forth)
      scanner.position.x = Math.sin(time * 0.5) * 15;
      scanner.position.z = Math.cos(time * 0.3) * 10;
      scanner.rotation.z = Math.sin(time * 0.5) * 0.2;

      // Particle animation (VOCs floating)
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.02 + (temperature / 1000); // Heat makes them rise faster
        if (positions[i] > 20) {
          positions[i] = 0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Particle color and density based on VOC concentration
      if (vocConcentration > 50) {
        particleMat.color.setHex(0xf59e0b); // amber
      } else if (vocConcentration > 100) {
        particleMat.color.setHex(0xef4444); // red
      } else {
        particleMat.color.setHex(0x10b981); // emerald
      }
      particleMat.opacity = 0.2 + (vocConcentration / 200);

      // Barrel alert visualization (simulate thermal camera or leak detection)
      barrels.forEach((barrel, index) => {
        const mat = barrel.material as THREE.MeshStandardMaterial;
        if (isAlert) {
          // Make some barrels glow red
          if (index % 5 === 0) {
            mat.color.setHex(0xef4444);
            mat.emissive.setHex(0x7f1d1d);
            mat.emissiveIntensity = 0.5 + Math.sin(time * 5 + index) * 0.5;
          }
        } else {
          mat.color.setHex(0x0ea5e9);
          mat.emissive.setHex(0x000000);
        }
      });

      if (isAlert) {
        scannerMat.color.setHex(0xef4444);
        pointLight.color.setHex(0xffaaaa);
      } else {
        scannerMat.color.setHex(0x3b82f6);
        pointLight.color.setHex(0xffffff);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};
