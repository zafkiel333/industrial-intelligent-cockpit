import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ExplodedThreeProps } from './three-types';

export const ExplodedThreeScene: React.FC<ExplodedThreeProps> = ({ 
  explodeFactor, 
  highlightedPartId, 
  displayMode,
  onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 6, 10);

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

    // 灯光设置
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x0ea5e9, 3);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 构建工业组件模型（模拟多层结构）
    const group = new THREE.Group();
    scene.add(group);

    const partData = [
      { id: 'p01', name: '底部基座 (Base)', color: 0x334155, geometry: new THREE.CylinderGeometry(2, 2.2, 0.8, 32), offset: [0, 0, 0] },
      { id: 'p02', name: '泵体外壳 (Housing)', color: 0x475569, geometry: new THREE.CylinderGeometry(1.8, 2, 3, 32, 1, true), offset: [0, 2, 0] },
      { id: 'p03', name: '定子绕组 (Stator)', color: 0x0ea5e9, geometry: new THREE.TorusGeometry(1.4, 0.3, 16, 100), offset: [0, 2, 0] },
      { id: 'p04', name: '核心转子 (Rotor)', color: 0xf59e0b, geometry: new THREE.CylinderGeometry(0.8, 0.8, 4, 32), offset: [0, 2, 0] },
      { id: 'p05', name: '上端盖 (Top Cap)', color: 0x94a3b8, geometry: new THREE.CylinderGeometry(2, 1.8, 0.4, 32), offset: [0, 4, 0] },
      { id: 'p06', name: '密封轴承 (Bearing)', color: 0x10b981, geometry: new THREE.TorusGeometry(0.9, 0.1, 8, 50), offset: [0, 4.5, 0] },
    ];

    const meshes: THREE.Mesh[] = [];

    partData.forEach((data) => {
      const mat = new THREE.MeshPhongMaterial({ 
        color: data.color,
        transparent: true,
        opacity: displayMode === 'xray' ? 0.3 : 0.9,
        wireframe: displayMode === 'wireframe',
        shininess: 100
      });
      const mesh = new THREE.Mesh(data.geometry, mat);
      mesh.userData = { id: data.id, name: data.name, baseOffset: data.offset };
      
      const partGroup = new THREE.Group();
      partGroup.add(mesh);
      group.add(partGroup);
      partsRef.current.push(partGroup);
      meshes.push(mesh);
    });

    // 交互检测
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        onPartSelect?.(obj.userData.id, obj.userData.name);
      }
    };
    mountRef.current.addEventListener('click', onMouseClick);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 更新爆炸效果
      partsRef.current.forEach((pg) => {
        const mesh = pg.children[0] as THREE.Mesh;
        const base = mesh.userData.baseOffset as number[];
        // 沿 Y 轴按比例拉开，并加入一定的径向位移
        pg.position.y = base[1] * (1 + explodeFactor * 1.5);
        
        // 高亮处理
        if (mesh.userData.id === highlightedPartId) {
          (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x0ea5e9);
          (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5;
        } else {
          (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
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
      mountRef.current?.removeEventListener('click', onMouseClick);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [displayMode, highlightedPartId]); // 依赖变化时重新初始化或更新

  // 单独监听 explodeFactor 变化以优化性能，不需要重启整个Effect
  useEffect(() => {
    // 逻辑已在 animate 中处理，此处仅作为触发标记
  }, [explodeFactor]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
