
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroSystemProps, HydroSystemNode } from './three-types';

export const HydroSystemThreeScene: React.FC<HydroSystemProps> = ({ 
  rpm, wicketGateOpening, waterFlow, activeNodeId, onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const components: HydroSystemNode[] = [
    { id: 'stator', name: '定子线圈', type: 'stator', position: [0, 4, 0], status: 'normal', temp: 85 },
    { id: 'rotor', name: '转子磁极', type: 'rotor', position: [0, 4, 0], status: 'normal', temp: 92 },
    { id: 'bearing-upper', name: '上导轴承', type: 'bearing', position: [0, 6.5, 0], status: 'warning', vibration: 0.15 },
    { id: 'shaft', name: '主轴', type: 'rotor', position: [0, 0, 0], status: 'normal' },
    { id: 'bearing-lower', name: '水导轴承', type: 'bearing', position: [0, -2, 0], status: 'normal', vibration: 0.08 },
    { id: 'runner', name: '转轮', type: 'runner', position: [0, -4, 0], status: 'normal' },
    { id: 'volute', name: '蜗壳', type: 'volute', position: [0, -4, 0], status: 'normal' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const blueLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    blueLight.position.set(10, 5, 10);
    scene.add(blueLight);
    const cyanLight = new THREE.PointLight(0x22d3ee, 5, 50);
    cyanLight.position.set(-10, -5, -10);
    scene.add(cyanLight);

    // Group for the entire unit
    const unitGroup = new THREE.Group();
    scene.add(unitGroup);

    // Rotating Parts Group
    const rotorGroup = new THREE.Group();
    unitGroup.add(rotorGroup);

    const interactiveMeshes: THREE.Mesh[] = [];

    // --- GEOMETRY CONSTRUCTION ---

    // 1. Generator Stator (Static)
    const statorGeo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true);
    const statorMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e3a8a, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const statorMesh = new THREE.Mesh(statorGeo, statorMat);
    statorMesh.position.set(0, 4, 0);
    statorMesh.userData = { id: 'stator' };
    unitGroup.add(statorMesh);
    interactiveMeshes.push(statorMesh);

    // 2. Generator Rotor (Rotating)
    const rotorGeo = new THREE.CylinderGeometry(4, 4, 2.8, 16);
    const rotorMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, flatShading: true });
    const rotorMesh = new THREE.Mesh(rotorGeo, rotorMat);
    rotorMesh.position.set(0, 4, 0);
    rotorMesh.userData = { id: 'rotor' };
    rotorGroup.add(rotorMesh);
    interactiveMeshes.push(rotorMesh);

    // 3. Shaft (Rotating)
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.8 });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.position.y = 1;
    shaftMesh.userData = { id: 'shaft' };
    rotorGroup.add(shaftMesh);
    interactiveMeshes.push(shaftMesh);

    // 4. Runner (Rotating)
    const runnerGeo = new THREE.TorusGeometry(3, 1, 16, 12); // Blades abstract
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.6, roughness: 0.4 });
    const runnerMesh = new THREE.Mesh(runnerGeo, runnerMat);
    runnerMesh.rotation.x = Math.PI / 2;
    runnerMesh.position.y = -4;
    runnerMesh.userData = { id: 'runner' };
    rotorGroup.add(runnerMesh);
    interactiveMeshes.push(runnerMesh);

    // 5. Volute / Spiral Case (Static)
    const voluteGeo = new THREE.TorusGeometry(5, 1.5, 16, 50, Math.PI * 1.8);
    const voluteMat = new THREE.MeshBasicMaterial({ color: 0x0f766e, wireframe: true, transparent: true, opacity: 0.2 });
    const voluteMesh = new THREE.Mesh(voluteGeo, voluteMat);
    voluteMesh.rotation.x = Math.PI / 2;
    voluteMesh.position.y = -4;
    voluteMesh.userData = { id: 'volute' };
    unitGroup.add(voluteMesh);
    interactiveMeshes.push(voluteMesh);

    // 6. Bearings (Static)
    const bearingGeo = new THREE.CylinderGeometry(2, 2, 0.5, 16);
    const bearingMat = new THREE.MeshPhongMaterial({ color: 0xf59e0b });
    
    const upperBearing = new THREE.Mesh(bearingGeo, bearingMat);
    upperBearing.position.y = 6.5;
    upperBearing.userData = { id: 'bearing-upper' };
    unitGroup.add(upperBearing);
    interactiveMeshes.push(upperBearing);

    const lowerBearing = new THREE.Mesh(bearingGeo, bearingMat);
    lowerBearing.position.y = -2;
    lowerBearing.userData = { id: 'bearing-lower' };
    unitGroup.add(lowerBearing);
    interactiveMeshes.push(lowerBearing);

    // Water Flow Particles
    const particleCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pLife = new Float32Array(particleCount);
    
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
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate Rotor based on RPM
      const speedFactor = rpm / 600; // scaling
      rotorGroup.rotation.y -= speedFactor;

      // Pulse Active Node
      interactiveMeshes.forEach(mesh => {
          if (mesh.userData.id === activeNodeId) {
              if (mesh.material instanceof THREE.MeshPhongMaterial || mesh.material instanceof THREE.MeshBasicMaterial || mesh.material instanceof THREE.MeshStandardMaterial) {
                  (mesh.material as any).emissive = new THREE.Color(0xffffff);
                  (mesh.material as any).emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
              }
          } else {
              if (mesh.material instanceof THREE.MeshPhongMaterial || mesh.material instanceof THREE.MeshStandardMaterial) {
                  (mesh.material as any).emissive = new THREE.Color(0x000000);
              }
          }
      });

      // Water Particle Animation (Spiral down)
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const flowRate = waterFlow / 500; 
      
      for(let i=0; i<particleCount; i++) {
          pLife[i] += 0.005 * flowRate;
          if(pLife[i] > 1) pLife[i] = 0;

          const t = pLife[i];
          // Spiral: Start wide at volute (-4y), narrow down to draft tube (-8y)
          const angle = t * Math.PI * 6 + i;
          const radius = 6 * (1 - t) + 0.5;
          const y = -3 - (t * 8); 

          positions[i*3] = Math.cos(angle) * radius;
          positions[i*3+1] = y;
          positions[i*3+2] = Math.sin(angle) * radius;
      }
      particles.geometry.attributes.position.needsUpdate = true;

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
  }, [rpm, activeNodeId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
