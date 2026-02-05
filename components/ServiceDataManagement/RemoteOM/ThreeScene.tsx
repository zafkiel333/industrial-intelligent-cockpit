
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RemoteOMProps, RemoteFleetNode } from './three-types';

export const RemoteOMThreeScene: React.FC<RemoteOMProps> = ({ activeNodeId, onNodeSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const fleetNodes: RemoteFleetNode[] = [
    { id: 'site-a', name: '山西塔山工作面', location: '101面', uplinkSpeed: 850, latency: 15, status: 'active', position: [-8, 2, -5] },
    { id: 'site-b', name: '内蒙准格尔露天矿', location: 'A采区', uplinkSpeed: 920, latency: 12, status: 'active', position: [8, -3, -2] },
    { id: 'site-c', name: '陕西红柳林工作面', location: '202面', uplinkSpeed: 120, latency: 145, status: 'warning', position: [0, 5, 6] },
    { id: 'site-d', name: '新疆黑山矿区', location: '西翼', uplinkSpeed: 740, latency: 18, status: 'standby', position: [-5, -4, 4] }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);

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

    // 中央运维中心 (Cyber Core)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(core);

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1 })
    );
    coreGroup.add(innerCore);

    // 旋转环
    const ringGeo = new THREE.TorusGeometry(5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.2 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    coreGroup.add(ring1);

    // 远程矿区节点
    const nodeMeshes: THREE.Mesh[] = [];
    fleetNodes.forEach(node => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...node.position);

      const color = node.status === 'warning' ? 0xf59e0b : node.status === 'active' ? 0x22d3ee : 0x475569;
      
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshPhongMaterial({
        color: node.id === activeNodeId ? 0xffffff : color,
        emissive: color,
        emissiveIntensity: 0.4,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id };
      nodeGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 节点底部的装饰光圈
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.4, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
      );
      ring.rotation.x = Math.PI / 2;
      nodeGroup.add(ring);

      scene.add(nodeGroup);

      // 数据链路 (虚线)
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({ color: 0x1e293b, dashSize: 0.5, gapSize: 0.2 });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      scene.add(line);
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

      core.rotation.y += 0.005;
      core.rotation.z += 0.002;
      ring1.rotation.y += 0.01;

      nodeMeshes.forEach((m, i) => {
        m.rotation.y += 0.01;
        m.position.y = Math.sin(time + i) * 0.2;
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
  }, [activeNodeId, onNodeSelect]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
