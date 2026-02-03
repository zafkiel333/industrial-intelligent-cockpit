
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmergencyRepairProps, IncidentNode } from './three-types';

export const EmergencyRepairThreeScene: React.FC<EmergencyRepairProps> = ({ activeIncidentId, onIncidentSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const incidents: IncidentNode[] = [
    { id: 'F-001', name: '采煤机摇臂电机', status: 'critical', position: [-6, 3, 0], ticketCount: 3 },
    { id: 'F-002', name: '2号输送带驱动器', status: 'repairing', position: [0, 0, 0], ticketCount: 1 },
    { id: 'F-003', name: '提升机主制动站', status: 'resolved', position: [6, -2, 0], ticketCount: 5 },
    { id: 'F-004', name: '液压支架主控阀', status: 'critical', position: [-2, -4, 4], ticketCount: 2 }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 10, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 环境光与装饰
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.5);
    scene.add(ambientLight);
    
    // 创建故障数据拓扑图
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeMeshes: THREE.Mesh[] = [];

    incidents.forEach(inc => {
      // 数据核心
      const geo = new THREE.OctahedronGeometry(1.2, 0);
      const color = inc.status === 'critical' ? 0xef4444 : inc.status === 'repairing' ? 0xf97316 : 0x10b981;
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...inc.position);
      mesh.userData = { id: inc.id };
      nodeGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 故障力场
      const fieldGeo = new THREE.SphereGeometry(2, 32, 32);
      const fieldMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.05,
        wireframe: true
      });
      const field = new THREE.Mesh(fieldGeo, fieldMat);
      field.position.set(...inc.position);
      nodeGroup.add(field);

      // 数据标签（抽象为小立方体）
      for (let i = 0; i < inc.ticketCount; i++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        box.position.set(
          inc.position[0] + Math.cos(i * 2) * 1.5,
          inc.position[1] + Math.sin(i * 2) * 1.5,
          inc.position[2]
        );
        nodeGroup.add(box);
      }
    });

    // 绘制任务关联线
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
    const points = nodeMeshes.map(m => m.position);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lines = new THREE.Line(lineGeo, lineMat);
    scene.add(lines);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Fix: Cast event to any to ensure clientX/clientY are accessible and avoid type inference issues
    const handleClick = (e: any) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onIncidentSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      nodeGroup.children.forEach((child, i) => {
        if (child.type === 'Mesh') {
          child.rotation.y += 0.01;
          child.rotation.x += 0.005;
          // 脉冲呼吸效果
          if ((child.geometry as any).type === 'OctahedronGeometry') {
             const scale = 1 + Math.sin(time * 4 + i) * 0.1;
             child.scale.set(scale, scale, scale);
          }
        }
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
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onIncidentSelect]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};
