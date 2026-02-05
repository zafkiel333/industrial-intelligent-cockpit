
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConfidenceAnimatables } from './three-types';

interface ThreeSceneProps {
  uncertainty: number; // 0-1, 越大云团越弥散
  confidenceLevel: number; // 0-1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  uncertainty = 0.3,
  confidenceLevel = 0.95
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 18);

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

    // --- 高级工业 PBR 照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(5, 15, 10);
    topLight.castShadow = true;
    scene.add(topLight);

    const cyanRim = new THREE.PointLight(0x0ea5e9, 10, 50);
    cyanRim.position.set(-10, 5, 5);
    scene.add(cyanRim);

    const probabilityGlow = new THREE.PointLight(0x8b5cf6, 15 * (1 - uncertainty), 30);
    probabilityGlow.position.set(0, 2, 0);
    scene.add(probabilityGlow);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ConfidenceAnimatables = { componentNodes: new Map(), uncertaintyShells: [] };
    const disposables: any[] = [];

    // --- 1. 核心机体 (Digital Twin Core) ---
    const blockGeo = new THREE.BoxGeometry(8, 4, 3);
    const blockMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.9, 
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    group.add(block);
    disposables.push(blockGeo, blockMat);

    // --- 2. 概率不确定性外壳 (Confidence Shells) ---
    const shellGeo = new THREE.SphereGeometry(6, 32, 32);
    for(let i=0; i<3; i++) {
        const shellMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            wireframe: true,
            transparent: true,
            opacity: 0.05 / (i + 1)
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.scale.setScalar(1 + i * 0.2 * uncertainty);
        group.add(shell);
        animatables.uncertaintyShells?.push(shell);
        disposables.push(shellMat);
    }
    disposables.push(shellGeo);

    // --- 3. 概率云粒子 (Uncertainty Cloud) ---
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 12;
        pPos[i*3+1] = (Math.random() - 0.5) * 6;
        pPos[i*3+2] = (Math.random() - 0.5) * 5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x22d3ee, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.2,
        blending: THREE.AdditiveBlending 
    });
    const cloud = new THREE.Points(pGeo, pMat);
    group.add(cloud);
    animatables.probabilityCloud = cloud;
    disposables.push(pGeo, pMat);

    // --- 4. 地面数据网格 ---
    const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体漂浮
      group.position.y = Math.sin(time * 0.5) * 0.2;
      group.rotation.y += 0.001;

      // 概率云粒子波动
      if (animatables.probabilityCloud) {
          animatables.probabilityCloud.rotation.y += 0.002;
          const pos = animatables.probabilityCloud.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += Math.sin(time + i) * 0.005 * uncertainty;
          }
          animatables.probabilityCloud.geometry.attributes.position.needsUpdate = true;
      }

      // 置信区间壳脉动
      animatables.uncertaintyShells?.forEach((shell, i) => {
          shell.rotation.z += 0.002 * (i + 1);
          shell.scale.setScalar((1 + i * 0.2 * uncertainty) + Math.sin(time * 2) * 0.02);
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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [uncertainty, confidenceLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
