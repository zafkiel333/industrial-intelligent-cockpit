import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FuelLeakAnimatables } from './three-types';

interface ThreeSceneProps {
  clogLevel?: number; // 0-1
  leakPosition?: number; // 0-1 (along the pipe)
  isAnomalyActive?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  clogLevel = 0.2, 
  leakPosition = 0.6,
  isAnomalyActive = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 15);

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

    // --- 工业光影矩阵 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const mainLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FuelLeakAnimatables = { 
        pipeNetwork: new THREE.Group(),
        clogZones: new THREE.Group()
    };
    const disposables: any[] = [];

    // --- 1. 管路网络 (Pipe Network) ---
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, 0, 0),
        new THREE.Vector3(-4, 2, 0),
        new THREE.Vector3(0, 0, 2),
        new THREE.Vector3(4, -2, 0),
        new THREE.Vector3(8, 0, 0),
    ]);

    const pipeGeo = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);
    const pipeMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        transparent: true, 
        opacity: 0.3, 
        wireframe: true 
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    group.add(pipe);
    disposables.push(pipeGeo, pipeMat);

    // --- 2. 流体粒子 (Fluid Particles) ---
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    
    for(let i=0; i<pCount; i++) {
        const t = i / pCount;
        const pt = curve.getPoint(t);
        pPos[i*3] = pt.x;
        pPos[i*3+1] = pt.y;
        pPos[i*3+2] = pt.z;
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
    animatables.flowParticles = flowPoints;
    disposables.push(pGeo, pMat);

    // --- 3. 泄漏雾化 (Leak Spray) ---
    const leakCount = 200;
    const leakGeo = new THREE.BufferGeometry();
    const leakPos = new Float32Array(leakCount * 3);
    leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.05, transparent: true, opacity: 0 });
    const leakSpray = new THREE.Points(leakGeo, leakMat);
    group.add(leakSpray);
    disposables.push(leakGeo, leakMat);

    // --- 4. 扫描切片 (Scanning Plane) ---
    const scanGeo = new THREE.PlaneGeometry(12, 12);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.05, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.y = Math.PI / 2;
    scene.add(scanner);
    disposables.push(scanGeo, scanMat);

    let animationId: number;
    const tempColor = new THREE.Color();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体漂浮
      group.position.y = Math.sin(time * 0.5) * 0.2;
      group.rotation.y += 0.001;

      // 扫描移动
      scanner.position.x = Math.sin(time * 1.5) * 8;

      // 流体运动
      if (animatables.flowParticles) {
          const pos = animatables.flowParticles.geometry.attributes.position.array as Float32Array;
          const colors = animatables.flowParticles.geometry.attributes.color.array as Float32Array;
          
          for(let i=0; i<pCount; i++) {
              let t = (i / pCount + time * 0.2) % 1;
              
              // 模拟堵塞：流体在前半段变慢并变色
              if (clogLevel > 0.5 && t < 0.5) {
                  t *= (1 - clogLevel * 0.2);
              }

              const point = curve.getPoint(t);
              pos[i*3] = point.x + (Math.random()-0.5)*0.1;
              pos[i*3+1] = point.y + (Math.random()-0.5)*0.1;
              pos[i*3+2] = point.z + (Math.random()-0.5)*0.1;
              
              // 颜色映射：压力梯度
              // 正常：青色 -> 堵塞：橙黄色 -> 泄漏点：红色
              if (isAnomalyActive && Math.abs(t - leakPosition) < 0.05) {
                  tempColor.setHex(0xef4444);
              } else if (clogLevel > 0.4) {
                  tempColor.setHex(0xf59e0b);
              } else {
                  tempColor.setHex(0x22d3ee);
              }
              
              colors[i*3] = tempColor.r;
              colors[i*3+1] = tempColor.g;
              colors[i*3+2] = tempColor.b;
          }
          animatables.flowParticles.geometry.attributes.position.needsUpdate = true;
          animatables.flowParticles.geometry.attributes.color.needsUpdate = true;
      }

      // 泄漏模拟
      if (isAnomalyActive) {
          leakMat.opacity = 0.6 + Math.sin(time * 10) * 0.4;
          const lPos = leakSpray.geometry.attributes.position.array as Float32Array;
          const leakPoint = curve.getPoint(leakPosition);
          for(let i=0; i<leakCount; i++) {
              lPos[i*3] = leakPoint.x + (Math.random()-0.5) * 0.2 + (Math.sin(time * 20 + i) * 0.5);
              lPos[i*3+1] = leakPoint.y + (Math.random()-0.5) * 0.2 + (Math.cos(time * 20 + i) * 0.5);
              lPos[i*3+2] = leakPoint.z + (Math.random()-0.5) * 0.2;
          }
          leakSpray.geometry.attributes.position.needsUpdate = true;
      } else {
          leakMat.opacity = 0;
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
  }, [clogLevel, leakPosition, isAnomalyActive]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};