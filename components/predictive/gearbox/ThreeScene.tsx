
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GearboxAnimatables, GearboxViewMode } from './three-types';

interface ThreeSceneProps {
  viewMode: GearboxViewMode;
  vibrationIntensity: number; // 0-1
  tempLevel: number; // 0-1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  viewMode, 
  vibrationIntensity, 
  tempLevel 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. 基础场景设置 ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(8, 6, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // 开启阴影
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 30;

    // --- 2. 核心光影系统 (解决光线不正常的问题) ---
    // A. 半球光：模拟全局环境光，使背光面也有细节
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemiLight);

    // B. 主定向光：模拟强光源，产生清晰的金属高光
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // C. 侧向补光：增加蓝色调，提升科技感
    const sideLight = new THREE.PointLight(0x0ea5e9, 15, 50);
    sideLight.position.set(-10, 5, 5);
    scene.add(sideLight);

    // D. 内部发热模拟光 (PointLight)
    const heatPoint = new THREE.PointLight(0xff4400, 0, 10);
    heatPoint.position.set(0, 0, 0);
    scene.add(heatPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: GearboxAnimatables = {};
    const disposables: any[] = [];

    // --- 3. 几何体构建 ---
    
    // A. 减速箱外壳
    const casingGeo = new THREE.BoxGeometry(5, 3.5, 4, 2, 2, 2);
    const casingMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.2,
        transparent: true,
        opacity: viewMode === 'xray' ? 0.3 : 1.0,
        emissive: 0xff3300,
        emissiveIntensity: viewMode === 'thermal' ? tempLevel * 0.8 : 0
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.castShadow = true;
    casing.receiveShadow = true;
    group.add(casing);
    animatables.casing = casing;
    disposables.push(casingGeo, casingMat);

    // B. 内部齿轮组
    const gearGroup = new THREE.Group();
    const gearMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        metalness: 1.0, 
        roughness: 0.1 
    });
    
    const createGear = (radius: number, thickness: number, x: number) => {
        const geo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
        geo.rotateZ(Math.PI / 2);
        const mesh = new THREE.Mesh(geo, gearMat);
        mesh.position.x = x;
        mesh.castShadow = true;
        return mesh;
    };

    const gear1 = createGear(1.2, 0.6, -1.2);
    const gear2 = createGear(1.8, 0.8, 0.8);
    gearGroup.add(gear1, gear2);
    group.add(gearGroup);
    animatables.gears = gearGroup;
    disposables.push(gearMat);

    // C. 底部底座 (装饰)
    const baseGeo = new THREE.BoxGeometry(6, 0.4, 5);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2;
    base.receiveShadow = true;
    group.add(base);
    disposables.push(baseGeo, baseMat);

    // --- 4. 动画循环 ---
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 齿轮旋转
      if (animatables.gears) {
          animatables.gears.children[0].rotation.x += 0.05;
          animatables.gears.children[1].rotation.x -= 0.033;
      }

      // 振动抖动效果
      if (vibrationIntensity > 0) {
          group.position.y = Math.sin(time * 60) * (vibrationIntensity * 0.04);
          group.position.x = Math.cos(time * 50) * (vibrationIntensity * 0.02);
      } else {
          group.position.set(0, 0, 0);
      }

      // 热力动态
      if (viewMode === 'thermal') {
          heatPoint.intensity = 5 + Math.sin(time * 3) * 5;
          heatPoint.color.setHex(tempLevel > 0.7 ? 0xff0000 : 0xff4400);
      } else {
          heatPoint.intensity = 0;
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
  }, [viewMode, vibrationIntensity, tempLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
