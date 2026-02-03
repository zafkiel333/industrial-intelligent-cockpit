import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ToolsThreeProps } from './three-types';

export const ToolsThreeScene: React.FC<ToolsThreeProps> = ({ 
  slots = [], 
  selectedSlotId, 
  onSlotSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Dark tech fog
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2 + 0.2; // Limit vertical rotation

    // --- Scene Objects ---

    // Cabinet Frame
    const frameGeo = new THREE.BoxGeometry(6.5, 5.5, 1);
    const frameMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.5;
    scene.add(frame);

    // Slots Group
    const slotsGroup = new THREE.Group();
    scene.add(slotsGroup);

    const slotMeshes: THREE.Mesh[] = [];

    // Generate Locker Grid (Assuming roughly 4 rows x 5 cols based on slot data or defaults)
    // We render based on passed slots, mapping row/col to positions
    slots.forEach(slot => {
      const w = 1;
      const h = 1;
      const gap = 0.2;
      
      // Calculate position centering the grid
      const x = (slot.col - 2) * (w + gap); 
      const y = (slot.row - 1.5) * (h + gap); 
      
      // Geometry for the door
      const geometry = new THREE.BoxGeometry(w, h, 0.1);
      
      // Color Logic
      let color = 0x334155; // Default Slate
      let emissive = 0x000000;
      let intensity = 0.0;

      if (slot.status === 'available') {
        color = 0x06b6d4; // Cyan
        emissive = 0x06b6d4;
        intensity = 0.2;
      } else if (slot.status === 'borrowed') {
        color = 0x334155; // Dark (Empty)
        emissive = 0x000000;
      } else if (slot.status === 'maintenance') {
        color = 0xef4444; // Red
        emissive = 0xef4444;
        intensity = 0.3;
      }

      if (slot.id === selectedSlotId) {
        color = 0xf59e0b; // Amber for selection
        emissive = 0xf59e0b;
        intensity = 0.8;
      }

      const material = new THREE.MeshStandardMaterial({ 
        color: color,
        emissive: emissive,
        emissiveIntensity: intensity,
        metalness: 0.5,
        roughness: 0.1,
        transparent: true,
        opacity: slot.status === 'borrowed' ? 0.3 : 0.9
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, 0);
      mesh.userData = { id: slot.id };
      
      slotsGroup.add(mesh);
      slotMeshes.push(mesh);

      // Add a handle
      const handleGeo = new THREE.BoxGeometry(0.1, 0.3, 0.05);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(w/2 - 0.2, 0, 0.08);
      mesh.add(handle);

      // Add a label number (Simplified as a small plane)
      const labelGeo = new THREE.PlaneGeometry(0.3, 0.15);
      const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(-w/2 + 0.3, h/2 - 0.2, 0.06);
      mesh.add(label);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0x0ea5e9, 5);
    spotLight.position.set(5, 10, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    scene.add(spotLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 10);
    blueLight.position.set(-5, 0, 5);
    scene.add(blueLight);

    // Floor Reflection
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x020617, 
        metalness: 0.8, 
        roughness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    scene.add(floor);

    // Grid on floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x000000);
    gridHelper.position.y = -2.99;
    scene.add(gridHelper);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(slotMeshes);
      if (intersects.length > 0) {
        onSlotSelect?.(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.05;

      // Pulse selected slot
      slotMeshes.forEach(mesh => {
        if (mesh.userData.id === selectedSlotId) {
           (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.4;
           mesh.position.z = Math.sin(time * 2) * 0.05; // Slight hover
        } else {
           mesh.position.z = 0;
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
  }, [slots, selectedSlotId, onSlotSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};