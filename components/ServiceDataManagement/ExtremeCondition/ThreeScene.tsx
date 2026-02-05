
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SafetyAegisProps, RiskVectorNode } from './three-types';

export const ExtremeConditionThreeScene: React.FC<SafetyAegisProps> = ({ activeNodeId, onNodeSelect, globalStressIndex }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const riskNodes: RiskVectorNode[] = [
    { id: 'env-1', name: '深部采区高地温带', stressType: 'thermal', intensity: 82, position: [8, 5, -5], status: 'breached' },
    { id: 'env-2', name: '高瓦斯突涌风险区', stressType: 'chemical', intensity: 45, position: [-8, -3, 6], status: 'monitoring' },
    { id: 'env-3', name: '冲击地压应力集中区', stressType: 'pressure', intensity: 91, position: [0, 8, 4], status: 'breached' },
    { id: 'env-4', name: '大流量异常渗水点', stressType: 'chemical', intensity: 12, position: [-6, 6, -8], status: 'monitoring' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 20, 30);

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

    // 灯光逻辑
    const ambientLight = new THREE.AmbientLight(0x451a03, 2);
    scene.add(ambientLight);
    const topLight = new THREE.DirectionalLight(0xf43f5e, 3);
    topLight.position.set(10, 20, 10);
    scene.add(topLight);

    // 中央防御核心 (Safety Core)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 内层核心：稳态数据核
    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3, 1),
      new THREE.MeshPhongMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.4 })
    );
    coreGroup.add(innerCore);

    // 外层盾牌：动态防御层
    const outerAegis = new THREE.Mesh(
      new THREE.SphereGeometry(6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, wireframe: true, transparent: true, opacity: 0.05 })
    );
    coreGroup.add(outerAegis);

    // 风险探测节点
    const nodeMeshes: THREE.Mesh[] = [];
    riskNodes.forEach(node => {
      const pGroup = new THREE.Group();
      pGroup.position.set(...node.position);

      const color = node.status === 'breached' ? 0xf43f5e : 0xf59e0b;
      const geo = new THREE.OctahedronGeometry(1, 0);
      const mat = new THREE.MeshPhongMaterial({
        color: node.id === activeNodeId ? 0xffffff : color,
        emissive: color,
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id };
      pGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 压力扩散环
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.02, 16, 100),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 })
      );
      ring.rotation.x = Math.PI / 2;
      pGroup.add(ring);

      scene.add(pGroup);

      // 数据链路光束
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.15 });
      const line = new THREE.Line(lineGeo, lineMat);
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

      coreGroup.rotation.y += 0.005;
      innerCore.scale.setScalar(1 + Math.sin(time) * 0.05);
      outerAegis.rotation.z -= 0.002;

      nodeMeshes.forEach((m, i) => {
        m.rotation.y += 0.01;
        m.position.y = Math.sin(time * 2 + i) * 0.5;
        // 环形扩散动画
        m.parent!.children[1].scale.setScalar(1 + (time % 2));
        (m.parent!.children[1].material as any).opacity = 1 - (time % 2) / 2;
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
