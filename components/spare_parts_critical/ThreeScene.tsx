import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CriticalThreeProps } from './three-types';

export const CriticalThreeScene: React.FC<CriticalThreeProps> = ({ 
  parts, 
  selectedId, 
  onSelect,
  isRotating 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 12, 15);

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
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.5;

    // --- 场景构建 ---
    const group = new THREE.Group();
    scene.add(group);

    // 绘制同心环（关键度层级）
    const rings = [3, 6, 9];
    rings.forEach((r, i) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    const nodeMeshes: THREE.Mesh[] = [];
    const colors = { critical: 0xef4444, high: 0xf59e0b, medium: 0x0ea5e9, low: 0x64748b };

    parts.forEach((part) => {
      const color = colors[part.riskLevel];
      const isActive = selectedId === part.id;
      
      const size = 0.3 + (part.score / 100) * 0.5;
      const geo = new THREE.IcosahedronGeometry(size, 1);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isActive ? 1.5 : 0.3,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...part.position);
      mesh.userData = { id: part.id };
      group.add(mesh);
      nodeMeshes.push(mesh);

      // 连接线
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...part.position)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.1 });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    });

    // 中心核心
    const coreGeo = new THREE.SphereGeometry(1, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x0ea5e9, emissiveIntensity: 0.5, wireframe: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 10, 50);
    point.position.set(5, 10, 5);
    scene.add(point);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) onSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      core.rotation.y += 0.01;
      group.children.forEach((obj, idx) => {
        if (obj instanceof THREE.Mesh && obj.userData.id) {
           obj.position.y += Math.sin(time + idx) * 0.005;
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [parts, selectedId, isRotating]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};