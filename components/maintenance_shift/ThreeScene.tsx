import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShiftThreeProps } from './three-types';

export const ShiftThreeScene: React.FC<ShiftThreeProps> = ({ 
  shifts, 
  currentDay, 
  currentHour,
  onShiftSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

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

    // Central Time Axis
    const axisGeo = new THREE.CylinderGeometry(0.2, 0.2, 16, 32);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
    const axis = new THREE.Mesh(axisGeo, axisMat);
    group.add(axis);

    // Day Levels (Discs)
    for (let i = 0; i < 7; i++) {
        const ringGeo = new THREE.RingGeometry(8, 8.1, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = (i - 3) * 2; // Spread vertically
        group.add(ring);
        
        // Day Label Placeholder (Visual only)
        const labelGeo = new THREE.PlaneGeometry(1, 0.5);
        const labelMat = new THREE.MeshBasicMaterial({ color: i === currentDay ? 0x0ea5e9 : 0x475569 });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(9, (i - 3) * 2, 0);
        label.rotation.x = -Math.PI / 2; // Face up roughly
        group.add(label);
    }

    // Shift Blocks
    const meshes: THREE.Mesh[] = [];
    const teamRadii: Record<string, number> = {
        'alpha': 3,
        'beta': 4.5,
        'gamma': 6,
        'delta': 7.5
    };
    
    const typeColors: Record<string, number> = {
        'day': 0x0ea5e9, // Cyan
        'swing': 0xf59e0b, // Amber
        'night': 0x8b5cf6, // Purple
        'standby': 0x10b981 // Green
    };

    shifts.forEach(shift => {
        const radius = teamRadii[shift.teamId] || 5;
        const yPos = (shift.dayIndex - 3) * 2;
        
        // Arc length based on duration (24h = 2PI)
        const startAngle = (shift.startHour / 24) * Math.PI * 2;
        const lengthAngle = (shift.duration / 24) * Math.PI * 2;
        
        const blockGeo = new THREE.TorusGeometry(radius, 0.4, 16, 64, lengthAngle);
        const blockMat = new THREE.MeshPhongMaterial({ 
            color: typeColors[shift.type],
            emissive: typeColors[shift.type],
            emissiveIntensity: 0.2,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(blockGeo, blockMat);
        
        // Rotate to correct start time
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.z = -startAngle; // Negative for clockwise time? standard is CCW usually, let's keep it simple
        mesh.position.y = yPos;
        
        mesh.userData = { id: shift.id };
        group.add(mesh);
        meshes.push(mesh);
    });

    // Current Time Cursor (Scanning Plane)
    const cursorGeo = new THREE.PlaneGeometry(18, 16);
    const cursorMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.05, 
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const cursor = new THREE.Mesh(cursorGeo, cursorMat);
    // Position based on current time of week? Or just create a vertical slice at currentHour
    // Let's make it a vertical plane rotating with time
    cursor.rotation.y = -(currentHour / 24) * Math.PI * 2;
    scene.add(cursor);


    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 20);
    pointLight.position.set(0, 0, 0);
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
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            onShiftSelect?.(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
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
  }, [shifts, currentDay, currentHour, onShiftSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
