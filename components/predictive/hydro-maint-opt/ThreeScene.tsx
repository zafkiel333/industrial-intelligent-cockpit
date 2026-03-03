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
    console.log("===hydro-maint-opt useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 调整1：降低雾的密度（从0.04→0.02），减少雾对画面的暗化效果
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 调整2：新增全局曝光度（核心提亮手段），从无→2.0，整体画面显著变亮
    renderer.toneMappingExposure = 2.0;
    
    // 保留原有清空canvas逻辑
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ===================== 核心光线强化调整 =====================
    // 1. 环境光（基础照明）：从0.6→1.2，拉满基础亮度，消除暗部死黑
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // 2. 新增半球光：补充环境光层次感，模拟自然天顶/地面光，强度1.0进一步提亮
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xe0e0e0, 1.0);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // 3. 主点光源：从强度6→10，范围80→120，衰减1.0（光照更均匀）
    const mainLight = new THREE.PointLight(0x3b82f6, 10, 120);
    mainLight.position.set(10, 10, 10);
    mainLight.decay = 1.0; // 减缓光照衰减，远处也能亮
    scene.add(mainLight);

    // 4. 辅助点光源：从强度2→5，范围60→100，补充对角暗区
    const helperLight = new THREE.PointLight(0xffffff, 5, 100);
    helperLight.position.set(-8, 8, -8);
    scene.add(helperLight);

    // 5. 方向光：从强度1.2→2.5，位置上移（5,15,5→10,25,10），照明覆盖更广
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(10, 25, 10);
    dirLight.castShadow = false;
    scene.add(dirLight);

    // 6. 新增填充光：极低强度、超大范围，消除最后暗角
    const fillLight = new THREE.PointLight(0xffffff, 1.5, 150);
    fillLight.position.set(0, 5, 0);
    scene.add(fillLight);
    // ========================================================

    // 核心机组背景 (半透明抽象) —— 完全保留原有材质/色彩
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

    // 任务节点生成 —— 完全保留原有颜色/材质逻辑
    taskGroupsRef.current = [];
    tasks.forEach((task, i) => {
        const group = new THREE.Group();
        group.position.set(...task.position);
        group.userData = { id: task.id };

        // 核心球体（颜色逻辑完全不变）
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

        // 扫描环（完全保留原有逻辑）
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.02, 8, 32),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
        );
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        scene.add(group);
        taskGroupsRef.current.push(group);
    });

    // 逻辑流连线 —— 完全保留原有逻辑
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