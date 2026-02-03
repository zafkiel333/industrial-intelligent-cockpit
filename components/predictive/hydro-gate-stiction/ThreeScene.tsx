
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StictionSceneProps } from './three-types';

export const GateStictionScene: React.FC<StictionSceneProps> = ({ 
  position,
  skew,
  frictionZones,
  waterLevel,
  isMoving,
  jammed
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gateRef = useRef<THREE.Group | null>(null);
  const tracksRef = useRef<THREE.Group | null>(null);
  const sparksRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050202, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 25);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffaa00, 3);
    spotLight.position.set(10, 20, 20);
    spotLight.lookAt(0,0,0);
    scene.add(spotLight);

    const redLight = new THREE.PointLight(0xff0000, 0, 20); // Jamming alarm light
    redLight.position.set(0, 5, 5);
    scene.add(redLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.6, roughness: 0.4 
    });
    
    const concreteMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b, roughness: 0.9, metalness: 0.1
    });

    const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 0.8, roughness: 0.3
    });

    const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.8,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });

    const frictionMat = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Civil Works (Slots)
    const slotGroup = new THREE.Group();
    mainGroup.add(slotGroup);
    tracksRef.current = slotGroup;

    const pierGeo = new THREE.BoxGeometry(3, 20, 4);
    const leftPier = new THREE.Mesh(pierGeo, concreteMat);
    leftPier.position.set(-8, 10, 0);
    slotGroup.add(leftPier);

    const rightPier = new THREE.Mesh(pierGeo, concreteMat);
    rightPier.position.set(8, 10, 0);
    slotGroup.add(rightPier);

    // Rails (Stainless Steel Tracks)
    const railGeo = new THREE.BoxGeometry(0.2, 18, 0.5);
    const railL = new THREE.Mesh(railGeo, wheelMat);
    railL.position.set(-6.4, 9, 0.5);
    slotGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, wheelMat);
    railR.position.set(6.4, 9, 0.5);
    slotGroup.add(railR);

    // 2. Gate Leaf (Moving)
    const gateGroup = new THREE.Group();
    gateRef.current = gateGroup;
    mainGroup.add(gateGroup);

    // Main Panel
    const panelGeo = new THREE.BoxGeometry(12, 8, 1);
    const panel = new THREE.Mesh(panelGeo, steelMat);
    panel.position.y = 4; // Center of gate
    gateGroup.add(panel);

    // Ribs
    for(let i=0; i<4; i++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 0.5), steelMat);
        rib.position.set(0, 1 + i*2, 0.75);
        gateGroup.add(rib);
    }

    // Wheels (4 per side)
    for(let y=0; y<4; y++) {
        const wy = 1 + y * 2;
        const wheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), wheelMat);
        wheelL.rotation.z = Math.PI/2;
        wheelL.position.set(-6.2, wy, 0.5);
        gateGroup.add(wheelL);

        const wheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16), wheelMat);
        wheelR.rotation.z = Math.PI/2;
        wheelR.position.set(6.2, wy, 0.5);
        gateGroup.add(wheelR);
    }

    // 3. Water
    const waterGeo = new THREE.BoxGeometry(14, 1, 8);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0, -4.5);
    mainGroup.add(water);

    // 4. Friction Hotspots on Rails
    // We create a pool of meshes to show friction spots
    const hotspotPool: THREE.Mesh[] = [];
    for(let i=0; i<5; i++) {
        const spot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.6), frictionMat);
        slotGroup.add(spot);
        spot.visible = false;
        hotspotPool.push(spot);
    }

    // 5. Sparks (Particles)
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100; // Hide
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffaa00, size: 0.2, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeo, pMat);
    sparksRef.current = sparks;
    mainGroup.add(sparks);


    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Gate Movement & Skew
      if (gateRef.current) {
          // Map 0-100% to Y=0 to Y=10
          const targetY = (position / 100) * 10;
          gateRef.current.position.y += (targetY - gateRef.current.position.y) * 0.1;
          
          // Apply Skew (Rotation around Z axis)
          // skew is in mm, gate width ~12m. angle ~= skew / 12000
          // exaggerated for visual
          const skewAngle = (skew / 1000) * 5; 
          gateRef.current.rotation.z = -skewAngle; 

          // Jamming Shake
          if (jammed) {
              gateRef.current.position.x = (Math.random() - 0.5) * 0.1;
              gateRef.current.position.y += (Math.random() - 0.5) * 0.05;
              redLight.intensity = 2 + Math.sin(time*20)*2;
          } else {
              gateRef.current.position.x = 0;
              redLight.intensity = 0;
          }
      }

      // 2. Water Level
      water.scale.y = Math.max(0.1, waterLevel);
      water.position.y = waterLevel / 2;

      // 3. Friction Zones Visualization
      hotspotPool.forEach(spot => spot.visible = false);
      frictionZones.forEach((zone, i) => {
          if (i < hotspotPool.length) {
              const spot = hotspotPool[i];
              spot.visible = true;
              // Map zone.y (0-100% of travel) to world Y (0-10)
              const yPos = (zone.y / 100) * 10 + 2; // Offset to rail start
              // Check if gate wheels are passing this zone
              // Gate bottom is at gateRef.y. Wheels are at gateRef.y + 1, +3, +5, +7
              // If any wheel aligns with yPos, intensify
              let isActive = false;
              if (gateRef.current) {
                  const gateY = gateRef.current.position.y;
                  for(let w=0; w<4; w++) {
                      const wheelY = gateY + 1 + w*2;
                      if (Math.abs(wheelY - yPos) < 1) isActive = true;
                  }
              }

              spot.position.set(-6.4, yPos, 0.5); // Left rail only for simplicity
              (spot.material as THREE.MeshBasicMaterial).opacity = zone.intensity * (isActive ? 1.0 : 0.3);
              
              // Sparks logic
              if (isActive && isMoving && sparksRef.current) {
                  const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
                  for(let k=0; k<10; k++) {
                      // pick random particle
                      const idx = Math.floor(Math.random() * pCount);
                      positions[idx*3] = -6.4 + (Math.random()-0.5)*0.5;
                      positions[idx*3+1] = yPos + (Math.random()-0.5)*0.5;
                      positions[idx*3+2] = 0.5 + (Math.random()-0.5)*0.5;
                  }
                  sparksRef.current.geometry.attributes.position.needsUpdate = true;
              }
          }
      });
      
      // Decay sparks
      if (sparksRef.current) {
          const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              if (positions[i*3+1] > -50) {
                  positions[i*3+1] -= 0.1; // Fall
                  if (Math.random() > 0.9) positions[i*3+1] = -100; // Kill
              }
          }
          sparksRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [position, skew, frictionZones, waterLevel, isMoving, jammed]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
