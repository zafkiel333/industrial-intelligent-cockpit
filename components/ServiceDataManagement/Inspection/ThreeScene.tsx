
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InspectionProps, InspectionNode } from './three-types';

export const InspectionThreeScene: React.FC<InspectionProps> = ({ activeNodeId, onNodeSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: InspectionNode[] = [
    { id: 'uav-01', name: '无人机 A-12', type: 'drone', status: 'active', position: [-10, 8, -5], dataVolume: '450MB' },
    { id: 'bot-04', name: '轮式机器人 R-04', type: 'robot', status: 'active', position: [5, 2, 8], dataVolume: '1.2GB' },
    { id: 'ar-22', name: 'AR 巡检终端-22', type: 'manual', status: 'anomaly', position: [0, 4, -8], dataVolume: '88MB' },
    { id: 'fixed-09', name: '高清监测节点-09', type: 'sensor', status: 'idle', position: [8, 1, -2], dataVolume: '0B' }
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
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 科技感底座
    const grid = new THREE.GridHelper(40, 20, 0x065f46, 0x020617);
    grid.position.y = -2;
    scene.add(grid);

    // 逻辑节点组
    const nodeMeshes: THREE.Mesh[] = [];
    const group = new THREE.Group();
    scene.add(group);

    nodes.forEach(node => {
      const pGroup = new THREE.Group();
      pGroup.position.set(...node.position);

      // 节点几何体：抽象菱形
      const geo = new THREE.OctahedronGeometry(0.8, 0);
      const color = node.status === 'anomaly' ? 0xef4444 : node.status === 'active' ? 0x10b981 : 0x4b5563;
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id };
      pGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 下方的发光环
      const ringGeo = new THREE.RingGeometry(1, 1.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      pGroup.add(ring);

      // 向中心汇聚的虚线
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({ color: 0x334155, dashSize: 0.5, gapSize: 0.2 });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      scene.add(line);

      group.add(pGroup);
    });

    // 中心服务器节点 (Data Hub)
    const hubGeo = new THREE.IcosahedronGeometry(2, 1);
    const hubMat = new THREE.MeshPhongMaterial({ color: 0x059669, wireframe: true, transparent: true, opacity: 0.4 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    scene.add(hub);

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

      hub.rotation.y += 0.005;
      group.children.forEach((child: any, i) => {
        const mesh = child.children[0];
        mesh.rotation.y += 0.02;
        mesh.position.y = Math.sin(time * 2 + i) * 0.5;
        
        // 如果是选中状态，强化光效
        if (mesh.userData.id === activeNodeId) {
            mesh.scale.setScalar(1.5);
            mesh.material.emissiveIntensity = 2;
        } else {
            mesh.scale.setScalar(1);
            mesh.material.emissiveIntensity = 0.5;
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
  }, [activeNodeId, onNodeSelect]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
