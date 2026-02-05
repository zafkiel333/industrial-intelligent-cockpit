
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AgitatorAnimatables, AgitatorMode } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0-1
  rpm?: number;
  viewMode?: AgitatorMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.2,
  rpm = 180,
  viewMode = 'structure'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态工业光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 15, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    accentLight.position.set(-8, 5, -5);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: AgitatorAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 电机部分 (Motor) ---
    const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = 5;
    group.add(motor);
    animatables.motor = motor;
    disposables.push(motorGeo, motorMat);

    // --- 2. 主轴 (Main Shaft) ---
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 1.0, 
        roughness: 0.1,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.3 : 1.0
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 1;
    group.add(shaft);
    animatables.mainShaft = shaft;
    disposables.push(shaftGeo, shaftMat);

    // --- 3. 叶轮 (Impeller) ---
    const impellerGroup = new THREE.Group();
    const coreGeo = new THREE.CylinderGeometry(0.8, 1.2, 0.5, 32);
    const bladeGeo = new THREE.BoxGeometry(2, 0.8, 0.1);
    const impellerMat = new THREE.MeshStandardMaterial({ 
        color: wearLevel > 0.6 ? 0xf97316 : 0x0ea5e9, 
        metalness: 0.9,
        roughness: 0.1,
        emissive: wearLevel > 0.6 ? 0xff4400 : 0x000000,
        emissiveIntensity: 0.5
    });

    const core = new THREE.Mesh(coreGeo, impellerMat);
    impellerGroup.add(core);

    for(let i=0; i<6; i++) {
        const blade = new THREE.Mesh(bladeGeo, impellerMat);
        const angle = (i / 6) * Math.PI * 2;
        blade.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
        blade.rotation.y = -angle;
        blade.rotation.z = Math.PI / 6; // 斜角
        impellerGroup.add(blade);
    }
    impellerGroup.position.y = -3;
    group.add(impellerGroup);
    animatables.impeller = impellerGroup;
    disposables.push(coreGeo, bladeGeo, impellerMat);

    // --- 4. 定子 (Stator) ---
    const statorGeo = new THREE.TorusGeometry(3.2, 0.2, 16, 64, Math.PI * 2);
    const statorMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        transparent: true, 
        opacity: 0.5,
        wireframe: viewMode === 'structure'
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.x = Math.PI / 2;
    stator.position.y = -3;
    group.add(stator);
    disposables.push(statorGeo, statorMat);

    // --- 5. 气泡粒子系统 (Air Bubbles) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 6;
        pPos[i*3+1] = -5 + Math.random() * 8;
        pPos[i*3+2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.05, 
        transparent: true, 
        opacity: viewMode === 'fluid' ? 0.6 : 0.1 
    });
    const bubbles = new THREE.Points(pGeo, pMat);
    group.add(bubbles);
    animatables.airBubbles = bubbles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const rotationSpeed = (rpm / 60) * 0.1;

      // 叶轮自转
      if (animatables.impeller) {
          animatables.impeller.rotation.y += rotationSpeed;
      }
      
      // 气泡升空与扩散
      if (animatables.airBubbles) {
          const positions = animatables.airBubbles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3+1] += 0.02; // 上升
              if (positions[i*3+1] > 4) {
                  const angle = Math.random() * Math.PI * 2;
                  const r = Math.random() * 1.5;
                  positions[i*3] = Math.cos(angle) * r;
                  positions[i*3+1] = -3.5; // 从叶轮高度重新产生
                  positions[i*3+2] = Math.sin(angle) * r;
              }
              // 离心扩散效果
              if (positions[i*3+1] < -1) {
                  positions[i*3] *= 1.02;
                  positions[i*3+2] *= 1.02;
              }
          }
          animatables.airBubbles.geometry.attributes.position.needsUpdate = true;
      }

      // 磨损引起的轴心微震动
      if (wearLevel > 0.5 && animatables.mainShaft) {
          animatables.mainShaft.position.x = Math.sin(time * 50) * (wearLevel * 0.02);
          animatables.mainShaft.position.z = Math.cos(time * 50) * (wearLevel * 0.02);
      }

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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [wearLevel, rpm, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
