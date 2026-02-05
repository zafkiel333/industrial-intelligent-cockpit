
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EngineNexusProps, EngineDataNode } from './three-types';

export const ShipEngineThreeScene: React.FC<EngineNexusProps> = ({ activeNodeId, onNodeSelect, rotationSpeed = 1 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: EngineDataNode[] = [
    { id: 'me-01', name: '2冲程主机-ME1', type: 'main', loadFactor: 0.85, position: [0, 0, 0], status: 'optimal' },
    { id: 'ae-01', name: '1号副发电机', type: 'auxiliary', loadFactor: 0.62, position: [8, 4, -4], status: 'optimal' },
    { id: 'ae-02', name: '2号副发电机', type: 'auxiliary', loadFactor: 0.45, position: [8, -4, -4], status: 'warning' },
    { id: 'ctrl-01', name: '集中控制总线', type: 'control', loadFactor: 1.0, position: [-8, 0, 4], status: 'optimal' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

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

    // 环境光与装饰
    const ambientLight = new THREE.AmbientLight(0x0ea5e9, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 20, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 科技感底座网格
    const grid = new THREE.GridHelper(50, 25, 0x1e293b, 0x020617);
    grid.position.y = -5;
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    // 核心中央处理器抽象
    const coreGeo = new THREE.IcosahedronGeometry(3, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(node => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...node.position);

      // 数据立方体
      const color = node.status === 'warning' ? 0xf59e0b : 0x22d3ee;
      const geo = new THREE.BoxGeometry(2, 2, 2);
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: node.id === activeNodeId ? 1 : 0.2,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id };
      nodeGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 围绕节点的扫描环
      const ringGeo = new THREE.RingGeometry(1.8, 2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      nodeGroup.add(ring);

      // 连向中心的逻辑链路
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      group.add(nodeGroup);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      core.rotation.y += 0.005 * rotationSpeed;
      nodeMeshes.forEach((m, i) => {
        m.rotation.y += 0.01;
        m.position.y = Math.sin(time + i) * 0.2;
        // 缩放呼吸
        if (m.userData.id === activeNodeId) {
            m.scale.setScalar(1.2);
        } else {
            m.scale.setScalar(1);
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
  }, [activeNodeId, rotationSpeed, onNodeSelect]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};
