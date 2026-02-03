import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StockThreeProps, StockLocation } from './three-types';

export const StockThreeScene: React.FC<StockThreeProps> = ({ 
  locations = [], 
  selectedId,
  onSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Fog for depth
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 6, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

    // --- Scene Objects ---

    // Floor Grid (Holographic base)
    const gridHelper = new THREE.GridHelper(20, 20, 0x0ea5e9, 0x1e293b);
    scene.add(gridHelper);

    // Group to hold racks
    const warehouseGroup = new THREE.Group();
    scene.add(warehouseGroup);

    const boxGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
    const rackMaterial = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
    
    // Create Racks logic
    const rackCount = 3;
    const levels = 5;
    const columns = 5;
    
    const meshes: THREE.Mesh[] = [];

    // Helper to find data for a position
    const getStockData = (r: number, l: number, c: number) => {
      return locations.find(loc => loc.rack === r && loc.level === l && loc.column === c);
    };

    for (let r = 0; r < rackCount; r++) {
      const zPos = (r - 1) * 3; // Spacing between racks

      // Draw Rack Frame (Simplified visuals)
      const frameGeo = new THREE.BoxGeometry(columns * 1.1, levels * 0.8, 1);
      const edges = new THREE.EdgesGeometry(frameGeo);
      const rackFrame = new THREE.LineSegments(edges, rackMaterial);
      rackFrame.position.set(0, (levels * 0.8) / 2, zPos);
      warehouseGroup.add(rackFrame);

      for (let l = 0; l < levels; l++) {
        for (let c = 0; c < columns; c++) {
          const xPos = (c - 2) * 1.1;
          const yPos = l * 0.8 + 0.4;

          const data = getStockData(r, l, c);
          
          // Determine color based on status
          let color = 0x334155; // Default empty/normal dark
          let emissive = 0x000000;
          let opacity = 0.4;

          if (data) {
            if (data.status === 'critical') { color = 0xef4444; emissive = 0xef4444; opacity = 0.9; }
            else if (data.status === 'low') { color = 0xf59e0b; emissive = 0xf59e0b; opacity = 0.8; }
            else if (data.status === 'normal') { color = 0x0ea5e9; opacity = 0.6; }
          }

          const mat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            emissive: emissive,
            emissiveIntensity: data?.id === selectedId ? 1 : 0.2,
            shininess: 100
          });

          const box = new THREE.Mesh(boxGeometry, mat);
          box.position.set(xPos, yPos, zPos);
          
          // Add some random variation to box scale for realism
          box.scale.set(0.9, Math.random() * 0.4 + 0.6, 0.9);
          
          if (data) {
            box.userData = { id: data.id };
            meshes.push(box);
          }
          
          warehouseGroup.add(box);
        }
      }
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 20);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    const warnLight = new THREE.PointLight(0xf97316, 0, 20); // Animated later
    warnLight.position.set(-5, 5, 0);
    scene.add(warnLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onSelect?.(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Pulse effects
      meshes.forEach(mesh => {
        if (mesh.userData.id === selectedId) {
           // Selected pulsing
           mesh.scale.y = 0.8 + Math.sin(time * 5) * 0.1;
           (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.2;
        } else {
           // Idle logic
           // If critical, pulse lightly
           // (Needs robust referencing to data, here simplified)
        }
      });

      // Warning light sweep
      warnLight.intensity = Math.sin(time) > 0 ? 2 : 0;

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
  }, [locations, selectedId, onSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};