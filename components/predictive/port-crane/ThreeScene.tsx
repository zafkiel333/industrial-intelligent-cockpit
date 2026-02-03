
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CraneAnimatables, CraneViewMode } from './three-types';

interface ThreeSceneProps {
  healthStatus?: number; // 0-100
  workCycle?: number; // 0-1 animation cycle
  viewMode?: CraneViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthStatus = 95, 
  workCycle = 0,
  viewMode = 'operation' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(60, 40, 60);
    camera.lookAt(0, 20, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(-30, 50, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xf59e0b, 10, 100);
    accentLight.position.set(0, 40, 0);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: CraneAnimatables = {};
    const disposables: any[] = [];

    // --- Materials ---
    const structureMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        roughness: 0.7, 
        metalness: 0.5 
    });
    const highlightMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3 
    });
    const stressMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.6
    });

    // --- 1. Gantry Structure (Portal) ---
    const legGeo = new THREE.BoxGeometry(2, 30, 2);
    
    // Left Legs
    const legL1 = new THREE.Mesh(legGeo, structureMat);
    legL1.position.set(-10, 15, 10);
    group.add(legL1);
    
    const legL2 = new THREE.Mesh(legGeo, structureMat);
    legL2.position.set(10, 15, 10);
    group.add(legL2);

    // Right Legs (Waterside)
    const legR1 = new THREE.Mesh(legGeo, structureMat);
    legR1.position.set(-10, 15, -10);
    group.add(legR1);
    
    const legR2 = new THREE.Mesh(legGeo, structureMat);
    legR2.position.set(10, 15, -10);
    group.add(legR2);

    // Cross Beams
    const beamGeo = new THREE.BoxGeometry(24, 2, 2);
    const beam1 = new THREE.Mesh(beamGeo, structureMat);
    beam1.position.set(0, 20, 10);
    group.add(beam1);
    const beam2 = new THREE.Mesh(beamGeo, structureMat);
    beam2.position.set(0, 20, -10);
    group.add(beam2);

    // Connecting Beams
    const conBeamGeo = new THREE.BoxGeometry(2, 2, 22);
    const conBeam1 = new THREE.Mesh(conBeamGeo, structureMat);
    conBeam1.position.set(-10, 28, 0);
    group.add(conBeam1);
    const conBeam2 = new THREE.Mesh(conBeamGeo, structureMat);
    conBeam2.position.set(10, 28, 0);
    group.add(conBeam2);

    disposables.push(legGeo, beamGeo, conBeamGeo, structureMat, highlightMat);

    // --- 2. Boom (The Arm) ---
    const boomGroup = new THREE.Group();
    const boomGeo = new THREE.BoxGeometry(4, 3, 60);
    const boomMesh = new THREE.Mesh(boomGeo, structureMat);
    boomMesh.position.set(0, 0, -10); // Extend over water
    boomGroup.position.set(0, 32, 0);
    boomGroup.add(boomMesh);
    
    // Boom Wireframe
    const boomWire = new THREE.Mesh(boomGeo, highlightMat);
    boomWire.position.copy(boomMesh.position);
    boomGroup.add(boomWire);
    
    group.add(boomGroup);
    animatables.boom = boomGroup;
    disposables.push(boomGeo);

    // --- 3. Machinery House ---
    const houseGeo = new THREE.BoxGeometry(8, 6, 10);
    const house = new THREE.Mesh(houseGeo, structureMat);
    house.position.set(0, 36, 12); // Backreach
    group.add(house);
    disposables.push(houseGeo);

    // --- 4. Trolley & Spreader ---
    const trolleyGroup = new THREE.Group();
    const trolleyGeo = new THREE.BoxGeometry(3, 2, 3);
    const trolley = new THREE.Mesh(trolleyGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    trolleyGroup.add(trolley);
    
    // Spreader
    const spreaderGroup = new THREE.Group();
    const spreaderGeo = new THREE.BoxGeometry(2.5, 0.5, 6); // 20ft container size
    const spreader = new THREE.Mesh(spreaderGeo, new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
    spreaderGroup.add(spreader);
    
    // Ropes (Visual lines)
    const ropesGeo = new THREE.BufferGeometry();
    // 4 corners
    const ropePos = new Float32Array(12); // 4 lines * 3 coords
    ropesGeo.setAttribute('position', new THREE.BufferAttribute(ropePos, 3));
    const ropeMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
    const ropes = new THREE.LineSegments(ropesGeo, ropeMat);
    
    trolleyGroup.add(ropes);
    trolleyGroup.add(spreaderGroup);
    
    // Container (Load)
    const contGeo = new THREE.BoxGeometry(2.4, 2.4, 6);
    const contMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red container
    const container = new THREE.Mesh(contGeo, contMat);
    container.position.y = -1.5;
    spreaderGroup.add(container);
    animatables.container = container;

    // Initial positioning
    trolleyGroup.position.set(0, 30, 0);
    group.add(trolleyGroup);
    animatables.trolley = trolleyGroup;
    animatables.spreader = spreaderGroup;
    animatables.ropes = ropes as any;

    disposables.push(trolleyGeo, spreaderGeo, contGeo, ropeMat, contMat);

    // --- 5. Stress Points (Fatigue Simulation) ---
    const stressGroup = new THREE.Group();
    const sGeo = new THREE.SphereGeometry(0.5, 8, 8);
    // Add stress points at critical junctions
    const points = [
        new THREE.Vector3(-10, 28, 0),
        new THREE.Vector3(10, 28, 0),
        new THREE.Vector3(0, 32, 10)
    ];
    points.forEach(p => {
        const s = new THREE.Mesh(sGeo, stressMat);
        s.position.copy(p);
        stressGroup.add(s);
    });
    group.add(stressGroup);
    animatables.stressPoints = stressGroup;

    // --- 6. Scanning Laser (Health Monitor) ---
    const scanGeo = new THREE.BoxGeometry(40, 0.5, 0.5);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.rotation.y = Math.PI / 2;
    group.add(scanner);
    animatables.scanningLaser = scanner;


    // --- Floor / Water ---
    const waterGeo = new THREE.PlaneGeometry(200, 200);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x051a2e, transparent: true, opacity: 0.5 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0;
    scene.add(water);

    const dockGeo = new THREE.BoxGeometry(60, 2, 40);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.set(0, -1, 15);
    scene.add(dock);


    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Trolley Movement Simulation
      if (animatables.trolley) {
          // Move along Z axis (Boom)
          const zPos = Math.sin(time * 0.5) * 20 - 10; 
          animatables.trolley.position.z = zPos;

          // Hoist Movement (Y axis relative to trolley)
          if (animatables.spreader) {
             const hoistDepth = 15 + Math.cos(time * 1) * 10;
             animatables.spreader.position.y = -hoistDepth;

             // Update Ropes
             if (animatables.ropes) {
                 const positions = (animatables.ropes as any).geometry.attributes.position.array;
                 // 4 vertical lines
                 // Line 1
                 positions[0] = -1; positions[1] = 0; positions[2] = -1;
                 positions[3] = -1; positions[4] = -hoistDepth; positions[5] = -1;
                 // Line 2
                 positions[6] = 1; positions[7] = 0; positions[8] = -1;
                 positions[9] = 1; positions[10] = -hoistDepth; positions[11] = -1;
                 // ... simplify for visual
                 (animatables.ropes as any).geometry.attributes.position.needsUpdate = true;
             }
          }
      }

      // Stress Points Pulse
      if (animatables.stressPoints) {
          const scale = 1 + Math.sin(time * 5) * 0.3;
          animatables.stressPoints.scale.setScalar(scale);
          // Only visible in Structural mode or low health
          animatables.stressPoints.visible = viewMode === 'structural' || healthStatus < 80;
      }

      // Scanner
      if (animatables.scanningLaser) {
          animatables.scanningLaser.position.z = Math.sin(time * 2) * 30;
          animatables.scanningLaser.visible = viewMode === 'structural';
      }

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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [healthStatus, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
