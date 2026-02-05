import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LubeDeteriorationAnimatables } from './three-types';

interface ThreeSceneProps {
  deteriorationLevel?: number; // 0 (Golden) to 1 (Dark Brown)
  particleDensity?: number; // 0-1
  isFlowing?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  deteriorationLevel = 0.2, 
  particleDensity = 0.3,
  isFlowing = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

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

    // --- 高动态照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const fluidLight = new THREE.PointLight(0xf59e0b, 20, 40);
    fluidLight.position.set(-5, 2, 5);
    scene.add(fluidLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: LubeDeteriorationAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 透明循环管路 (Transparent Pipe) ---
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(-5, 2, 0),
        new THREE.Vector3(0, 0, 2),
        new THREE.Vector3(5, -2, 0),
        new THREE.Vector3(10, 0, 0),
    ]);

    const pipeGeo = new THREE.TubeGeometry(curve, 100, 1.2, 32, false);
    const pipeMat = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, 
        metalness: 0.1, 
        roughness: 0.1, 
        transparent: true, 
        opacity: 0.2,
        transmission: 0.9,
        thickness: 0.5
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    group.add(pipe);
    disposables.push(pipeGeo, pipeMat);

    // --- 2. 内部流体层 (Inner Fluid) ---
    // 颜色随劣化程度从 金色 -> 深棕色 变化
    const freshColor = new THREE.Color(0xfacc15);
    const agedColor = new THREE.Color(0x451a03);
    const currentFluidColor = freshColor.clone().lerp(agedColor, deteriorationLevel);

    const fluidGeo = new THREE.TubeGeometry(curve, 100, 1.1, 32, false);
    const fluidMat = new THREE.MeshStandardMaterial({ 
        color: currentFluidColor, 
        transparent: true, 
        opacity: 0.7,
        emissive: currentFluidColor,
        emissiveIntensity: 0.2
    });
    const fluid = new THREE.Mesh(fluidGeo, fluidMat);
    group.add(fluid);
    disposables.push(fluidGeo, fluidMat);

    // --- 3. 污染颗粒点云 (Contamination Particles) ---
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);
    
    for(let i=0; i<pCount; i++) {
        const t = Math.random();
        const pt = curve.getPoint(t);
        pPos[i*3] = pt.x;
        pPos[i*3+1] = pt.y;
        pPos[i*3+2] = pt.z;
        pSpeeds[i] = t;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    
    const pMat = new THREE.PointsMaterial({ 
        color: 0x1e293b, 
        size: 0.05, 
        transparent: true, 
        opacity: particleDensity 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.contaminants = particles;
    disposables.push(pGeo, pMat);

    // --- 4. 扫描面 (Scanning Plane) ---
    const scanGeo = new THREE.PlaneGeometry(5, 5);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.y = Math.PI / 2;
    scene.add(scanner);
    animatables.laserScanner = scanner;
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体漂浮旋转
      group.rotation.y += 0.001;
      group.position.y = Math.sin(time * 0.5) * 0.2;

      // 扫描仪移动
      if (animatables.laserScanner) {
          animatables.laserScanner.position.x = Math.sin(time * 2) * 10;
      }

      // 流体运动仿真
      if (isFlowing && animatables.contaminants) {
          const pos = animatables.contaminants.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pSpeeds[i] = (pSpeeds[i] + 0.002) % 1;
              const point = curve.getPoint(pSpeeds[i]);
              // 增加一点随机扰动模拟紊流
              const offset = 0.4;
              pos[i*3] = point.x + (Math.random() - 0.5) * offset;
              pos[i*3+1] = point.y + (Math.random() - 0.5) * offset;
              pos[i*3+2] = point.z + (Math.random() - 0.5) * offset;
          }
          animatables.contaminants.geometry.attributes.position.needsUpdate = true;
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
  }, [deteriorationLevel, particleDensity, isFlowing]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};