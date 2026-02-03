import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InventoryOptThreeProps } from './three-types';

export const InventoryOptScene: React.FC<InventoryOptThreeProps> = ({ 
  items, 
  activeItemId, 
  onItemSelect,
  optimizationMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 12, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !optimizationMode;

    // --- 中心核心 (理想库存平衡点) ---
    const coreGeo = new THREE.SphereGeometry(1, 32, 32);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x10b981, 
      emissive: 0x10b981, 
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.2,
      wireframe: true 
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // 轨道环
    [4, 7, 10].forEach((radius, i) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.01, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // --- 备件节点 ---
    const nodeMeshes: THREE.Mesh[] = [];
    const colors = { A: 0xf59e0b, B: 0x0ea5e9, C: 0x64748b };

    items.forEach((item) => {
      const color = colors[item.category];
      const isActive = activeItemId === item.id;
      
      const size = 0.2 + (item.value / 100000) * 0.3;
      const geo = new THREE.IcosahedronGeometry(size, 0);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 1.5 : 0.3,
        transparent: true,
        opacity: 0.8
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...item.position);
      mesh.userData = { id: item.id };
      scene.add(mesh);
      nodeMeshes.push(mesh);

      // 连接线（到中心平衡点）
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...item.position)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: item.stockHealth > 0.8 ? 0.05 : 0.3 
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 10, 5);
    scene.add(point);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) onItemSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      core.rotation.y += 0.005;
      nodeMeshes.forEach((m, idx) => {
        const item = items[idx];
        // 模拟库存波动
        m.position.y += Math.sin(time + idx) * 0.002;
        if (item.id === activeItemId) {
          m.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
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
  }, [items, activeItemId, optimizationMode]);

  return <div ref={mountRef} className="w-full h-full" />;
};