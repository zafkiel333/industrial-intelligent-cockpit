
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConveyingThreeProps } from './three-types';

export const ConveyorScene: React.FC<ConveyingThreeProps> = ({ 
  parts, 
  activeId, 
  onSelect,
  speed,
  viewMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境光影方案 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // 主工业冷光
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 底部机械热感光
    const heaterLight = new THREE.PointLight(0xf97316, 5, 20);
    heaterLight.position.set(-5, -2, 0);
    scene.add(heaterLight);

    // --- 模型构建 ---
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1,
      transparent: viewMode === 'xray',
      opacity: viewMode === 'xray' ? 0.3 : 1
    });

    const activeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5,
      metalness: 0.9
    });

    // 1. 驱动滚筒 (Drive Pulley)
    const pulleyGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 32);
    const drivePulley = new THREE.Mesh(pulleyGeo, activeId === 'PULL-01' ? activeMat : metalMat);
    drivePulley.rotation.z = Math.PI / 2;
    drivePulley.position.x = -8;
    drivePulley.userData = { id: 'PULL-01' };
    conveyorGroup.add(drivePulley);

    // 2. 尾部滚筒
    const tailPulley = drivePulley.clone();
    tailPulley.position.x = 8;
    tailPulley.userData = { id: 'PULL-02' };
    conveyorGroup.add(tailPulley);

    // 3. 输送皮带 (Belt) - 简化为拉伸路径
    const beltGeo = new THREE.BoxGeometry(16, 0.2, 7.8);
    const beltMat = new THREE.MeshStandardMaterial({ 
      color: 0x111827, 
      roughness: 0.9,
      transparent: true,
      opacity: viewMode === 'thermal' ? 0.4 : 1
    });
    const topBelt = new THREE.Mesh(beltGeo, beltMat);
    topBelt.position.y = 1.5;
    conveyorGroup.add(topBelt);

    // 4. 托辊组 (Idlers)
    const idlerGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 16);
    for(let i = -6; i <= 6; i+=3) {
      const idler = new THREE.Mesh(idlerGeo, metalMat);
      idler.rotation.z = Math.PI / 2;
      idler.position.set(i, 1.2, 0);
      conveyorGroup.add(idler);
    }

    // 交互检测
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(conveyorGroup.children);
      if (intersects.length > 0 && intersects[0].object.userData.id) {
        onSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 运行动画
      drivePulley.rotation.x += speed * 0.05;
      tailPulley.rotation.x += speed * 0.05;
      
      // 皮带表面纹理移动模拟 (此处简化为轻微位移)
      topBelt.position.z = Math.sin(time * 2) * 0.01;

      if (viewMode === 'thermal') {
        heaterLight.intensity = 5 + Math.sin(time * 10) * 2;
      }

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
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [speed, viewMode, activeId]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
