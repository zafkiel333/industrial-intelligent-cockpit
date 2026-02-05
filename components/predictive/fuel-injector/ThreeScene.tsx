import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InjectorAnimatables } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0-1
  injectionSpeed?: number; // 0-1
  isInjecting?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.2, 
  injectionSpeed = 0.5,
  isInjecting = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 精密实验照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spotLight = new THREE.SpotLight(0x0ea5e9, 100);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: InjectorAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 喷油器壳体剖面 (Injector Body) ---
    const bodyGeo = new THREE.CylinderGeometry(1.5, 1.2, 8, 32, 1, true, 0, Math.PI * 1.5);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        side: THREE.DoubleSide,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.4
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    disposables.push(bodyGeo, bodyMat);

    // --- 2. 核心柱塞偶件 (Plunger) ---
    const plungerGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 32);
    const plungerMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        metalness: 1, 
        roughness: 0.1,
        emissive: 0xff4400,
        emissiveIntensity: wearLevel > 0.6 ? (wearLevel - 0.6) * 2 : 0
    });
    const plunger = new THREE.Mesh(plungerGeo, plungerMat);
    plunger.position.y = 2;
    group.add(plunger);
    animatables.plunger = plunger;
    disposables.push(plungerGeo, plungerMat);

    // --- 3. 针阀 (Needle Valve) ---
    const needleGeo = new THREE.ConeGeometry(0.3, 2, 16);
    const needle = new THREE.Mesh(needleGeo, plungerMat);
    needle.position.y = -2;
    group.add(needle);
    animatables.needleValve = needle;
    disposables.push(needleGeo);

    // --- 4. 喷雾粒子系统 (Spray) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = -4; pPos[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x22d3ee, 
        size: 0.03, 
        transparent: true, 
        opacity: 0 
    });
    const spray = new THREE.Points(pGeo, pMat);
    group.add(spray);
    animatables.sprayParticles = spray;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 模拟喷射循环 (Injection Cycle)
      const cycle = (time * 2) % 1;
      
      if (isInjecting) {
          // 柱塞向下动作
          if (cycle < 0.3) {
              plunger.position.y = 2 - cycle * 2;
              needle.position.y = -2 + cycle * 0.5;
              pMat.opacity = 0.8;
          } else {
              plunger.position.y = 2;
              needle.position.y = -2;
              pMat.opacity *= 0.9; // 喷射结束后的消散
          }

          // 粒子散射动画
          const positions = spray.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              if (cycle < 0.3) {
                  // 喷射中：粒子向下扇形扩散
                  positions[i*3] += (Math.random() - 0.5) * 0.1 * (1 + wearLevel); // 磨损增加会导致喷射散乱
                  positions[i*3+1] -= 0.15;
                  positions[i*3+2] += (Math.random() - 0.5) * 0.1 * (1 + wearLevel);
              } else {
                  // 归位
                  positions[i*3] = 0;
                  positions[i*3+1] = -4;
                  positions[i*3+2] = 0;
              }
          }
          spray.geometry.attributes.position.needsUpdate = true;
      }

      group.rotation.y += 0.002;
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
  }, [wearLevel, injectionSpeed, isInjecting]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};