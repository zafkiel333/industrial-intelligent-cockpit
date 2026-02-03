
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningBearingThreeProps } from './three-types';

export const BearingDetailScene: React.FC<MiningBearingThreeProps> = ({ 
  status, 
  onPartClick,
  rotationSpeed,
  viewMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高级光影系统 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    // 主工业冷光 (顶部)
    const mainSpot = new THREE.SpotLight(0xffffff, 100, 50, Math.PI / 4, 0.5);
    mainSpot.position.set(10, 20, 10);
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    // 侧向蓝色金属勾勒光
    const sideBlue = new THREE.PointLight(0x0ea5e9, 15, 30);
    sideBlue.position.set(-10, 5, 0);
    scene.add(sideBlue);

    // 底部热效应橙光
    const bottomHeat = new THREE.PointLight(0xf59e0b, 5, 20);
    bottomHeat.position.set(0, -5, 5);
    scene.add(bottomHeat);

    // --- 轴承模型构建 ---
    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 1,
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    const stressMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const lubMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6
    });

    // 1. 外圈 (Outer Ring)
    const outerGeo = new THREE.CylinderGeometry(5, 5, 3, 64, 1, true);
    const outerMesh = new THREE.Mesh(outerGeo, viewMode === 'stress' ? stressMat : metalMat);
    outerMesh.rotation.z = Math.PI / 2;
    outerMesh.userData = { name: '外圈' };
    bearingGroup.add(outerMesh);

    // 2. 内圈 (Inner Ring)
    const innerGeo = new THREE.CylinderGeometry(3, 3, 3.2, 64, 1, true);
    const innerMesh = new THREE.Mesh(innerGeo, metalMat);
    innerMesh.rotation.z = Math.PI / 2;
    innerMesh.userData = { name: '内圈' };
    bearingGroup.add(innerMesh);

    // 3. 滚子组 (Rollers)
    const rollerCount = 14;
    const rollers: THREE.Mesh[] = [];
    const rollerGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.8, 32);
    for (let i = 0; i < rollerCount; i++) {
        const angle = (i / rollerCount) * Math.PI * 2;
        const radius = 4;
        const roller = new THREE.Mesh(rollerGeo, metalMat);
        roller.position.set(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
        roller.rotation.z = Math.PI / 2;
        roller.userData = { name: `滚子-${i}` };
        bearingGroup.add(roller);
        rollers.push(roller);
    }

    // 4. 油膜层 (Lubrication Layer) - 仅在模式下显示
    const lubGeo = new THREE.CylinderGeometry(4.1, 4.1, 2.9, 64, 1, true);
    const lubMesh = new THREE.Mesh(lubGeo, lubMat);
    lubMesh.rotation.z = Math.PI / 2;
    lubMesh.visible = viewMode === 'lubrication';
    bearingGroup.add(lubMesh);

    // --- 交互射束 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bearingGroup.children);
      if (intersects.length > 0 && intersects[0].object.userData.name) {
        onPartClick(intersects[0].object.userData.name);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      // 旋转动力学
      if (rotationSpeed > 0) {
        innerMesh.rotation.x -= rotationSpeed * 0.1;
        rollers.forEach((r, i) => {
            const angle = (i / rollerCount) * Math.PI * 2 + frame * rotationSpeed;
            const radius = 4;
            r.position.set(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
            r.rotation.x += rotationSpeed * 0.2;
        });
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
  }, [rotationSpeed, viewMode, status]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
