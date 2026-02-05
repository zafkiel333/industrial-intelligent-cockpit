
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PriceThreeProps } from './three-types';

export const PriceThreeScene: React.FC<PriceThreeProps> = ({ 
  targetPrice, 
  suppliers, 
  onSelect,
  isEvaluating
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 10, 15);

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
    controls.autoRotate = !isEvaluating;
    controls.autoRotateSpeed = 0.8;

    // --- Scene Objects ---
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Benchmark (Target Price Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x10b981, 
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Benchmark Field (Grid)
    const gridHelper = new THREE.PolarGridHelper(10, 16, 8, 64, 0x10b981, 0x334155);
    gridHelper.position.y = -2;
    group.add(gridHelper);

    // 2. Supplier Nodes (Planets)
    const nodes: THREE.Mesh[] = [];
    const lines: THREE.Line[] = [];

    suppliers.forEach((sup, i) => {
        // Calculate position based on deviation (Distance from center)
        // deviation 0 = radius 4. deviation +50% = radius 8.
        const radius = 4 + Math.abs(sup.deviation) / 10;
        const angle = (i / suppliers.length) * Math.PI * 2;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = sup.deviation / 10; // Height represents higher/lower price

        // Color logic: Green (Best), Gold (Good), Red (Bad/Expensive)
        let color = 0xf59e0b; // Gold default
        if (sup.isBest) color = 0x10b981; // Green
        if (Math.abs(sup.deviation) > 30) color = 0xef4444; // Red

        const geo = new THREE.SphereGeometry(sup.isBest ? 0.6 : 0.4, 32, 32);
        const mat = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: sup.isBest ? 0.8 : 0.2
        });
        
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.userData = { id: sup.id };
        group.add(mesh);
        nodes.push(mesh);

        // Connection Line to center
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(x, y, z)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.2 
        });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
        lines.push(line);

        // Label Ring if Best
        if (sup.isBest) {
            const ringGeo = new THREE.TorusGeometry(0.9, 0.05, 16, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(mesh.position);
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xf59e0b, 2, 50);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodes);
        if (intersects.length > 0) {
            onSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.01;

        // Pulse core
        core.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
        core.rotation.y -= 0.01;

        // Bobbing nodes
        nodes.forEach((n, i) => {
            n.position.y += Math.sin(time * 2 + i) * 0.005;
        });

        if (isEvaluating) {
            group.rotation.y += 0.02;
        }

        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
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
  }, [suppliers, targetPrice, isEvaluating]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
