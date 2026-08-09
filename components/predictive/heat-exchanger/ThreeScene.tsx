
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HeatExchangerAnimatables } from './three-types';

interface ThreeSceneProps {
  cloggingSeverity?: number; // 0-1
  efficiency?: number; // 0-1
  viewMode?: 'structure' | 'thermal' | 'clogging';
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  cloggingSeverity = 0.2, 
  efficiency = 0.9,
  viewMode = 'thermal'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===heat-exchanger useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

    // --- 高级照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const bluePoint = new THREE.PointLight(0x0ea5e9, 20, 50);
    bluePoint.position.set(-10, 5, 5);
    scene.add(bluePoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: HeatExchangerAnimatables = { scalingGlows: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 换热器外壳 (Shell) ---
    const shellGeo = new THREE.CylinderGeometry(4, 4, 12, 64, 1, true, 0, Math.PI * 1.5);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.3,
        wireframe: true
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    group.add(shell);
    disposables.push(shellGeo, shellMat);

    // --- 2. 内部管束 (Tube Bundle) ---
    const tubeGroup = new THREE.Group();
    const tubeGeo = new THREE.CylinderGeometry(0.1, 0.1, 11.5, 8);
    tubeGeo.rotateZ(Math.PI / 2);
    
    // 管束矩阵
    for (let i = -2; i <= 2; i += 0.6) {
        for (let j = -2; j <= 2; j += 0.6) {
            if (i*i + j*j > 8) continue; // 限制在圆柱体内
            
            const isClogged = (Math.random() < cloggingSeverity * 0.5);
            const tubeMat = new THREE.MeshStandardMaterial({ 
                color: isClogged ? 0xf59e0b : 0x94a3b8,
                emissive: isClogged ? 0xff4400 : 0x000000,
                emissiveIntensity: 0.5
            });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            tube.position.set(0, i, j);
            tubeGroup.add(tube);
            disposables.push(tubeMat);

            if (isClogged) {
                const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
                const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6 });
                const glow = new THREE.Mesh(glowGeo, glowMat);
                glow.position.set((Math.random()-0.5)*8, i, j);
                animatables.scalingGlows?.add(glow);
                disposables.push(glowGeo, glowMat);
            }
        }
    }
    group.add(tubeGroup);
    group.add(animatables.scalingGlows!);
    disposables.push(tubeGeo);

    // --- 3. 流体粒子系统 (Fluid Flows) ---
    const createFluid = (color: number, count: number) => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            pos[i*3] = (Math.random() - 0.5) * 12;
            pos[i*3+1] = (Math.random() - 0.5) * 6;
            pos[i*3+2] = (Math.random() - 0.5) * 6;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.4 });
        return new THREE.Points(geo, mat);
    };

    const hotFluid = createFluid(0xef4444, 400); // 红色热端
    const coldFluid = createFluid(0x0ea5e9, 400); // 蓝色冷端
    group.add(hotFluid, coldFluid);
    animatables.hotFluidParticles = hotFluid;
    animatables.coldFluidParticles = coldFluid;

    // --- 4. 扫描面 (Scanning Logic) ---
    const scanGeo = new THREE.PlaneGeometry(6, 6);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.y = Math.PI / 2;
    group.add(scanner);
    animatables.scanningPlane = scanner;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体缓慢自转
      group.rotation.y += 0.001;

      // 流体流动模拟
      if (animatables.hotFluidParticles && animatables.coldFluidParticles) {
          const hPos = animatables.hotFluidParticles.geometry.attributes.position.array as Float32Array;
          const cPos = animatables.coldFluidParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<400; i++) {
              hPos[i*3] += 0.08 * efficiency; // 热流向右
              if (hPos[i*3] > 6) hPos[i*3] = -6;
              
              cPos[i*3] -= 0.1 * efficiency; // 冷流向左 (逆流)
              if (cPos[i*3] < -6) cPos[i*3] = 6;
          }
          animatables.hotFluidParticles.geometry.attributes.position.needsUpdate = true;
          animatables.coldFluidParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 异常点闪烁
      if (animatables.scalingGlows) {
          animatables.scalingGlows.children.forEach(g => {
              g.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
          });
      }

      // 扫描线移动
      if (animatables.scanningPlane) {
          animatables.scanningPlane.position.x = Math.sin(time * 2) * 5.8;
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
  }, [cloggingSeverity, efficiency, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
