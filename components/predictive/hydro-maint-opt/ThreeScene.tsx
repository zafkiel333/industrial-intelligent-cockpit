
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MaintOptSceneProps } from './three-types';

export const MaintenanceOptScene: React.FC<MaintOptSceneProps> = ({ 
  tasks, 
  optimizationFactor, 
  selectedTaskId, 
  onTaskClick,
  showLogicFlow
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const taskGroupsRef = useRef<THREE.Group[]>([]);
  const flowLinesRef = useRef<THREE.Line[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0x3b82f6, 2, 50);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // 核心机组背景 (半透明抽象)
    const machineGroup = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({ 
        color: 0x1e293b, 
        transparent: true, 
        opacity: 0.1, 
        wireframe: true 
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 12, 32), mat);
    machineGroup.add(body);
    scene.add(machineGroup);

    // 任务节点生成
    taskGroupsRef.current = [];
    tasks.forEach((task, i) => {
        const group = new THREE.Group();
        group.position.set(...task.position);
        group.userData = { id: task.id };

        // 核心球体
        const color = task.status === 'optimized' ? 0x10b981 : 
                     task.status === 'skipped' ? 0x475569 : 0xf59e0b;
        
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshStandardMaterial({ 
                color, 
                emissive: color, 
                emissiveIntensity: task.urgency 
            })
        );
        group.add(sphere);

        // 扫描环
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.02, 8, 32),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
        );
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        scene.add(group);
        taskGroupsRef.current.push(group);
    });

    // 逻辑流连线
    flowLinesRef.current = [];
    if (showLogicFlow) {
        for (let i = 0; i < tasks.length - 1; i++) {
            const start = tasks[i].position;
            const end = tasks[i+1].position;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(...start),
                new THREE.Vector3(...end)
            ]);
            const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
            const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 }));
            scene.add(line);
            flowLinesRef.current.push(line);
        }
    }

    // --- 交互 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(taskGroupsRef.current, true);
        if (hits.length > 0) {
            let target: any = hits[0].object;
            while(target.parent && !target.userData.id) target = target.parent;
            onTaskClick(target.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- 动画 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      taskGroupsRef.current.forEach((group, i) => {
          const task = tasks[i];
          const isSelected = selectedTaskId === task.id;
          
          // 悬浮动画
          group.position.y = task.position[1] + Math.sin(time * 2 + i) * 0.2;
          
          // 选中高亮
          const ring = group.children[1] as THREE.Mesh;
          if (isSelected) {
              ring.scale.setScalar(1.5 + Math.sin(time * 10) * 0.2);
              ring.material.opacity = 0.8;
          } else {
              ring.scale.setScalar(1);
              ring.material.opacity = 0.3;
          }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [tasks, selectedTaskId, showLogicFlow]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
