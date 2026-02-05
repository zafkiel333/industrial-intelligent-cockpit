
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DowntimeThreeProps } from './three-types';

export const DowntimeThreeScene: React.FC<DowntimeThreeProps> = ({ 
  nodes, 
  activeCategoryId, 
  onNodeSelect,
  isCalculating
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

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
    controls.autoRotate = !isCalculating;

    // --- 环境构建 ---
    // 底部动态能量网格
    const grid = new THREE.GridHelper(30, 20, 0xa855f7, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // --- 节点模型构建 ---
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const categoryColors: Record<string, number> = {
      mechanical: 0xf59e0b, // 熔岩金
      electrical: 0x8b5cf6, // 电子紫
      operational: 0x10b981, // 极光绿
      external: 0xef4444    // 预警红
    };

    const meshes: THREE.Mesh[] = [];
    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    nodes.forEach((node) => {
      const color = categoryColors[node.category];
      const isActive = activeCategoryId === node.category;
      
      // 几何体：停机时间越长，尺寸越大且越“尖锐”
      const size = 0.2 + (node.duration / 120);
      const geo = node.category === 'mechanical' 
        ? new THREE.OctahedronGeometry(size) 
        : new THREE.IcosahedronGeometry(size, 0);
      
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 1.5 : 0.4,
        transparent: true,
        opacity: isActive ? 1.0 : 0.6,
        shininess: 100
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id, category: node.category };
      nodeGroup.add(mesh);
      meshes.push(mesh);

      // 增加光柱效果
      if (node.duration > 60) {
        const beamGeo = new THREE.CylinderGeometry(0.01, 0.2, 10, 32);
        const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.1 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.copy(mesh.position);
        beam.position.y += 5;
        nodeGroup.add(beam);
      }
    });

    // 绘制逻辑关联线 (模拟编码间的关联)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.15 });
    for(let i=0; i<meshes.length; i++) {
        for(let j=i+1; j<meshes.length; j++) {
            if(Math.random() > 0.85) {
                const lineGeo = new THREE.BufferGeometry().setFromPoints([
                    meshes[i].position,
                    meshes[j].position
                ]);
                const line = new THREE.Line(lineGeo, lineMat);
                linesGroup.add(line);
            }
        }
    }

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0xa855f7, 5, 50);
    point.position.set(0, 10, 0);
    scene.add(point);

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
      
      if (isCalculating) {
        nodeGroup.rotation.y += 0.04;
        grid.material.opacity = 0.5 + Math.sin(time * 5) * 0.2;
      }
      
      nodeGroup.children.forEach((obj, idx) => {
        if (obj instanceof THREE.Mesh) {
           obj.position.y += Math.sin(time + idx) * 0.005;
           obj.rotation.x += 0.01;
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
  }, [nodes, activeCategoryId, isCalculating]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
