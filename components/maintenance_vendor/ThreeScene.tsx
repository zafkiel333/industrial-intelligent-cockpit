import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VendorThreeProps } from './three-types';

export const VendorThreeScene: React.FC<VendorThreeProps> = ({ 
  vendors, 
  selectedVendorId, 
  onVendorSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);

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
    controls.autoRotateSpeed = 0.5;

    // --- Scene Construction ---

    const ecosystemGroup = new THREE.Group();
    scene.add(ecosystemGroup);

    // 1. Central Core (The Enterprise)
    const coreGeo = new THREE.IcosahedronGeometry(2, 2);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x8b5cf6, 
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      wireframe: true
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    ecosystemGroup.add(core);

    // Core Glow
    const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    ecosystemGroup.add(glow);

    // 2. Orbital Rings
    const rings = [6, 12, 18]; // Radii for Strategic, Core, Support tiers
    rings.forEach(r => {
        const ringGeo = new THREE.RingGeometry(r, r + 0.1, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ecosystemGroup.add(ring);
    });

    // 3. Vendor Nodes
    const nodes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];

    vendors.forEach((vendor, i) => {
        // Calculate position if not provided (distribute on rings based on tier)
        let radius = 18;
        if (vendor.tier === 'strategic') radius = 6;
        else if (vendor.tier === 'core') radius = 12;

        // Use cached position logic simulation for stability if needed, 
        // but here we generate based on index spread
        const angle = (i * 137.5) * (Math.PI / 180); // Golden angle distribution
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 2; // Slight vertical variation

        // Geometry based on Score
        const size = 0.5 + (vendor.score / 100) * 0.5;
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        
        // Color based on Score
        let color = 0xef4444; // Red < 70
        if (vendor.score >= 90) color = 0x10b981; // Green
        else if (vendor.score >= 70) color = 0xf59e0b; // Yellow

        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: selectedVendorId === vendor.id ? 0xffffff : color,
            emissiveIntensity: selectedVendorId === vendor.id ? 0.8 : 0.2,
            shininess: 100
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = { id: vendor.id, baseY: y };
        ecosystemGroup.add(mesh);
        nodes.push(mesh);

        // Connection Line to Center
        const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(x, y, z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x8b5cf6, 
            transparent: true, 
            opacity: selectedVendorId === vendor.id ? 0.6 : 0.1 
        });
        const line = new THREE.Line(lineGeo, lineMat);
        ecosystemGroup.add(line);
        connections.push(line);
        
        // Selection Ring (if selected)
        if (selectedVendorId === vendor.id) {
            const selGeo = new THREE.TorusGeometry(size + 0.3, 0.05, 16, 32);
            const selMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const selRing = new THREE.Mesh(selGeo, selMat);
            selRing.rotation.x = Math.PI / 2;
            selRing.position.copy(mesh.position);
            ecosystemGroup.add(selRing);
        }
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);
      if (intersects.length > 0) {
        onVendorSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Pulse Core
      core.rotation.y += 0.005;
      core.rotation.z += 0.002;
      glow.scale.setScalar(1 + Math.sin(time * 2) * 0.1);

      // Bobbing Nodes
      nodes.forEach((node, i) => {
          node.position.y = node.userData.baseY + Math.sin(time * 2 + i) * 0.5;
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
  }, [vendors, selectedVendorId, onVendorSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
