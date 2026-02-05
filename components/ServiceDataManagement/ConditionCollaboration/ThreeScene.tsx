
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConditionSceneProps, MechanicalNode } from './three-types';

export const ConditionCollaborationThreeScene: React.FC<ConditionSceneProps> = ({ 
  loadFactor, envSeverity, activeNodeId, onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: MechanicalNode[] = [
    { id: 'core-shaft', name: '主传动轴', type: 'shaft', position: [0, 0, 0], stress: 0.2, temp: 45, serviceStatus: 'protected' },
    { id: 'gear-set', name: '行星齿轮组', type: 'gear', position: [0, 2, 0], stress: 0.5, temp: 60, serviceStatus: 'vulnerable' },
    { id: 'bearing-A', name: '负荷端轴承', type: 'bearing', position: [-4, 0, 0], stress: 0.8, temp: 75, serviceStatus: 'vulnerable' },
    { id: 'housing', name: '密封壳体', type: 'housing', position: [0, 0, 0], stress: 0.1, temp: 30, serviceStatus: 'protected' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    // Dynamic lights based on load
    const loadLight = new THREE.PointLight(loadFactor > 1.0 ? 0xff4500 : 0x00ffff, 5, 50);
    loadLight.position.set(5, 5, 5);
    scene.add(loadLight);
    
    const envLight = new THREE.SpotLight(0xff00ff, 5);
    envLight.position.set(-10, 10, 0);
    scene.add(envLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- Construct the Mechanical Assembly ---
    const meshes: THREE.Mesh[] = [];

    // 1. Shaft (Center)
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 12, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.userData = { id: 'core-shaft' };
    group.add(shaft);
    meshes.push(shaft);

    // 2. Gears (Rotating around)
    const gearGroup = new THREE.Group();
    group.add(gearGroup);
    
    const gearGeo = new THREE.TorusKnotGeometry(2.5, 0.5, 100, 16);
    const gearMat = new THREE.MeshPhongMaterial({ color: 0x64748b, wireframe: true });
    const gearMesh = new THREE.Mesh(gearGeo, gearMat);
    gearMesh.userData = { id: 'gear-set' };
    gearGroup.add(gearMesh);
    meshes.push(gearMesh);

    // 3. Bearings (Ends)
    const bearingGeo = new THREE.CylinderGeometry(2, 2, 1, 32);
    bearingGeo.rotateZ(Math.PI / 2);
    
    const bearingL = new THREE.Mesh(bearingGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    bearingL.position.x = -5;
    bearingL.userData = { id: 'bearing-A' };
    group.add(bearingL);
    meshes.push(bearingL);

    const bearingR = new THREE.Mesh(bearingGeo, new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
    bearingR.position.x = 5;
    group.add(bearingR); // Not interactive for simplicity

    // 4. "Condition Field" (Particles representing stress/env)
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i+=3) {
        pPos[i] = (Math.random()-0.5) * 15;
        pPos[i+1] = (Math.random()-0.5) * 15;
        pPos[i+2] = (Math.random()-0.5) * 15;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xff4500, // Stress color
        size: 0.1, 
        transparent: true, 
        opacity: 0.0 // Start invisible, fade in with load
    });
    const conditionField = new THREE.Points(pGeo, pMat);
    scene.add(conditionField);

    // 5. "Service Shield" (Holographic sphere)
    const shieldGeo = new THREE.IcosahedronGeometry(8, 2);
    const shieldMat = new THREE.MeshBasicMaterial({ 
        color: 0x22d3ee, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    scene.add(shield);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Machinery Rotation Speed based on Load
      const speed = 0.01 * loadFactor;
      shaft.rotation.x += speed;
      gearGroup.rotation.x += speed * 2;
      gearGroup.rotation.z = Math.sin(time) * 0.1; // Wobble

      // Vibration Effect (Environment Severity)
      const shake = envSeverity * 0.05;
      group.position.set(
          (Math.random()-0.5) * shake, 
          (Math.random()-0.5) * shake, 
          (Math.random()-0.5) * shake
      );

      // Condition Field Visualization
      // More load = more particles visible and redder
      conditionField.rotation.y -= 0.002;
      pMat.opacity = Math.max(0, (loadFactor - 0.8)); // Visible only under high load
      const hue = Math.max(0, 0.6 - (loadFactor * 0.3)); // Blue -> Red
      pMat.color.setHSL(hue, 1, 0.5);

      // Shield Pulse
      shield.rotation.y += 0.001;
      shield.scale.setScalar(1 + Math.sin(time * 2) * 0.02);

      // Highlight Active
      meshes.forEach(m => {
          if (m.userData.id === activeNodeId) {
             if (m.material instanceof THREE.MeshStandardMaterial || m.material instanceof THREE.MeshPhongMaterial) {
                 m.material.emissive.setHex(0xffffff);
                 m.material.emissiveIntensity = 0.5;
             }
          } else {
             if (m.material instanceof THREE.MeshStandardMaterial || m.material instanceof THREE.MeshPhongMaterial) {
                 m.material.emissive.setHex(0x000000);
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
  }, [loadFactor, envSeverity, activeNodeId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
