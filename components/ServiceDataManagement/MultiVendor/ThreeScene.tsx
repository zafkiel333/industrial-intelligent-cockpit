
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MultiVendorProps, VendorNode } from './three-types';

export const MultiVendorThreeScene: React.FC<MultiVendorProps> = ({ activeVendorId, onVendorSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const vendors: VendorNode[] = [
    { id: 'v-komatsu', name: '小松(Komatsu)', protocol: 'OPC-UA', dataIntegrity: 98, color: '#fbce07', position: [-8, 2, -5], status: 'connected' },
    { id: 'v-cat', name: '卡特彼勒(CAT)', protocol: 'MQTT', dataIntegrity: 94, color: '#ffcd11', position: [8, 3, -2], status: 'syncing' },
    { id: 'v-joy', name: '久益(Joy)', protocol: 'Modbus', dataIntegrity: 82, color: '#ef4444', position: [5, -4, 6], status: 'connected' },
    { id: 'v-sany', name: '三一重装', protocol: 'RestAPI', dataIntegrity: 99, color: '#f97316', position: [-6, -3, 4], status: 'connected' }
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
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 中央“统一数据模型”核心
    const centralCore = new THREE.Group();
    scene.add(centralCore);

    const coreGeo = new THREE.OctahedronGeometry(3, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    centralCore.add(coreMesh);

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
    );
    centralCore.add(innerCore);

    // 旋转数据环
    const ringGeo = new THREE.TorusGeometry(10, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // 厂家节点
    const nodeMeshes: THREE.Mesh[] = [];
    vendors.forEach(v => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...v.position);

      const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const mat = new THREE.MeshPhongMaterial({
        color: v.id === activeVendorId ? 0xffffff : v.color,
        emissive: v.color,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: v.id };
      nodeGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 数据流向线
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...v.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: v.color, transparent: true, opacity: 0.2 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      // 流光粒子
      const dotGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: v.color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.userData = { start: new THREE.Vector3(...v.position), progress: Math.random() };
      scene.add(dot);

      scene.add(nodeGroup);
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
        onVendorSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.z += 0.002;
      
      scene.children.forEach(child => {
        if (child.userData && child.userData.start) {
          child.userData.progress += 0.005;
          if (child.userData.progress > 1) child.userData.progress = 0;
          child.position.lerpVectors(child.userData.start, new THREE.Vector3(0, 0, 0), child.userData.progress);
        }
      });

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
  }, [activeVendorId, onVendorSelect]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};
