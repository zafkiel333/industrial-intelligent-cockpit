
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HatchAnimatables } from './three-types';

interface ThreeSceneProps {
  openProgress?: number; // 0-1
  riskLevel?: number; // 0-1
  isScanning?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  openProgress = 0, 
  riskLevel = 0.2,
  isScanning = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
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

    // --- 环境照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0x0ea5e9, 15, 40);
    accentLight.position.set(-10, 5, 5);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: HatchAnimatables = { panels: [], pistons: [] };
    const disposables: any[] = [];

    // --- 1. 舱口围基座 (Coaming) ---
    const baseGeo = new THREE.BoxGeometry(10, 1, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.5;
    group.add(base);

    // --- 2. 四段式折叠盖板 (Folding Panels) ---
    const panelW = 2.5;
    const panelH = 0.3;
    const panelD = 7.5;
    const panelGeo = new THREE.BoxGeometry(panelW, panelH, panelD);
    const panelMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: riskLevel > 0.6 ? 0xff0000 : 0x000000,
        emissiveIntensity: 0.3
    });

    for(let i=0; i<4; i++) {
        const panelPivot = new THREE.Group();
        const panelMesh = new THREE.Mesh(panelGeo, panelMat);
        panelMesh.position.x = panelW / 2; // 旋转中心设在边缘
        panelPivot.add(panelMesh);
        
        // 初始位置排布
        if (i === 0) {
            panelPivot.position.set(-5, 0.5, 0);
            group.add(panelPivot);
        } else {
            panelPivot.position.set(panelW, 0, 0);
            animatables.panels![i-1].add(panelPivot);
        }
        animatables.panels?.push(panelPivot);
    }

    // --- 3. 液压油缸 (Hydraulic Actuators) ---
    const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const pistonGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });

    const createRam = (zPos: number) => {
        const ramGroup = new THREE.Group();
        const cylinder = new THREE.Mesh(cylGeo, cylMat);
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        piston.position.y = 1; 
        ramGroup.add(cylinder, piston);
        ramGroup.position.set(-4, 0, zPos);
        ramGroup.rotation.z = Math.PI / 3;
        group.add(ramGroup);
        animatables.pistons?.push(piston);
    };
    createRam(3.2);
    createRam(-3.2);

    // --- 4. 扫描面特效 ---
    const scanRingGeo = new THREE.TorusGeometry(8, 0.05, 16, 100);
    scanRingGeo.rotateX(Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanMat);
    scene.add(scanRing);
    animatables.scanningFringe = scanRing;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 角度联动逻辑 (折叠)
      if (animatables.panels) {
          const angle = (Math.PI / 2.2) * openProgress;
          animatables.panels[0].rotation.z = angle;
          animatables.panels[1].rotation.z = -angle * 2;
          animatables.panels[2].rotation.z = angle * 2;
          animatables.panels[3].rotation.z = -angle * 2;
      }

      // 活塞伸缩
      animatables.pistons?.forEach(p => {
          p.position.y = 1 + openProgress * 1.5;
      });

      // 扫描特效
      if (isScanning && animatables.scanningFringe) {
          animatables.scanningFringe.position.y = Math.sin(time * 2) * 5;
          (animatables.scanningFringe.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 10) * 0.1;
          animatables.scanningFringe.scale.setScalar(1 + Math.sin(time * 5) * 0.02);
      } else if (animatables.scanningFringe) {
          (animatables.scanningFringe.material as THREE.MeshBasicMaterial).opacity = 0;
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
      disposables.forEach(d => d?.dispose?.());
      renderer.dispose();
    };
  }, [openProgress, riskLevel, isScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
