import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BomThreeProps } from './three-types';

export const BomThreeScene: React.FC<BomThreeProps> = ({ 
  parts, 
  selectedPartId, 
  explodeLevel,
  onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 12);

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

    // --- Scene Geometry ---

    const group = new THREE.Group();
    scene.add(group);

    // Helper Geometries
    const geometries = {
      shaft: new THREE.CylinderGeometry(0.6, 0.6, 8, 32),
      gear: new THREE.CylinderGeometry(2.5, 2.5, 0.8, 24),
      bearing: new THREE.TorusGeometry(1.2, 0.3, 16, 40),
      housing: new THREE.BoxGeometry(4, 4, 4),
      fastener: new THREE.OctahedronGeometry(0.3, 0)
    };

    // Build Meshes
    const meshes: THREE.Mesh[] = [];

    parts.forEach((part, index) => {
      // Determine Material based on status
      let color = 0x334155;
      let opacity = 0.9;
      let wireframe = false;
      let emissive = 0x000000;

      switch(part.status) {
        case 'matched':
          color = 0x06b6d4; // Cyan
          opacity = 0.8;
          break;
        case 'missing':
          color = 0xef4444; // Red
          opacity = 0.2;
          wireframe = true;
          emissive = 0xef4444;
          break;
        case 'mismatch':
          color = 0xf59e0b; // Amber
          emissive = 0xf59e0b;
          break;
        case 'surplus':
          color = 0x8b5cf6; // Purple
          break;
      }

      if (part.id === selectedPartId) {
        emissive = 0xffffff;
        opacity = 1;
      }

      const mat = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        wireframe: wireframe,
        emissive: emissive,
        emissiveIntensity: part.status === 'missing' ? 0.5 : (part.id === selectedPartId ? 0.5 : 0.1),
        shininess: 80
      });

      const geo = geometries[part.type];
      const mesh = new THREE.Mesh(geo, mat);
      
      // Store original position for explosion logic
      mesh.userData = { 
        id: part.id, 
        originalPos: new THREE.Vector3(...part.position),
        // Explode along Z axis for this visualization
        explodeVec: new THREE.Vector3(0, 0, (index - parts.length/2) * 2) 
      };

      if (part.rotation) mesh.rotation.set(...part.rotation);
      if (part.scale) mesh.scale.set(...part.scale);

      // Initial position
      mesh.position.copy(mesh.userData.originalPos);

      group.add(mesh);
      meshes.push(mesh);
    });

    // Connecting Lines (Laser visual for assembly)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.2 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,-10), new THREE.Vector3(0,0,10)]);
    const centerLine = new THREE.Line(lineGeo, lineMat);
    scene.add(centerLine);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    const blueLight = new THREE.PointLight(0x06b6d4, 2, 20);
    blueLight.position.set(0, 5, 0);
    scene.add(blueLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onPartSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Explode logic
      meshes.forEach(mesh => {
        const targetPos = mesh.userData.originalPos.clone().lerp(
          mesh.userData.originalPos.clone().add(mesh.userData.explodeVec), 
          explodeLevel
        );
        mesh.position.lerp(targetPos, 0.1);

        // Pulse effect for issues
        if (mesh.userData.id === selectedPartId || mesh.material.wireframe) {
           (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.3 + Math.sin(time * 5) * 0.2;
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
  }, [parts, selectedPartId, explodeLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};