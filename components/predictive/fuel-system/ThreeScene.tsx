import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FuelFluidAnimatables } from './three-types';

interface ThreeSceneProps {
  flowRate?: number; // 0-1
  temperatureLevel?: number; // 0-1 (Cold to Hot)
  anomalyTarget?: 'pump' | 'filter' | 'none';
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  flowRate = 0.5, 
  temperatureLevel = 0.6,
  anomalyTarget = 'none'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
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

    // --- 环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FuelFluidAnimatables = { 
        pumpNodes: new THREE.Group(),
        filterModules: new THREE.Group()
    };
    const disposables: any[] = [];

    // --- 1. 循环管路管道 (The Pipe Loop) ---
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, 0, 5),
        new THREE.Vector3(-4, 0, 5),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4, 2, -2),
        new THREE.Vector3(8, 0, -5),
        new THREE.Vector3(4, -2, -2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-4, 0, 5),
    ], true);

    const pipeGeo = new THREE.TubeGeometry(curve, 64, 0.3, 8, true);
    const pipeMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        transparent: true, 
        opacity: 0.2, 
        wireframe: true 
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    group.add(pipe);
    disposables.push(pipeGeo, pipeMat);

    // --- 2. 燃油粒子流 (Fuel Flow Particles) ---
    const pCount = 1200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    
    for(let i=0; i<pCount; i++) {
        const point = curve.getPoint(i / pCount);
        pPos[i*3] = point.x;
        pPos[i*3+1] = point.y;
        pPos[i*3+2] = point.z;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    
    const pMat = new THREE.PointsMaterial({ 
        size: 0.1, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const flowPoints = new THREE.Points(pGeo, pMat);
    group.add(flowPoints);
    animatables.fuelParticles = flowPoints;
    disposables.push(pGeo, pMat);

    // --- 3. 设备节点 (Pumps & Filters) ---
    const pumpGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.position.set(-6, 0, 5);
    animatables.pumpNodes?.add(pump);
    
    const filterGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
    const filterMat = new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: true });
    const filter = new THREE.Mesh(filterGeo, filterMat);
    filter.position.set(6, 0, -3.5);
    animatables.filterModules?.add(filter);
    
    group.add(animatables.pumpNodes!);
    group.add(animatables.filterModules!);
    disposables.push(pumpGeo, pumpMat, filterGeo, filterMat);

    // --- 4. 热力辉光 (Heater Glow) ---
    const heaterLight = new THREE.PointLight(0xf97316, 0, 15);
    heaterLight.position.set(0, 0, 0);
    group.add(heaterLight);
    animatables.heaterGlow = heaterLight;

    let animationId: number;
    const tempColor = new THREE.Color();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体漂浮
      group.position.y = Math.sin(time * 0.5) * 0.2;
      group.rotation.y += 0.001;

      // 粒子流动动画
      if (animatables.fuelParticles) {
          const positions = animatables.fuelParticles.geometry.attributes.position.array as Float32Array;
          const colors = animatables.fuelParticles.geometry.attributes.color.array as Float32Array;
          
          for(let i=0; i<pCount; i++) {
              // 计算流动进度
              let t = (i / pCount + time * flowRate * 0.1) % 1;
              const point = curve.getPoint(t);
              positions[i*3] = point.x + (Math.random()-0.5)*0.2;
              positions[i*3+1] = point.y + (Math.random()-0.5)*0.2;
              positions[i*3+2] = point.z + (Math.random()-0.5)*0.2;
              
              // 颜色随温度变化
              // 前半段(进气) 蓝色 -> 中段(加热) 橙色 -> 后半段(喷油) 红色
              if (t < 0.3) tempColor.setHex(0x0ea5e9);
              else if (t < 0.6) tempColor.lerpColors(new THREE.Color(0x0ea5e9), new THREE.Color(0xf59e0b), (t-0.3)/0.3);
              else tempColor.setHex(0xef4444);
              
              colors[i*3] = tempColor.r;
              colors[i*3+1] = tempColor.g;
              colors[i*3+2] = tempColor.b;
          }
          animatables.fuelParticles.geometry.attributes.position.needsUpdate = true;
          animatables.fuelParticles.geometry.attributes.color.needsUpdate = true;
      }

      // 异常反馈
      if (anomalyTarget === 'pump' && animatables.pumpNodes) {
          animatables.pumpNodes.scale.setScalar(1 + Math.sin(time * 15) * 0.05);
      }
      if (anomalyTarget === 'filter' && animatables.filterModules) {
          animatables.filterModules.scale.setScalar(1 + Math.sin(time * 10) * 0.03);
      }

      // 加热器亮度
      if (animatables.heaterGlow) {
          animatables.heaterGlow.intensity = (5 + Math.sin(time * 3) * 5) * temperatureLevel;
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
  }, [flowRate, temperatureLevel, anomalyTarget]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};