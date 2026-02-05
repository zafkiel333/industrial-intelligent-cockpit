
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ComponentLifeProps, ComponentLifeNode } from './three-types';

export const ComponentLifeThreeScene: React.FC<ComponentLifeProps> = ({ activePartId, onPartSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const components: ComponentLifeNode[] = [
    { id: 'brg-01', name: '主轴轴承', lifePercent: 82, lastReplacement: '2023-11-12', position: [0, 4, 0], status: 'optimal', partNumber: 'TIM-X8801' },
    { id: 'gear-02', name: '行星减速齿轮', lifePercent: 45, lastReplacement: '2023-05-20', position: [6, 0, -4], status: 'wearing', partNumber: 'GB-K402-Z' },
    { id: 'hyd-03', name: '提升缸密封件', lifePercent: 12, lastReplacement: '2022-08-15', position: [-6, 0, -4], status: 'critical', partNumber: 'HY-S-991' },
    { id: 'cab-04', name: '高压主电缆', lifePercent: 68, lastReplacement: '2023-01-10', position: [0, -4, 2], status: 'optimal', partNumber: 'CBL-UHV-01' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

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

    // 科技感环境
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x22d3ee, 40);
    spotLight.position.set(5, 15, 5);
    scene.add(spotLight);

    // 背景网格装饰
    const grid = new THREE.GridHelper(40, 20, 0x334155, 0x0f172a);
    grid.position.y = -5;
    scene.add(grid);

    const partMeshes: THREE.Mesh[] = [];
    const group = new THREE.Group();
    scene.add(group);

    components.forEach(p => {
      const pGroup = new THREE.Group();
      pGroup.position.set(...p.position);

      // 部件几何体抽象 (采用高科技晶体风格)
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const color = p.status === 'critical' ? 0xef4444 : p.status === 'wearing' ? 0xf59e0b : 0x10b981;
      const material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { id: p.id };
      pGroup.add(mesh);
      partMeshes.push(mesh);

      // 核心发光体
      const coreGeo = new THREE.IcosahedronGeometry(0.5, 0);
      const coreMat = new THREE.MeshBasicMaterial({ color });
      const core = new THREE.Mesh(coreGeo, coreMat);
      pGroup.add(core);

      // 寿命进度环
      const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 100, (p.lifePercent / 100) * Math.PI * 2);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      pGroup.add(ring);

      group.add(pGroup);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: any) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(partMeshes);
      if (intersects.length > 0) {
        onPartSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      group.children.forEach((child: any, i) => {
        const mesh = child.children[0];
        const core = child.children[1];
        mesh.rotation.y += 0.01;
        mesh.rotation.x += 0.005;
        core.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.2);
        
        // 呼吸效果：如果是 active 节点，光晕更强
        if (mesh.userData.id === activePartId) {
            mesh.scale.setScalar(1.2);
            mesh.material.opacity = 0.6;
        } else {
            mesh.scale.setScalar(1);
            mesh.material.opacity = 0.3;
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
  }, [activePartId, onPartSelect]);

  return <div ref={mountRef} className="w-full h-full relative" />;
};
