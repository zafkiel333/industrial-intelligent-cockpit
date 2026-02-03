
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Fix: ProcurementPulseProps does not exist, using ProcurementThreeProps which is exported from three-types.ts
import { ProcurementThreeProps } from './three-types';

export const ProcurementPulseScene: React.FC<ProcurementThreeProps> = ({ 
  nodes, 
  routes, 
  activeOrderId,
  onNodeClick,
  isSimulating
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 工业光影：冷色调实验室 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    const topSpot = new THREE.SpotLight(0xffffff, 150, 60, Math.PI / 6, 0.5, 2);
    topSpot.position.set(5, 20, 5);
    topSpot.castShadow = true;
    scene.add(topSpot);

    const bluePoint = new THREE.PointLight(0x6366f1, 20, 40);
    bluePoint.position.set(-10, 5, 5);
    scene.add(bluePoint);

    const magentaPoint = new THREE.PointLight(0xec4899, 10, 30);
    magentaPoint.position.set(10, -5, -5);
    scene.add(magentaPoint);

    // --- 场景底座：战术圆盘 ---
    const baseGeo = new THREE.CylinderGeometry(12, 12.5, 0.5, 6);
    const baseMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.8,
      wireframe: true 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2;
    scene.add(base);

    // 绘制全球经纬线感
    const globeGeo = new THREE.SphereGeometry(7, 32, 32);
    const globeMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // --- 节点与路径 ---
    const nodeMeshes: THREE.Mesh[] = [];
    const nodePosMap = new Map<string, THREE.Vector3>();

    // 节点颜色映射
    const colors = { supplier: 0x6366f1, port: 0x10b981, warehouse: 0xeab308 };

    nodes.forEach(node => {
      const pos = new THREE.Vector3(...node.position);
      nodePosMap.set(node.id, pos);

      const geo = node.type === 'supplier' ? new THREE.BoxGeometry(0.6, 0.6, 0.6) : new THREE.SphereGeometry(0.3, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ 
        color: colors[node.type] || 0xffffff, 
        emissive: colors[node.type] || 0xffffff, 
        emissiveIntensity: 0.5 
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      scene.add(mesh);
      nodeMeshes.push(mesh);

      // 增加全息光环
      const ringGeo = new THREE.TorusGeometry(0.6, 0.02, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: colors[node.type] || 0xffffff, transparent: true, opacity: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(...node.position);
      ring.lookAt(0,0,0);
      scene.add(ring);
    });

    // 动态路径粒子
    const particleCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) pPos[i] = 0;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.1, color: 0x0ea5e9, transparent: true, opacity: 0.8 });
    const flowPoints = new THREE.Points(pGeo, pMat);
    scene.add(flowPoints);

    // Fix: Used nodePosMap to correctly translate between Node IDs and 3D positions in QuadraticBezierCurve3
    const routesData = routes.map(r => {
      const start = nodePosMap.get(r.from) || new THREE.Vector3(0, 0, 0);
      const end = nodePosMap.get(r.to) || new THREE.Vector3(0, 0, 0);
      return {
        ...r,
        curve: new THREE.QuadraticBezierCurve3(
          start,
          start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 10, 0)), // 控制点
          end
        ),
        t: Math.random()
      };
    });

    // --- 交互射束 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) onNodeClick(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // 更新粒子位置
      const positions = flowPoints.geometry.attributes.position.array as Float32Array;
      routesData.forEach((r, i) => {
        const index = i % (particleCount / routesData.length);
        r.t = (r.t + 0.005) % 1;
        const pos = r.curve.getPointAt(r.t);
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      });
      flowPoints.geometry.attributes.position.needsUpdate = true;

      // 节点动画
      nodeMeshes.forEach(m => {
        m.rotation.y += 0.02;
        if(activeOrderId?.includes(m.userData.id)) {
           m.scale.setScalar(1.5 + Math.sin(time * 5) * 0.2);
        } else {
           m.scale.setScalar(1);
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
  }, [nodes, routes, activeOrderId, onNodeClick, isSimulating]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
