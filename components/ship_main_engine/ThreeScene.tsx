
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipEngineThreeProps } from './three-types';

export const ShipEngineThreeScene: React.FC<ShipEngineThreeProps> = ({ 
  components, 
  activeComponentId, 
  onComponentClick,
  isRunning,
  showThermal,
  explodeLevel
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境构建 ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // --- 主机模型组 ---
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    const meshMap = new Map<string, THREE.Mesh>();

    // 模拟构建一个 6 缸大型主机
    const cylinderCount = 6;
    for (let i = 0; i < cylinderCount; i++) {
        const xOffset = (i - 2.5) * 2.5;
        
        // 1. 气缸体 (Cylinder Liner)
        const linerGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
        const linerMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x475569, 
            transparent: true, 
            opacity: 0.6,
            metalness: 0.9,
            roughness: 0.1
        });
        const liner = new THREE.Mesh(linerGeo, linerMat);
        liner.position.set(xOffset, 0, 0);
        liner.userData = { id: `LINER-${i}`, basePos: new THREE.Vector3(xOffset, 0, 0) };
        engineGroup.add(liner);
        meshMap.set(`LINER-${i}`, liner);

        // 2. 活塞总成 (Piston)
        const pistonGeo = new THREE.CylinderGeometry(0.7, 0.7, 1, 32);
        const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        piston.position.set(xOffset, -1, 0);
        piston.userData = { id: `PISTON-${i}`, basePos: new THREE.Vector3(xOffset, -1, 0), phase: i * Math.PI/3 };
        engineGroup.add(piston);
        meshMap.set(`PISTON-${i}`, piston);

        // 3. 气缸盖 (Cylinder Head)
        const headGeo = new THREE.CylinderGeometry(1, 1, 0.5, 6);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(xOffset, 2.3, 0);
        head.userData = { id: `HEAD-${i}`, basePos: new THREE.Vector3(xOffset, 2.3, 0) };
        engineGroup.add(head);
        meshMap.set(`HEAD-${i}`, head);
    }

    // 4. 增压器 (Turbocharger)
    const turboGeo = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
    const turboMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 1 });
    const turbo = new THREE.Mesh(turboGeo, turboMat);
    turbo.position.set(8, 2, 0);
    turbo.rotation.y = Math.PI / 2;
    turbo.userData = { id: 'TURBO-01', basePos: new THREE.Vector3(8, 2, 0) };
    engineGroup.add(turbo);
    meshMap.set('TURBO-01', turbo);

    // --- 灯光系统 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 100);
    point.position.set(10, 20, 10);
    scene.add(point);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(engineGroup.children);
      if (intersects.length > 0) {
        onComponentClick(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // 运行模拟
      engineGroup.children.forEach((child: any) => {
        if (child.userData.id?.startsWith('PISTON') && isRunning) {
           child.position.y = child.userData.basePos.y + Math.sin(time * 5 + child.userData.phase) * 0.8;
        }

        // 爆炸视图偏移
        if (explodeLevel > 0) {
           const dir = child.position.clone().normalize();
           if (child.userData.id?.includes('HEAD')) child.position.y = child.userData.basePos.y + explodeLevel * 5;
           if (child.userData.id?.includes('TURBO')) child.position.x = child.userData.basePos.x + explodeLevel * 5;
        } else if (!isRunning) {
           child.position.copy(child.userData.basePos);
        }

        // 热力效果
        if (showThermal && child.material.type === 'MeshPhysicalMaterial') {
           const heat = Math.sin(time * 2 + child.userData.basePos.x) * 0.5 + 0.5;
           child.material.emissive.setHSL(0.0, 1.0, heat * 0.5);
           child.material.emissiveIntensity = heat;
        } else {
           if (child.material.emissive) {
              const isActive = child.userData.id === activeComponentId;
              child.material.emissive.setHex(isActive ? 0x0ea5e9 : 0x000000);
              child.material.emissiveIntensity = isActive ? 0.8 : 0;
           }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isRunning, showThermal, explodeLevel, activeComponentId]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
