
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StructureAnimatables } from './three-types';

interface ThreeSceneProps {
  looseningSeverity?: number; // 0 to 1
  showCracks?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  looseningSeverity = 0.1,
  showCracks = false 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 增加雾化效果，提升空间感
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
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
    controls.dampingFactor = 0.05;

    // --- 工业级照明配置 ---
    // 1. 环境光：提供基础亮度
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    // 2. 主定向光：模拟上方射灯，突出金属质感
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 15, 7);
    scene.add(dirLight);

    // 3. 侧向补光：蓝色科技冷光
    const fillLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    fillLight.position.set(-10, 5, 5);
    scene.add(fillLight);

    // 4. 底部反光：深紫色，增强阴影深度
    const bottomLight = new THREE.PointLight(0x8b5cf6, 5, 20);
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: StructureAnimatables = {};
    const disposables: any[] = [];

    // --- 构建筛箱几何体 ---
    const boxGroup = new THREE.Group();
    group.add(boxGroup);
    animatables.boxFrame = boxGroup;

    // 1. 侧板 (Side Plates)
    const plateGeo = new THREE.BoxGeometry(10, 3, 0.2);
    const plateMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.2 
    });
    
    const leftPlate = new THREE.Mesh(plateGeo, plateMat);
    leftPlate.position.z = 2.5;
    const rightPlate = leftPlate.clone();
    rightPlate.position.z = -2.5;
    boxGroup.add(leftPlate, rightPlate);
    disposables.push(plateGeo, plateMat);

    // 2. 横梁组 (Cross Beams)
    const beamGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 16);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    for(let i = -4; i <= 4; i += 2) {
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.x = i;
        beam.position.y = -1;
        boxGroup.add(beam);
    }
    disposables.push(beamGeo, beamMat);

    // 3. 螺栓组标记 (Bolt Groups)
    const boltGroup = new THREE.Group();
    const boltGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc, emissiveIntensity: 0.5 });
    for(let i = -4; i <= 4; i += 1.5) {
        for(let j = -1; j <= 1; j += 1) {
            const bolt = new THREE.Mesh(boltGeo, boltMat);
            bolt.position.set(i, j, 2.6);
            boltGroup.add(bolt);
            const bolt2 = bolt.clone();
            bolt2.position.z = -2.6;
            boltGroup.add(bolt2);
        }
    }
    boxGroup.add(boltGroup);
    animatables.boltMarkers = boltGroup;
    disposables.push(boltGeo, boltMat);

    // 4. 扫描环 (Scan Line Effect)
    const ringGeo = new THREE.TorusGeometry(7, 0.02, 16, 100);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    group.add(scanRing);
    animatables.scanRing = scanRing;
    disposables.push(ringGeo, ringMat);

    // 5. 裂纹高亮层 (Crack Overlay)
    const crackGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const crackGroup = new THREE.Group();
    const c1 = new THREE.Mesh(crackGeo, crackMat);
    c1.position.set(2, 0.5, 2.6);
    crackGroup.add(c1);
    boxGroup.add(crackGroup);
    animatables.crackOverlay = crackGroup;
    crackGroup.visible = showCracks;
    disposables.push(crackGeo, crackMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 模拟工作振动
      if (animatables.boxFrame) {
          const vib = 0.02 + looseningSeverity * 0.05;
          animatables.boxFrame.position.y = Math.sin(time * 20) * vib;
          animatables.boxFrame.rotation.z = Math.cos(time * 15) * (vib * 0.2);
      }

      // 扫描环移动
      if (animatables.scanRing) {
          animatables.scanRing.position.y = Math.sin(time) * 4;
      }

      // 螺栓异常闪烁
      if (animatables.boltMarkers) {
          const warnBolts = animatables.boltMarkers.children.slice(0, 5);
          warnBolts.forEach((b: any) => {
              b.material.color.setHex(looseningSeverity > 0.4 ? 0xf59e0b : 0x00ffcc);
              b.scale.setScalar(1 + Math.sin(time * 10) * 0.3 * looseningSeverity);
          });
      }

      if (controls) controls.update();
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [looseningSeverity, showCracks]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
