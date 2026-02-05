import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CalibrationThreeProps } from './three-types';

export const CalibrationThreeScene: React.FC<CalibrationThreeProps> = ({ 
  isScanning, 
  accuracyLevel,
  scanColor = '#10b981'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 10);

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Scene Objects ---

    const group = new THREE.Group();
    scene.add(group);

    // 1. The "Golden Standard" Artifact (Crystal Prism)
    const geometry = new THREE.OctahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      metalness: 0.1, 
      roughness: 0, 
      transmission: 0.9, 
      thickness: 1,
      clearcoat: 1.0
    });
    const crystal = new THREE.Mesh(geometry, material);
    group.add(crystal);

    // Inner wireframe for tech feel
    const wireGeo = new THREE.OctahedronGeometry(1.0, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: scanColor, wireframe: true, transparent: true, opacity: 0.3 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    // 2. Scanning Ring
    const ringGeo = new THREE.TorusGeometry(3, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: scanColor });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Lasers from Ring to Center
    const lasersGroup = new THREE.Group();
    group.add(lasersGroup);
    
    const laserCount = 8;
    for(let i=0; i<laserCount; i++) {
        const angle = (i / laserCount) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        
        // Beam line
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(0, 0, 0)
        ]);
        const beamMat = new THREE.LineBasicMaterial({ color: scanColor, transparent: true, opacity: 0.2 });
        const beam = new THREE.Line(beamGeo, beamMat);
        lasersGroup.add(beam);
        
        // Emitter on ring
        const bulbGeo = new THREE.SphereGeometry(0.1);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(x, 0, z);
        lasersGroup.add(bulb);
    }

    // Measurement Points (Particles)
    const pointsGeo = new THREE.BufferGeometry();
    const pointsCount = 100;
    const posArray = new Float32Array(pointsCount * 3);
    for(let i=0; i<pointsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 4;
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pointsMat = new THREE.PointsMaterial({ 
        size: 0.03, 
        color: scanColor, 
        transparent: true, 
        opacity: 0.5 
    });
    const particleSystem = new THREE.Points(pointsGeo, pointsMat);
    scene.add(particleSystem);


    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(scanColor, 5, 20);
    pointLight.position.set(2, 5, 2);
    scene.add(pointLight);

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      if (isScanning) {
          // Ring movement
          ring.rotation.z += 0.02;
          ring.rotation.x = Math.sin(time) * 0.5 + Math.PI/2;
          
          // Lasers follow ring
          lasersGroup.rotation.z += 0.02;
          lasersGroup.rotation.x = Math.sin(time) * 0.5;
          lasersGroup.children.forEach((child) => {
             if (child instanceof THREE.Line) {
                 (child.material as THREE.LineBasicMaterial).opacity = 0.4 + Math.random() * 0.4;
             }
          });

          // Crystal Pulse
          crystal.scale.setScalar(1 + Math.sin(time * 5) * 0.02);
          
          // Color update based on props
          ringMat.color.set(scanColor);
          pointLight.color.set(scanColor);
          wireMat.color.set(scanColor);
      } else {
          ring.rotation.x = Math.PI / 2;
          lasersGroup.visible = false;
      }
      lasersGroup.visible = isScanning;

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
  }, [isScanning, accuracyLevel, scanColor]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};