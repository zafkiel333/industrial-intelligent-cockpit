
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EngineSceneProps } from './three-types';

export const EngineThreeScene: React.FC<EngineSceneProps> = ({
  rpm,
  cylinders,
  turboSpeed,
  viewMode,
  activeCylinder,
  onCylinderSelect,
  vibrationIntensity
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineGroupRef = useRef<THREE.Group | null>(null);
  const pistonsRef = useRef<THREE.Group[]>([]);
  const crankshaftRef = useRef<THREE.Group | null>(null);
  const turbosRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050202);
    scene.fog = new THREE.FogExp2(0x050202, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffaa00, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 50);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xef4444, 0, 20); // Warning light
    redLight.position.set(0, 5, 0);
    scene.add(redLight);

    // Materials
    const blockMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });

    const pistonMat = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0, metalness: 0.9, roughness: 0.3
    });

    const hotMat = new THREE.MeshStandardMaterial({
        color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 0.5
    });

    // Geometry Construction
    const mainGroup = new THREE.Group();
    engineGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Engine Block (V-Shape)
    const blockL = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 3), blockMat);
    blockL.position.set(0, 2, 2);
    blockL.rotation.x = Math.PI / 6; // 30 deg V
    mainGroup.add(blockL);

    const blockR = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 3), blockMat);
    blockR.position.set(0, 2, -2);
    blockR.rotation.x = -Math.PI / 6;
    mainGroup.add(blockR);

    // 2. Crankshaft
    const crankGroup = new THREE.Group();
    crankshaftRef.current = crankGroup;
    mainGroup.add(crankGroup);
    
    const crankShaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 16, 16);
    crankShaftGeo.rotateZ(Math.PI/2);
    const crankShaft = new THREE.Mesh(crankShaftGeo, new THREE.MeshStandardMaterial({color: 0x475569}));
    crankGroup.add(crankShaft);

    // 3. Pistons (16 Cylinder)
    pistonsRef.current = [];
    const cylCount = 8; // per bank
    const spacing = 1.6;
    
    // Left Bank (1-8)
    for(let i=0; i<cylCount; i++) {
        const x = -5.6 + i * spacing;
        const pGroup = createPistonGroup(i+1, x, 2, 2, Math.PI/6, pistonMat);
        mainGroup.add(pGroup);
        pistonsRef.current.push(pGroup);
    }
    // Right Bank (9-16)
    for(let i=0; i<cylCount; i++) {
        const x = -5.6 + i * spacing + 0.8; // Offset
        const pGroup = createPistonGroup(i+9, x, 2, -2, -Math.PI/6, pistonMat);
        mainGroup.add(pGroup);
        pistonsRef.current.push(pGroup);
    }

    // 4. Turbochargers
    const turboGeo = new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8);
    const turboL = new THREE.Mesh(turboGeo, new THREE.MeshStandardMaterial({color: 0xcd7f32}));
    turboL.position.set(-8, 4, 1.5);
    mainGroup.add(turboL);
    turbosRef.current.push(turboL as any); // Treat as group for rotation

    const turboR = new THREE.Mesh(turboGeo, new THREE.MeshStandardMaterial({color: 0xcd7f32}));
    turboR.position.set(-8, 4, -1.5);
    mainGroup.add(turboR);
    turbosRef.current.push(turboR as any);

    // Helpers
    function createPistonGroup(id: number, x: number, y: number, z: number, rotX: number, mat: THREE.Material) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.x = rotX;
        group.userData = { id, baseX: x, baseY: y, baseZ: z, baseRotX: rotX };

        // Piston Head
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1, 32), mat.clone());
        head.name = 'head';
        group.add(head);

        // Connecting Rod
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), new THREE.MeshStandardMaterial({color: 0x64748b}));
        rod.position.y = -1.5;
        group.add(rod);

        return group;
    }

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(mainGroup.children, true);
        if (intersects.length > 0) {
            let target: any = intersects[0].object;
            while(target.parent && !target.parent.userData.id) target = target.parent;
            if (target.parent && target.parent.userData.id) onCylinderSelect(target.parent.userData.id);
        } else {
            onCylinderSelect(-1); // Deselect
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // Crankshaft Rotation
      const crankSpeed = (rpm / 60) * 0.1;
      if (crankshaftRef.current) {
          crankshaftRef.current.rotation.x += crankSpeed;
      }

      // Turbo Rotation
      turbosRef.current.forEach(t => {
          t.rotation.x += (turboSpeed / 60) * 0.05;
      });

      // Piston Motion & View Modes
      pistonsRef.current.forEach((p, i) => {
          const id = p.userData.id;
          const cylData = cylinders.find(c => c.id === id);
          
          // Motion (Sine wave based on cylinder firing order approx)
          // V16 firing is complex, simplifying to linear offset
          const offset = i * (Math.PI / 4);
          const stroke = Math.sin(time * 10 + offset) * 1.0;
          
          p.children[0].position.y = stroke; // Head moves
          p.children[1].position.y = stroke - 1.5; // Rod moves
          // Rod angle (simplified visual)
          p.children[1].rotation.z = Math.sin(time * 10 + offset) * 0.2;

          // Material Updates
          const mesh = p.children[0] as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const isSelected = activeCylinder === id;

          if (viewMode === 'thermal' && cylData) {
              // Map temp 400-800C to color
              const tNorm = Math.max(0, Math.min(1, (cylData.temp - 400) / 400));
              const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
              mat.color.copy(color);
              mat.emissive.copy(color);
              mat.emissiveIntensity = tNorm;
          } else {
              if (isSelected) {
                  mat.color.setHex(0xffffff);
                  mat.emissive.setHex(0xffffff);
                  mat.emissiveIntensity = 0.5;
              } else {
                  mat.color.setHex(0xc0c0c0);
                  mat.emissive.setHex(0x000000);
                  mat.emissiveIntensity = 0;
              }
          }

          // Exploded View
          if (viewMode === 'exploded' && isSelected) {
             const explodeDir = p.userData.id <= 8 ? new THREE.Vector3(0, 1, 1) : new THREE.Vector3(0, 1, -1);
             p.position.lerp(new THREE.Vector3(p.userData.baseX, p.userData.baseY, p.userData.baseZ).add(explodeDir.multiplyScalar(3)), 0.1);
          } else {
             p.position.lerp(new THREE.Vector3(p.userData.baseX, p.userData.baseY, p.userData.baseZ), 0.1);
          }
      });

      // Vibration Shake
      if (engineGroupRef.current && vibrationIntensity > 0) {
          engineGroupRef.current.position.x = (Math.random()-0.5) * vibrationIntensity * 0.05;
          engineGroupRef.current.position.y = (Math.random()-0.5) * vibrationIntensity * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [rpm, cylinders, viewMode, activeCylinder]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
