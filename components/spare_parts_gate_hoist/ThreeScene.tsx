
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GateHoistThreeProps } from './three-types';

export const GateHoistThreeScene: React.FC<GateHoistThreeProps> = ({ 
  parts, 
  selectedPartId, 
  gateOpening,
  waterLevel,
  isCorrosionView,
  onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const gateGroupRef = useRef<THREE.Group>(null);
  const pistonRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 2, 0);

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

    // --- Scene Construction: Radial Gate ---
    
    // 1. Concrete Piers (Static)
    const pierGeo = new THREE.BoxGeometry(4, 12, 12);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const leftPier = new THREE.Mesh(pierGeo, pierMat);
    leftPier.position.set(-8, 4, 0);
    scene.add(leftPier);
    
    const rightPier = new THREE.Mesh(pierGeo, pierMat);
    rightPier.position.set(8, 4, 0);
    scene.add(rightPier);

    // 2. The Gate Structure (Dynamic Group)
    const gateGroup = new THREE.Group();
    // Pivot point is at the trunnion (roughly at y=6, z=6 in local space relative to gate face)
    // We'll set the group position to the Trunnion location
    gateGroup.position.set(0, 5, 5); 
    scene.add(gateGroup);
    // @ts-ignore
    gateGroupRef.current = gateGroup;

    const interactives: THREE.Mesh[] = [];

    // Trunnion Bearing (Pivot)
    const trunnionGeo = new THREE.CylinderGeometry(0.8, 0.8, 14, 32);
    trunnionGeo.rotateZ(Math.PI / 2);
    const trunnionMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const trunnion = new THREE.Mesh(trunnionGeo, trunnionMat);
    trunnion.userData = { id: parts.find(p => p.type === 'trunnion')?.id };
    gateGroup.add(trunnion);
    interactives.push(trunnion);

    // Arms (Struts)
    const armGeo = new THREE.BoxGeometry(0.5, 0.5, 9);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    
    // Left Arms
    const armL1 = new THREE.Mesh(armGeo, armMat);
    armL1.position.set(-5, -2, -4); // Relative to Trunnion
    armL1.rotation.x = -0.4;
    gateGroup.add(armL1);
    const armL2 = new THREE.Mesh(armGeo, armMat);
    armL2.position.set(-5, -5, -3);
    armL2.rotation.x = 0.2;
    gateGroup.add(armL2);

    // Right Arms
    const armR1 = new THREE.Mesh(armGeo, armMat);
    armR1.position.set(5, -2, -4);
    armR1.rotation.x = -0.4;
    gateGroup.add(armR1);
    const armR2 = new THREE.Mesh(armGeo, armMat);
    armR2.position.set(5, -5, -3);
    armR2.rotation.x = 0.2;
    gateGroup.add(armR2);

    // Skin Plate (The Face) - Curved
    // Use a tube segment or custom geometry
    const radius = 9;
    const skinGeo = new THREE.CylinderGeometry(radius, radius, 12, 64, 1, true, Math.PI, Math.PI/3); 
    // Rotate to face correct direction relative to pivot
    skinGeo.rotateZ(Math.PI / 2); 
    const skinMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, 
        side: THREE.DoubleSide,
        metalness: 0.4,
        roughness: 0.6
    });
    const skin = new THREE.Mesh(skinGeo, skinMat);
    skin.position.set(0, 0, 0); // Centered on pivot, radius puts the face away
    skin.rotation.y = -Math.PI / 2; // Orient correctly
    skin.rotation.z = Math.PI / 6 + 0.2; // Initial angle adjust
    skin.userData = { id: parts.find(p => p.type === 'skin_plate')?.id };
    gateGroup.add(skin);
    interactives.push(skin);

    // Seals (Edges of skin plate)
    const sealGeo = new THREE.TorusGeometry(radius, 0.15, 16, 64, Math.PI/3);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x1e293b }); // Rubber black
    const leftSeal = new THREE.Mesh(sealGeo, sealMat);
    leftSeal.rotation.y = Math.PI / 2;
    leftSeal.rotation.z = Math.PI / 6 + 0.2;
    leftSeal.position.set(-6, 0, 0);
    leftSeal.userData = { id: parts.find(p => p.type === 'seal')?.id };
    gateGroup.add(leftSeal);
    interactives.push(leftSeal);

    const rightSeal = leftSeal.clone();
    rightSeal.position.set(6, 0, 0);
    rightSeal.userData = { id: parts.find(p => p.type === 'seal')?.id };
    gateGroup.add(rightSeal);
    interactives.push(rightSeal);

    // 3. Hydraulic Hoist (Cylinders) - Static base, moving piston
    // Cylinder Body
    const cylGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 16);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Orange
    const cylL = new THREE.Mesh(cylGeo, cylMat);
    // Positioned on Pier, angled towards gate arm connection
    cylL.position.set(-6.5, 7, 2);
    cylL.rotation.x = 0.5;
    scene.add(cylL);
    
    const cylR = cylL.clone();
    cylR.position.set(6.5, 7, 2);
    scene.add(cylR);

    // Piston Rods (Moving part)
    // We will animate scale/position or just group them
    const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    const rodL = new THREE.Mesh(rodGeo, rodMat);
    rodL.position.set(0, -3, 0); // Initial retracted
    cylL.add(rodL);
    
    const rodR = new THREE.Mesh(rodGeo, rodMat);
    rodR.position.set(0, -3, 0);
    cylR.add(rodR);
    
    // Group for identifying hoist
    cylL.userData = { id: parts.find(p => p.type === 'cylinder')?.id };
    cylR.userData = { id: parts.find(p => p.type === 'cylinder')?.id };
    interactives.push(cylL, cylR);

    // 4. Water
    const waterGeo = new THREE.PlaneGeometry(30, 30);
    const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        transmission: 0.6,
        opacity: 0.8,
        transparent: true,
        roughness: 0.1,
        metalness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);
    // @ts-ignore
    waterRef.current = water;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    
    const fillLight = new THREE.PointLight(0xf59e0b, 0.5, 20); // Warm light for rust/industrial feel
    fillLight.position.set(0, 5, 5);
    scene.add(fillLight);

    // Rust Overlay Logic
    // Can be done by swapping materials or adding a secondary mesh. 
    // Here we will just tint red if corrosion view is on.
    
    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        // Raycast interactives recursively
        const intersects = raycaster.intersectObjects(interactives, false); // Groups handle ids differently, simplified here
        // Or check gateGroup children
        const allGateParts = [...interactives, ...gateGroup.children];
        const hits = raycaster.intersectObjects(allGateParts);
        
        if (hits.length > 0) {
            // Traverse up to find userData.id
            let obj = hits[0].object;
            while(obj && !obj.userData.id && obj.parent) {
                obj = obj.parent;
            }
            if (obj.userData.id) onPartSelect(obj.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);


    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // 1. Gate Rotation
      // gateOpening 0 -> Closed (Rot 0), 1 -> Open (Rot -PI/3)
      const targetRot = -gateOpening * (Math.PI / 3);
      if (gateGroupRef.current) {
          // Smooth lerp
          gateGroupRef.current.rotation.x += (targetRot - gateGroupRef.current.rotation.x) * 0.1;
      }

      // 2. Cylinder Extension
      // Simplified: Just extend rod based on opening
      const rodExt = gateOpening * 2;
      rodL.position.y = -3 + rodExt;
      rodR.position.y = -3 + rodExt;
      // Cylinder LookAt - In a real rig this is kinematic, here simplified static angle

      // 3. Water Level
      // waterLevel 0-1 maps to Y -4 to 4
      const targetWaterY = -4 + waterLevel * 6;
      if (waterRef.current) {
          waterRef.current.position.y += (targetWaterY - waterRef.current.position.y) * 0.05;
          // Water ripple
          waterRef.current.position.y += Math.sin(time * 2) * 0.02;
      }

      // 4. Highlight & Corrosion Effect
      interactives.forEach(mesh => {
          const isSel = mesh.userData.id === selectedPartId;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          
          if (isCorrosionView && mesh.userData.id) {
              // Simulate rust map with color
              mat.color.setHex(0x8b4513); // Rust brown
              mat.emissive.setHex(0xef4444);
              mat.emissiveIntensity = 0.2;
          } else {
             // Reset colors
             if (mesh === skin) mat.color.setHex(0x94a3b8);
             else if (mesh === trunnion) mat.color.setHex(0x475569);
             else if (mesh === cylL || mesh === cylR) mat.color.setHex(0xf59e0b);
             else if (mesh === leftSeal || mesh === rightSeal) mat.color.setHex(0x1e293b);

             mat.emissive.setHex(isSel ? 0x0ea5e9 : 0x000000);
             mat.emissiveIntensity = isSel ? 0.5 : 0;
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
  }, [parts, selectedPartId, gateOpening, waterLevel, isCorrosionView, onPartSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
