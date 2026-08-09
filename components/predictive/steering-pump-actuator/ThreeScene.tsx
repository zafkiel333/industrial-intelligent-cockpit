
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SteeringPAAnimatables } from './three-types';

interface ThreeSceneProps {
  pumpEfficiency?: number; // 0-1
  actuatorHealth?: number; // 0-1
  isXRayMode?: boolean;
  isSimulating?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  pumpEfficiency = 0.9, 
  actuatorHealth = 0.8,
  isXRayMode = false,
  isSimulating = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===steering-pump-actuator useEffect===");

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

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

    // --- 光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 15, 50);
    blueLight.position.set(-10, 5, 5);
    scene.add(blueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SteeringPAAnimatables = { pumps: [], pistons: [] };
    const disposables: any[] = [];

    // --- 1. 双液压泵组 (Twin Pumps) ---
    const pumpGeo = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.2,
        transparent: isXRayMode,
        opacity: isXRayMode ? 0.3 : 1
    });

    for(let i=0; i<2; i++) {
        const pGroup = new THREE.Group();
        const pMesh = new THREE.Mesh(pumpGeo, pumpMat);
        pGroup.add(pMesh);
        pGroup.position.set(-6, 0, (i === 0 ? 3 : -3));
        group.add(pGroup);
        animatables.pumps?.push(pGroup);
        disposables.push(pumpGeo, pumpMat);
    }

    // --- 2. 执行机构 (Actuator Cylinders) ---
    const actuatorGroup = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 32);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        transparent: true, 
        opacity: 0.6,
        wireframe: isXRayMode
    });
    
    for(let i=0; i<2; i++) {
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        cyl.position.z = (i === 0 ? 1 : -1);
        actuatorGroup.add(cyl);

        // 内部活塞 (Pistons)
        const pistonGeo = new THREE.CylinderGeometry(0.7, 0.7, 4, 32);
        pistonGeo.rotateZ(Math.PI / 2);
        const pistonMat = new THREE.MeshStandardMaterial({ 
            color: actuatorHealth < 0.6 ? 0xf97316 : 0x0ea5e9,
            metalness: 1.0,
            roughness: 0.1
        });
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        piston.position.z = (i === 0 ? 1 : -1);
        actuatorGroup.add(piston);
        animatables.pistons?.push(piston);
        disposables.push(pistonGeo, pistonMat);
    }
    actuatorGroup.position.x = 4;
    group.add(actuatorGroup);
    disposables.push(cylGeo, cylMat);

    // --- 3. 扫描线环 ---
    const scanGeo = new THREE.TorusGeometry(8, 0.05, 16, 100);
    scanGeo.rotateY(Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanner);
    animatables.scanningFringe = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 活塞往复运动
      if (isSimulating) {
          const travel = Math.sin(time * 2) * 2;
          animatables.pistons?.forEach((p, i) => {
              p.position.x = i === 0 ? travel : -travel;
          });

          // 泵体高频脉动 (模拟运行)
          animatables.pumps?.forEach((p, i) => {
              p.scale.setScalar(1 + Math.sin(time * 50 + i) * 0.005 * (1 - pumpEfficiency));
          });
      }

      // 扫描移动
      if (scanner) {
          scanner.position.x = Math.sin(time * 1.5) * 10;
          scanner.material.opacity = 0.2 + Math.abs(Math.cos(time * 5)) * 0.3;
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
  }, [pumpEfficiency, actuatorHealth, isXRayMode, isSimulating]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
