
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BallMillAnimatables, MillViewMode } from './three-types';

interface ThreeSceneProps {
  healthScore?: number;
  rotationSpeed?: number;
  viewMode?: MillViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthScore = 85,
  rotationSpeed = 0.02,
  viewMode = 'mechanical'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ball-mill useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 8, 18);

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

    // --- 环境光照系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const cyanPoint = new THREE.PointLight(0x0ea5e9, 20, 50);
    cyanPoint.position.set(-10, 5, 5);
    scene.add(cyanPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: BallMillAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 筒体主体 (Shell) ---
    const shellGroup = new THREE.Group();
    const shellGeo = new THREE.CylinderGeometry(4, 4, 10, 64);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.9, 
        roughness: 0.15,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.3 : 1.0,
        emissive: viewMode === 'thermal' ? 0xff4400 : 0x000000,
        emissiveIntensity: viewMode === 'thermal' ? (100 - healthScore) / 50 : 0
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shellGroup.add(shell);
    group.add(shellGroup);
    animatables.shell = shellGroup;
    disposables.push(shellGeo, shellMat);

    // --- 2. 大齿轮 (Girth Gear) ---
    const gearGeo = new THREE.TorusGeometry(4.2, 0.2, 16, 100);
    gearGeo.rotateY(Math.PI / 2);
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 1.0 });
    const girthGear = new THREE.Mesh(gearGeo, gearMat);
    girthGear.position.x = 2;
    shellGroup.add(girthGear);
    animatables.girthGear = girthGear;
    disposables.push(gearGeo, gearMat);

    // --- 3. 轴瓦支撑 (Trunnion Bearings) ---
    const createBearing = (posX: number) => {
        const bGroup = new THREE.Group();
        bGroup.position.x = posX;
        const bGeo = new THREE.CylinderGeometry(1.2, 1.5, 2, 32);
        bGeo.rotateZ(Math.PI/2);
        const bMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        const mesh = new THREE.Mesh(bGeo, bMat);
        bGroup.add(mesh);
        return bGroup;
    };
    const bearingL = createBearing(-5.5);
    const bearingR = createBearing(5.5);
    group.add(bearingL, bearingR);
    animatables.bearingL = bearingL;
    animatables.bearingR = bearingR;

    // --- 4. 内部物料流 (模拟) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 2 + Math.random() * 1.5;
        pPos[i*3] = (Math.random() - 0.5) * 8;
        pPos[i*3+1] = Math.sin(angle) * r;
        pPos[i*3+2] = Math.cos(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x94a3b8, 
        size: 0.08, 
        transparent: true, 
        opacity: viewMode === 'xray' ? 0.6 : 0 
    });
    const particles = new THREE.Points(pGeo, pMat);
    shellGroup.add(particles);
    animatables.materialParticles = particles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 筒体旋转
      if (animatables.shell) {
          animatables.shell.rotation.x += rotationSpeed;
      }

      // 异常振动模拟
      if (healthScore < 80) {
          group.position.y = Math.sin(time * 40) * (0.01 * (100 - healthScore) / 100);
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
  }, [healthScore, rotationSpeed, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
