
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LifecycleThreeProps } from './three-types';

export const LifecycleThreeScene: React.FC<LifecycleThreeProps> = ({ 
  stages, 
  activeStageId, 
  onStageSelect,
  speed
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 10, 20);

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
    controls.autoRotateSpeed = speed * 0.5;

    // --- Scene Objects ---
    const group = new THREE.Group();
    scene.add(group);

    // 1. The Helix Path (DNA Strand)
    const points: THREE.Vector3[] = [];
    const radius = 6;
    const heightRange = 12;
    const turns = 2.5;
    
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const angle = t * Math.PI * 2 * turns;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (t - 0.5) * heightRange;
        points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.3,
        wireframe: true 
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    // Core Axis
    const axisGeo = new THREE.CylinderGeometry(0.1, 0.1, heightRange + 2, 16);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.2 });
    const axis = new THREE.Mesh(axisGeo, axisMat);
    group.add(axis);

    // 2. Stage Nodes
    const nodeMeshes: THREE.Mesh[] = [];
    stages.forEach((stage, idx) => {
        const t = idx / (stages.length - 1);
        const pos = curve.getPointAt(t);
        
        // Node Geometry
        const geo = new THREE.SphereGeometry(0.4, 16, 16);
        const color = stage.status === 'active' ? 0x10b981 : (stage.status === 'completed' ? 0x0ea5e9 : 0x64748b);
        const mat = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: stage.id === activeStageId ? 1.5 : 0.2,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.userData = { id: stage.id };
        group.add(mesh);
        nodeMeshes.push(mesh);

        // Label Ring
        if (stage.id === activeStageId) {
            const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 16, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(pos);
            ring.lookAt(0, pos.y, 0); // Face center axis roughly
            group.add(ring);
        }
    });

    // 3. Flow Particles
    const pCount = 50;
    const pGroup = new THREE.Group();
    group.add(pGroup);
    const pMeshes: any[] = [];
    
    for(let i=0; i<pCount; i++) {
        const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
        const p = new THREE.Mesh(pGeo, pMat);
        pGroup.add(p);
        pMeshes.push({ mesh: p, t: Math.random() });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 20);
    pointLight.position.set(5, 5, 5);
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
        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length > 0) {
            onStageSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Particles Flow
        pMeshes.forEach(pm => {
            pm.t += 0.002 * speed;
            if (pm.t > 1) pm.t = 0;
            const pos = curve.getPointAt(pm.t);
            pm.mesh.position.copy(pos);
        });

        // Pulse Active Node
        nodeMeshes.forEach(mesh => {
            if (mesh.userData.id === activeStageId) {
                const s = 1 + Math.sin(Date.now() * 0.005) * 0.2;
                mesh.scale.setScalar(s);
            } else {
                mesh.scale.setScalar(1);
            }
        });

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
  }, [stages, activeStageId, speed]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
