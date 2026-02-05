
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ForecastThreeProps } from './three-types';

export const ForecastThreeScene: React.FC<ForecastThreeProps> = ({ 
  nodes, 
  activeNodeId, 
  onNodeSelect,
  productionIntensity
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 降低雾化浓度，从0.05减为0.02，避免过度遮挡远端模型
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // 显式设置透明清除色
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 核心基座 ---
    const coreGeo = new THREE.OctahedronGeometry(1.5, 2);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // 旋转环
    const ringGeo = new THREE.TorusGeometry(8, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // --- 备件节点构建 ---
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const meshes: THREE.Mesh[] = [];
    const urgencyColors = {
      critical: 0xef4444,
      high: 0xf59e0b,
      med: 0x0ea5e9,
      low: 0x64748b
    };

    nodes.forEach((node) => {
      const color = urgencyColors[node.urgency];
      const isActive = activeNodeId === node.id;
      
      const geo = new THREE.IcosahedronGeometry(0.3 + (node.probability * 0.4), 0);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 1.5 : 0.4,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      nodeGroup.add(mesh);
      meshes.push(mesh);

      if (node.probability > 0.6) {
        const linePts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.1 });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
      }
    });

    // 增强灯光系统
    const ambient = new THREE.AmbientLight(0xffffff, 0.8); // 增加环境光强度
    scene.add(ambient);
    
    const point = new THREE.PointLight(0x8b5cf6, 8, 60); // 增加点光源强度
    point.position.set(0, 10, 0);
    scene.add(point);
    
    const fillLight = new THREE.PointLight(0x0ea5e9, 5, 50); // 添加补光
    fillLight.position.set(10, -5, 10);
    scene.add(fillLight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) onNodeSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      core.rotation.y += 0.01;
      nodeGroup.children.forEach((obj, idx) => {
        if (obj instanceof THREE.Mesh) {
           const pulse = Math.sin(time * 2 + idx) * (0.01 * productionIntensity);
           obj.position.y += pulse;
           obj.rotation.x += 0.01;
        }
      });

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
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, activeNodeId, productionIntensity]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
