
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CrusherThreeProps } from './three-types';

export const CrusherScene: React.FC<CrusherThreeProps> = ({ 
  parts, 
  activePartId, 
  onPartSelect,
  isOperating,
  crushSpeed 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
/*
  useEffect(() => {
    console.log('=== ThreeScene useEffect ===', Date.now()); 
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // 启用高级阴影与色调映射
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 核心工业模型构建 (圆锥破碎机) ---
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const wearMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2,
      metalness: 0.9,
      roughness: 0.1
    });

    // 1. 外部框架 (Outer Frame)
    const frameGeo = new THREE.CylinderGeometry(4.5, 5, 6, 32, 1, true);
    const frame = new THREE.Mesh(frameGeo, metalMat);
    frame.position.y = 1;
    crusherGroup.add(frame);

    // 2. 动锥 (Mantle) - 核心磨损件
    const mantlePart = parts.find(p => p.type === 'mantle');
    const mantleGeo = new THREE.ConeGeometry(3, 5, 32);
    const mantle = new THREE.Mesh(mantleGeo, mantlePart?.id === activePartId ? wearMat : metalMat);
    mantle.position.y = 1.5;
    mantle.userData = { id: mantlePart?.id };
    crusherGroup.add(mantle);

    // 3. 定锥衬板 (Bowl Liner)
    const linerPart = parts.find(p => p.type === 'bowl_liner');
    const linerGeo = new THREE.CylinderGeometry(3.5, 4.2, 3, 32, 1, true);
    const liner = new THREE.Mesh(linerGeo, linerPart?.id === activePartId ? wearMat : metalMat);
    liner.position.y = 2.5;
    liner.userData = { id: linerPart?.id };
    crusherGroup.add(liner);

    // 4. 底部传动主轴
    const shaftGeo = new THREE.CylinderGeometry(0.8, 1, 8, 32);
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.position.y = -2;
    crusherGroup.add(shaft);

    // --- 粒子流 (模拟矿石破碎) ---
    const particlesCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount*3; i++) pPos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x78716c, size: 0.1, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    console.log('=== CrusherThreeProps开始创建粒子 ===', Date.now()); 
    scene.add(particles);

    // --- 光照设计 (核心重点) ---
    // 1. 顶部工业射灯
    const topLight = new THREE.SpotLight(0xffffff, 50, 40, Math.PI/4, 0.5);
    topLight.position.set(5, 15, 5);
    topLight.castShadow = true;
    scene.add(topLight);

    // 2. 内部红色热源光 (模拟摩擦负载)
    const coreLight = new THREE.PointLight(0xef4444, isOperating ? 15 : 2, 10);
    coreLight.position.set(0, 2, 0);
    scene.add(coreLight);

    // 3. 侧向蓝色冷补光
    const sideLight = new THREE.DirectionalLight(0x0ea5e9, 2);
    sideLight.position.set(-10, 5, 0);
    scene.add(sideLight);

    // --- 交互逻辑 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([mantle, liner]);
      if (intersects.length > 0) {
        onPartSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      if (isOperating) {
        // 模拟旋摆运动 (Gyratory Motion)
        mantle.rotation.z = Math.sin(time * crushSpeed) * 0.1;
        mantle.rotation.x = Math.cos(time * crushSpeed) * 0.1;
        
        // 粒子下落逻辑
        const posArr = pGeo.attributes.position.array as Float32Array;
        for(let i=0; i<particlesCount; i++) {
            posArr[i*3+1] -= 0.1 * crushSpeed;
            if(posArr[i*3+1] < -3) posArr[i*3+1] = 6;
        }
        pGeo.attributes.position.needsUpdate = true;
        coreLight.intensity = 15 + Math.sin(time * 20) * 5;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [parts, activePartId, isOperating, crushSpeed]);
*/
  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
