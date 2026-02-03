
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FloodThreeProps } from './three-types';

export const FloodThreeScene: React.FC<FloodThreeProps> = ({ 
  waterLevel, 
  rainIntensity, 
  hotspots, 
  activePointId, 
  onPointClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1a2a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.2;

    // --- 1. 地形与堤坝模型 ---
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // 抽象河床
    const groundGeo = new THREE.PlaneGeometry(40, 40, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      wireframe: true,
      transparent: true,
      opacity: 0.2 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    terrainGroup.add(ground);

    // 堤坝主体 (Dam)
    const damGeo = new THREE.BoxGeometry(30, 8, 4);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(0, 2, 0);
    terrainGroup.add(dam);

    // --- 2. 动态水体 ---
    const waterGeo = new THREE.PlaneGeometry(30, 15);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transmission: 0.6,
      opacity: 0.8,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0, -8); // 堤坝上游
    scene.add(water);

    // --- 3. 降雨粒子系统 ---
    const rainCount = 1000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i+=3) {
      rainPos[i] = (Math.random() - 0.5) * 40;
      rainPos[i+1] = Math.random() * 20;
      rainPos[i+2] = (Math.random() - 0.5) * 40;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.05, transparent: true, opacity: 0.5 });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // --- 4. 关键监测点/风险点 ---
    const markerMeshes: THREE.Mesh[] = [];
    hotspots.forEach(hp => {
      const color = hp.type === 'danger' ? 0xef4444 : 0x10b981;
      const markerGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const markerMat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.5 
      });
      const mesh = new THREE.Mesh(markerGeo, markerMat);
      mesh.position.set(...hp.position);
      mesh.userData = { id: hp.id };
      
      // 增加雷达扩散圈
      const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);

      scene.add(mesh);
      markerMeshes.push(mesh);
    });

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0x0ea5e9, 2);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // 交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);
      if (intersects.length > 0) {
        onPointClick(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // 模拟水位上涨 (y轴映射)
      const targetWaterY = -2 + waterLevel * 6;
      water.position.y += (targetWaterY - water.position.y) * 0.05;
      water.position.y += Math.sin(time * 2) * 0.02; // 水面波动

      // 降雨动画
      if (rainIntensity > 0) {
        const posArr = rainParticles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<rainCount; i++) {
          posArr[i*3+1] -= 0.2 * rainIntensity; // 下落速度
          if (posArr[i*3+1] < -2) posArr[i*3+1] = 20;
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
        rainParticles.visible = true;
      } else {
        rainParticles.visible = false;
      }

      // 节点动画
      markerMeshes.forEach(m => {
        const isActive = m.userData.id === activePointId;
        m.scale.setScalar(isActive ? 1.5 + Math.sin(time * 8) * 0.2 : 1);
        m.children[0].scale.setScalar(1 + Math.sin(time * 4) * 0.5);
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
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [waterLevel, rainIntensity, hotspots, activePointId]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
