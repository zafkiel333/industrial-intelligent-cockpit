
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShippingEmergencyThreeProps } from './three-types';

export const ShippingTacticalScene: React.FC<ShippingEmergencyThreeProps> = ({ 
  nodes, 
  routes, 
  activeShipId, 
  onNodeSelect,
  seaState
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 背景稍微提亮，增加透明感
    scene.background = null; 
    scene.fog = new THREE.FogExp2(0x02040a, 0.01);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 强力光照方案 ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.8)); // 基础提亮
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 50, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 20, 100);
    blueLight.position.set(-20, 20, 20);
    scene.add(blueLight);

    // --- 数字化地球模型 ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeGeo = new THREE.SphereGeometry(15, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // 核心光球
    const innerGeo = new THREE.SphereGeometry(14.8, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.8 });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // --- 节点绘制 ---
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeMap = new Map<string, THREE.Vector3>();

    nodes.forEach(node => {
      const pos = new THREE.Vector3(...node.position);
      nodeMap.set(node.id, pos);
      
      const isSelected = node.id === activeShipId;
      const color = node.type === 'ship' ? 0xf97316 : (node.type === 'hub' ? 0x0ea5e9 : 0x10b981);
      const geo = node.type === 'ship' ? new THREE.BoxGeometry(1.2, 0.6, 2.2) : new THREE.SphereGeometry(0.6, 16, 16);
      
      const mat = new THREE.MeshStandardMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: isSelected ? 3 : 0.8,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.lookAt(0, 0, 0); 
      mesh.userData = { id: node.id };
      globeGroup.add(mesh);
      nodeMeshes.push(mesh);

      // 动态呼吸环
      const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0,0,0);
      globeGroup.add(ring);
      (ring as any).userData = { isRipple: true, scaleLimit: isSelected ? 2.5 : 1.8 };
    });

    // --- 航线绘制 ---
    routes.forEach(route => {
      const start = nodeMap.get(route.from);
      const end = nodeMap.get(route.to);
      if (start && end) {
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(18);
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(50);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
          color: route.type === 'air' ? 0x10b981 : 0x0ea5e9, 
          transparent: true, 
          opacity: 0.6 
        });
        scene.add(new THREE.Line(lineGeo, lineMat));
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length > 0) onNodeSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      globeGroup.traverse(obj => {
          if ((obj as any).userData?.isRipple) {
              const limit = (obj as any).userData.scaleLimit;
              obj.scale.setScalar(1 + (frame * 2 % limit));
              (obj as THREE.Mesh).material.opacity = 0.5 * (1 - (obj.scale.x / limit));
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
          if (mountRef.current.contains(renderer.domElement)) {
              mountRef.current.removeChild(renderer.domElement);
          }
      }
      renderer.dispose();
    };
  }, [nodes, routes, activeShipId]);

  return <div ref={mountRef} className="w-full h-full min-h-[400px] cursor-crosshair" />;
};
