import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DispatchThreeProps } from './three-types';

export const DispatchThreeScene: React.FC<DispatchThreeProps> = ({ 
  activeMachineId, 
  onMachineClick,
  workloadHeat = 0.5 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeMachineIdRef = useRef(activeMachineId);
  const onMachineClickRef = useRef(onMachineClick);

  useEffect(() => {
    activeMachineIdRef.current = activeMachineId;
  }, [activeMachineId]);

  useEffect(() => {
    onMachineClickRef.current = onMachineClick;
  }, [onMachineClick]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const initialWidth = Math.max(mount.clientWidth, 1);
    const initialHeight = Math.max(mount.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, initialWidth / initialHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mount.querySelector('canvas');
    if (existingCanvas) {
      mount.removeChild(existingCanvas);
    }
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Grid Floor
    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // Factory Components Group
    const machinesGroup = new THREE.Group();
    scene.add(machinesGroup);

    const machineData = [
      { id: 'M-101', pos: [-5, 0, -5], status: 'fault' },
      { id: 'M-102', pos: [-2, 0, -5], status: 'normal' },
      { id: 'M-103', pos: [1, 0, -5], status: 'normal' },
      { id: 'M-201', pos: [-5, 0, 0], status: 'normal' },
      { id: 'M-202', pos: [-2, 0, 0], status: 'warning' },
      { id: 'M-203', pos: [1, 0, 0], status: 'normal' },
      { id: 'M-301', pos: [-5, 0, 5], status: 'normal' },
      { id: 'M-302', pos: [-2, 0, 5], status: 'normal' },
      { id: 'M-303', pos: [1, 0, 5], status: 'fault' },
    ];

    const machineMeshes: THREE.Mesh[] = [];

    machineData.forEach(m => {
      const geo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
      const color = m.status === 'fault' ? 0xef4444 : (m.status === 'warning' ? 0xf59e0b : 0x0ea5e9);
      const mat = new THREE.MeshPhongMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(m.pos[0], 0.4, m.pos[2]);
      mesh.userData = { id: m.id, status: m.status };
      machinesGroup.add(mesh);
      machineMeshes.push(mesh);

      // Status Pillar (Above machine)
      if (m.status !== 'normal') {
          const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 3);
          const pillarMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(m.pos[0], 1.5, m.pos[2]);
          machinesGroup.add(pillar);
      }
    });

    // Central HUB
    const hubGeo = new THREE.SphereGeometry(1, 32, 32);
    const hubMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(6, 0.5, 0);
    scene.add(hub);

    // Dynamic Connections (Scan Lines)
    const connections: THREE.Line[] = [];
    const lineMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    machineData.forEach(m => {
        if(m.status === 'fault') {
            const points = [
                new THREE.Vector3(m.pos[0], 0.4, m.pos[2]),
                new THREE.Vector3(6, 0.4, 0)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            connections.push(line);
        }
    });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x8b5cf6, 2, 20);
    point.position.set(6, 5, 0);
    scene.add(point);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(machineMeshes);
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        onMachineClickRef.current?.(id);
      }
    };
    mount.addEventListener('click', handleClick);

    let frame = 0;
    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frame += 0.02;

      // Animate active machine
      machineMeshes.forEach(m => {
          if (m.userData.id === activeMachineIdRef.current) {
              m.scale.setScalar(1 + Math.sin(frame * 4) * 0.1);
              (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 1;
          } else {
              m.scale.setScalar(1);
              (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.2;
          }

          if (m.userData.status === 'fault') {
              m.position.y = 0.4 + Math.sin(frame * 2) * 0.05;
          }
      });

      // Hub Pulse
      hub.scale.setScalar(1 + Math.sin(frame) * 0.2);
      hub.rotation.y += 0.01;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width < 2 || height < 2) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    // 2026-08-21：主平台侧边栏和内标签页会直接改变微应用容器尺寸，并不触发 window.resize。
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      mount.removeEventListener('click', handleClick);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse(object => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
