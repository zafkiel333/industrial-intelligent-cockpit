
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningSystemProps, SystemNode } from './three-types';

export const MiningSystemThreeScene: React.FC<MiningSystemProps> = ({ activeSystem, onSystemSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const systems: SystemNode[] = [
    { id: 'crushing', position: [-8, 0, 0], color: '#f59e0b', label: '破碎系统', dataCount: '450k+' },
    { id: 'conveying', position: [0, 0, 0], color: '#10b981', label: '输送系统', dataCount: '1.2M+' },
    { id: 'hoisting', position: [8, 0, 0], color: '#8b5cf6', label: '提升系统', dataCount: '890k+' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 氛围灯光
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 15, 60);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // 科技感地面网格
    const grid = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    const meshes: THREE.Mesh[] = [];
    systems.forEach(sys => {
      // 数字化能量底座
      const baseGeo = new THREE.CylinderGeometry(2.5, 3, 0.5, 32);
      const baseMat = new THREE.MeshPhongMaterial({
        color: sys.id === activeSystem ? sys.color : 0x1e293b,
        transparent: true,
        opacity: 0.6,
        emissive: sys.color,
        emissiveIntensity: sys.id === activeSystem ? 1 : 0.2
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(...sys.position);
      base.userData = { id: sys.id };
      group.add(base);
      meshes.push(base);

      // 悬浮数据多面体
      const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
      const coreMat = new THREE.MeshBasicMaterial({ color: sys.color, wireframe: true });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(sys.position[0], 3, sys.position[2]);
      group.add(core);

      // 内嵌发光体
      const innerGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const innerMat = new THREE.MeshBasicMaterial({ color: sys.color });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(sys.position[0], 3, sys.position[2]);
      group.add(inner);

      // 系统间的物流/数据流向线
      if (sys.id !== 'hoisting') {
        const lineGeo = new THREE.BoxGeometry(5, 0.05, 0.05);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(sys.position[0] + 4, 0.25, 0);
        group.add(line);
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onSystemSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      group.children.forEach((child, i) => {
        if (child.type === 'Mesh') {
          if ((child.geometry as any).type === 'OctahedronGeometry') {
            child.rotation.y += 0.01;
            child.rotation.z += 0.005;
            child.position.y = 3 + Math.sin(Date.now() * 0.002 + i) * 0.3;
          }
          if ((child.geometry as any).type === 'SphereGeometry') {
            child.position.y = 3 + Math.sin(Date.now() * 0.002 + i) * 0.3;
            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
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
  }, [activeSystem]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};
