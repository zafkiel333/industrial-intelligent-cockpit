
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MineSafetyThreeProps } from './three-types';

export const MineSafetyScene: React.FC<MineSafetyThreeProps> = ({ 
  sensors, 
  activeSensorId, 
  onSelect,
  mineDepth,
  alertLevel 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(15, 12, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 模拟矿井光影 ---
    const ambient = new THREE.AmbientLight(0x1e293b, 0.2);
    scene.add(ambient);

    // 探照灯效果 (Spotlight as Headlamp)
    const headlamp = new THREE.SpotLight(0xffffff, 200);
    headlamp.position.set(15, 15, 15);
    headlamp.angle = Math.PI / 8;
    headlamp.penumbra = 0.3;
    headlamp.decay = 2;
    headlamp.distance = 100;
    headlamp.castShadow = true;
    scene.add(headlamp);

    // 矿道背景光
    const purpleLight = new THREE.PointLight(0x8b5cf6, 10, 40);
    purpleLight.position.set(-10, 5, -5);
    scene.add(purpleLight);

    // --- 矿井结构构建 ---
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    // 绘制垂直矿井断面 (岩石质感)
    const wallGeo = new THREE.CylinderGeometry(8, 10, 30, 32, 1, true);
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x111827, 
      side: THREE.DoubleSide, 
      roughness: 1, 
      metalness: 0,
      wireframe: true // 科技感网格
    });
    const tunnel = new THREE.Mesh(wallGeo, wallMat);
    tunnelGroup.add(tunnel);

    // --- 传感器节点 ---
    const nodeMeshes: THREE.Mesh[] = [];
    const colors = { gas: 0x10b981, stress: 0x0ea5e9, dust: 0xf59e0b, seismic: 0xef4444, uwb: 0x8b5cf6 };

    sensors.forEach((s) => {
      const color = colors[s.type];
      const isActive = activeSensorId === s.id;
      
      const geo = new THREE.OctahedronGeometry(isActive ? 0.6 : 0.4, 0);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 2 : 0.4,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...s.position);
      mesh.userData = { id: s.id };
      
      // 增加扩散环
      const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);

      tunnelGroup.add(mesh);
      nodeMeshes.push(mesh);
    });

    // --- 交互射束 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      // 矿道背景律动
      tunnelGroup.position.y = Math.sin(frame * 0.5) * 0.5;
      
      // 节点动画
      nodeMeshes.forEach((m, i) => {
        const isActive = m.userData.id === activeSensorId;
        m.rotation.y += isActive ? 0.05 : 0.01;
        m.scale.setScalar(1 + Math.sin(frame * 3 + i) * 0.1);
        if(m.children[0]) {
           m.children[0].scale.setScalar(1 + Math.sin(frame * 5) * 0.5);
           (m.children[0] as any).material.opacity = 0.3 - (m.children[0].scale.x - 1);
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
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [sensors, activeSensorId, alertLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
