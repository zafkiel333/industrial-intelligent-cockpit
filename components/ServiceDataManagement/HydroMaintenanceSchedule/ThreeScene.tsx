
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MaintenanceSceneProps, HydroUnitNode, CraneNode } from './three-types';

export const HydroScheduleThreeScene: React.FC<MaintenanceSceneProps> = ({ 
  activeUnitId, onUnitSelect, simulationDay 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const units: HydroUnitNode[] = [
    { id: 'unit-1', name: '1# 机组', position: [-12, 0, 0], status: 'running', progress: 0, nextWindow: '2024-11' },
    { id: 'unit-2', name: '2# 机组', position: [-4, 0, 0], status: 'maintenance', progress: 65, nextWindow: 'Now' },
    { id: 'unit-3', name: '3# 机组', position: [4, 0, 0], status: 'standby', progress: 0, nextWindow: '2024-08' },
    { id: 'unit-4', name: '4# 机组', position: [12, 0, 0], status: 'planned', progress: 0, nextWindow: '2024-06' }
  ];

  const crane: CraneNode = {
    id: 'bridge-crane', position: [-4, 10, 0], status: 'lifting', targetUnitId: 'unit-2'
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x041d1a, 0.02); // Deep teal fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 35);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Industrial Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x14b8a6, 20); // Teal
    spotLight.position.set(0, 30, 10);
    spotLight.angle = 0.5;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);
    
    // Warm light for maintenance area
    const maintLight = new THREE.PointLight(0xf59e0b, 5, 20);
    maintLight.position.set(-4, 8, 0); // Above unit 2
    scene.add(maintLight);

    // Floor Grid (Powerhouse floor)
    const gridGeo = new THREE.PlaneGeometry(60, 40);
    const gridMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.8, 
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(gridGeo, gridMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(60, 30, 0x115e59, 0x0f172a);
    scene.add(gridHelper);

    // Safety Walkways
    const walkMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const walkGeo = new THREE.PlaneGeometry(60, 1);
    const walk1 = new THREE.Mesh(walkGeo, walkMat);
    walk1.rotation.x = -Math.PI / 2;
    walk1.position.z = 8;
    scene.add(walk1);

    const unitMeshes: THREE.Mesh[] = [];
    const group = new THREE.Group();
    scene.add(group);

    // Create Units
    units.forEach(u => {
      const uGroup = new THREE.Group();
      uGroup.position.set(...u.position);

      // Generator Cover (The "Cap")
      const capGeo = new THREE.CylinderGeometry(3, 3.2, 1.5, 32);
      
      let color = 0x334155; // Default Slate
      let emissive = 0x000000;

      if (u.status === 'running') {
        color = 0x10b981; // Green
        emissive = 0x064e3b;
      } else if (u.status === 'maintenance') {
        color = 0xf59e0b; // Amber
        emissive = 0x78350f;
      } else if (u.status === 'planned') {
        color = 0x3b82f6; // Blue
        emissive = 0x1e3a8a;
      }

      const capMat = new THREE.MeshPhongMaterial({ 
        color: u.id === activeUnitId ? 0xffffff : color,
        emissive: emissive,
        transparent: true,
        opacity: u.status === 'maintenance' ? 0.5 : 0.9 // Semi-transparent if maintenance (dismantled)
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.userData = { id: u.id };
      uGroup.add(cap);
      unitMeshes.push(cap);

      // Base Ring
      const ringGeo = new THREE.CylinderGeometry(4, 4, 0.5, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -1;
      uGroup.add(ring);

      // If maintenance, show internal rotor exposed or parts laydown
      if (u.status === 'maintenance') {
         // Exposed Shaft
         const shaft = new THREE.Mesh(
           new THREE.CylinderGeometry(0.8, 0.8, 4, 16),
           new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
         );
         shaft.position.y = 2;
         uGroup.add(shaft);

         // Scaffold (Abstract)
         const scaffGeo = new THREE.BoxGeometry(5, 4, 5);
         const scaffMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
         const scaff = new THREE.Mesh(scaffGeo, scaffMat);
         scaff.position.y = 2;
         uGroup.add(scaff);
      } else if (u.status === 'running') {
         // Spinning effect ring
         const spinGeo = new THREE.TorusGeometry(3.5, 0.1, 8, 32);
         const spinMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
         const spin = new THREE.Mesh(spinGeo, spinMat);
         spin.rotation.x = Math.PI / 2;
         spin.position.y = 0.8;
         spin.userData = { type: 'spinner' }; // For animation
         uGroup.add(spin);
      }

      group.add(uGroup);
    });

    // Create Overhead Crane (Bridge Crane)
    const craneGroup = new THREE.Group();
    // Move crane based on simulation or target
    craneGroup.position.set(...crane.position);
    scene.add(craneGroup);

    // Bridge Beam
    const bridgeGeo = new THREE.BoxGeometry(2, 1, 30);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    craneGroup.add(bridge);

    // Rails (High up)
    const railGeo = new THREE.BoxGeometry(60, 0.5, 1);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const rail1 = new THREE.Mesh(railGeo, railMat); rail1.position.set(0, 10, 14);
    const rail2 = new THREE.Mesh(railGeo, railMat); rail2.position.set(0, 10, -14);
    scene.add(rail1, rail2);

    // Trolley & Hook
    const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    trolley.position.y = -0.5;
    craneGroup.add(trolley);
    
    // Hook Line
    const lineGeo = new THREE.CylinderGeometry(0.05, 0.05, 6);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.y = -3.5;
    craneGroup.add(line);

    // Hook Block
    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    hook.position.y = -6.5;
    craneGroup.add(hook);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(unitMeshes);
      if (intersects.length > 0) {
        onUnitSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate Spinners
      scene.children[scene.children.indexOf(group)].children.forEach(u => {
          const spinner = u.children.find(c => c.userData.type === 'spinner');
          if (spinner) {
              spinner.rotation.z -= 0.1;
          }
      });

      // Animate Crane (simulated movement based on day)
      // Just a gentle float for visual life
      craneGroup.position.x = -4 + Math.sin(time * 0.5) * 2;

      // Active Unit Highlight Pulse
      unitMeshes.forEach(mesh => {
          if (mesh.userData.id === activeUnitId) {
              mesh.scale.setScalar(1 + Math.sin(time * 3) * 0.02);
          } else {
              mesh.scale.setScalar(1);
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeUnitId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
