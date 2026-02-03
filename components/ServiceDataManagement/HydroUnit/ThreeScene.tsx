
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroSceneProps, HydroNode } from './three-types';

export const HydroUnitThreeScene: React.FC<HydroSceneProps> = ({ 
  rpm, load, guideVaneOpen, activePartId, onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const parts: HydroNode[] = [
    { id: 'generator', name: '发电机定转子', type: 'generator', position: [0, 6, 0], status: 'optimal', temperature: 75, vibration: 0.05 },
    { id: 'thrust-bearing', name: '推力轴承', type: 'bearing', position: [0, 3, 0], status: 'warning', temperature: 62, vibration: 0.12 },
    { id: 'shaft', name: '主轴系统', type: 'shaft', position: [0, 0, 0], status: 'optimal', temperature: 40, vibration: 0.08 },
    { id: 'turbine', name: '水轮机转轮', type: 'turbine', position: [0, -4, 0], status: 'optimal', temperature: 15, vibration: 0.25 },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 10, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const blueLight = new THREE.PointLight(0x3b82f6, 10, 50);
    blueLight.position.set(-10, 5, 10);
    scene.add(blueLight);
    const cyanLight = new THREE.PointLight(0x06b6d4, 8, 50);
    cyanLight.position.set(10, -5, -10);
    scene.add(cyanLight);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(40, 20, 0x1e3a8a, 0x0f172a);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Unit Group
    const unitGroup = new THREE.Group();
    scene.add(unitGroup);

    // Rotating Parts Group
    const rotorGroup = new THREE.Group();
    unitGroup.add(rotorGroup);

    const partMeshes: THREE.Mesh[] = [];

    // 1. Generator (Stator - Static, Rotor - Dynamic)
    // Stator Frame (Static)
    const statorGeo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true);
    const statorMat = new THREE.MeshPhongMaterial({ 
        color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.3, side: THREE.DoubleSide 
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.position.set(0, 6, 0);
    stator.userData = { id: 'generator' };
    unitGroup.add(stator);
    partMeshes.push(stator);

    // Rotor (Rotating)
    const rotorGeo = new THREE.CylinderGeometry(4, 4, 2.8, 16);
    const rotorMat = new THREE.MeshPhongMaterial({ color: 0x1d4ed8, flatShading: true });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.set(0, 6, 0);
    rotorGroup.add(rotor);

    // 2. Shaft (Rotating)
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(0, 1, 0);
    shaft.userData = { id: 'shaft' };
    rotorGroup.add(shaft); // Part of rotating group
    // Add invisible hit box for shaft selection since it is inside rotor group
    const shaftHit = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8), new THREE.MeshBasicMaterial({visible: false}));
    shaftHit.position.set(0, 1, 0);
    shaftHit.userData = { id: 'shaft' };
    unitGroup.add(shaftHit);
    partMeshes.push(shaftHit);

    // 3. Thrust Bearing (Static)
    const bearingGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const bearingMat = new THREE.MeshPhongMaterial({ 
        color: 0xf59e0b, transparent: true, opacity: 0.6 
    });
    const bearing = new THREE.Mesh(bearingGeo, bearingMat);
    bearing.position.set(0, 3, 0);
    bearing.userData = { id: 'thrust-bearing' };
    unitGroup.add(bearing);
    partMeshes.push(bearing);

    // 4. Turbine Runner (Rotating)
    const runnerGeo = new THREE.TorusGeometry(3, 1, 16, 32);
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.6, roughness: 0.4 });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = Math.PI / 2;
    runner.position.set(0, -4, 0);
    rotorGroup.add(runner);
    
    // Spiral Case (Static Abstract)
    const spiralGeo = new THREE.TorusGeometry(5, 1.5, 16, 50, Math.PI * 1.5);
    const spiralMat = new THREE.MeshBasicMaterial({ color: 0x1e40af, wireframe: true, transparent: true, opacity: 0.2 });
    const spiral = new THREE.Mesh(spiralGeo, spiralMat);
    spiral.rotation.x = Math.PI / 2;
    spiral.position.set(0, -4, 0);
    spiral.userData = { id: 'turbine' };
    unitGroup.add(spiral);
    partMeshes.push(spiral);

    // Water Particles (Spiral Flow)
    const particleCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pLife = new Float32Array(particleCount); // For animation reset
    
    for(let i=0; i<particleCount; i++) {
        pLife[i] = Math.random();
        pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.15, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(partMeshes);
      if (intersects.length > 0) {
        onPartSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate Rotor based on RPM (simulated)
      // Visual rotation speed scaling
      rotorGroup.rotation.y -= 0.02 * (rpm / 100);

      // Animate Water Particles (Spiral down into draft tube)
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const flowLoad = load / 100; // 0 to 1
      
      for(let i=0; i<particleCount; i++) {
          pLife[i] += 0.01 * flowLoad;
          if(pLife[i] > 1) pLife[i] = 0;

          // Spiral logic: Start wide at top, narrow at bottom
          const t = pLife[i];
          const angle = t * Math.PI * 4 + i; // Rotation
          const radius = 6 * (1 - t) + 1; // Shrink radius
          const y = -2 - (t * 8); // Move down from spiral case area (-2) to draft tube (-10)

          positions[i*3] = Math.cos(angle) * radius;
          positions[i*3+1] = y;
          positions[i*3+2] = Math.sin(angle) * radius;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Pulse active part
      partMeshes.forEach(mesh => {
          if (mesh.userData.id === activePartId) {
              if (mesh.material instanceof THREE.MeshPhongMaterial || mesh.material instanceof THREE.MeshBasicMaterial) {
                  const pulsate = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
                  mesh.material.opacity = pulsate;
              }
          } else {
               if (mesh.material instanceof THREE.MeshPhongMaterial || mesh.material instanceof THREE.MeshBasicMaterial) {
                  mesh.material.opacity = 0.2; // Default dim
              }
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activePartId, rpm, load]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
