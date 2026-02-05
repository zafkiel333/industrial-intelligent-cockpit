import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutsourcingThreeProps, VendorNode } from './three-types';

export const OutsourcingThreeScene: React.FC<OutsourcingThreeProps> = ({ 
  vendors = [
    { id: 'V-01', name: '顺通机电', position: [-6, 2, -4], status: 'active', load: 75 },
    { id: 'V-02', name: '精工动力', position: [7, 1, 3], status: 'warning', load: 92 },
    { id: 'V-03', name: '蓝海液压', position: [0, 3, -8], status: 'active', load: 45 },
    { id: 'V-04', name: '远航特种', position: [-4, -1, 6], status: 'idle', load: 10 },
  ],
  onVendorSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // Central Factory Hub
    const hubGeo = new THREE.IcosahedronGeometry(2, 1);
    const hubMat = new THREE.MeshPhongMaterial({ 
      color: 0x8b5cf6, 
      wireframe: true,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    scene.add(hub);

    // Grid Floor
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    const vendorGroup = new THREE.Group();
    scene.add(vendorGroup);

    const clickableObjects: THREE.Object3D[] = [];
    const lines: THREE.Line[] = [];

    vendors.forEach((v) => {
      // Hexagonal Node
      const nodeGeo = new THREE.CylinderGeometry(1, 1, 0.5, 6);
      const color = v.status === 'warning' ? 0xef4444 : (v.status === 'active' ? 0x10b981 : 0x64748b);
      const nodeMat = new THREE.MeshPhongMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.2
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(...v.position);
      node.userData = { id: v.id };
      vendorGroup.add(node);
      clickableObjects.push(node);

      // Connection Line
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...v.position)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      lines.push(line);

      // Flowing Particle
      const partGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const partMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
      const particle = new THREE.Mesh(partGeo, partMat);
      scene.add(particle);
      (particle as any).userData = { 
        start: new THREE.Vector3(0,0,0), 
        end: new THREE.Vector3(...v.position),
        t: Math.random() 
      };
    });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0x8b5cf6, 10, 50);
    point.position.set(0, 10, 0);
    scene.add(point);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);
      if (intersects.length > 0) onVendorSelect?.(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      hub.rotation.y += 0.005;
      hub.rotation.z += 0.003;

      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && (child as any).userData.start) {
          const data = (child as any).userData;
          data.t = (data.t + 0.005) % 1;
          child.position.lerpVectors(data.start, data.end, data.t);
          child.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [vendors, onVendorSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};