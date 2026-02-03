
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpStationSceneProps } from './three-types';

export const PumpStationScene: React.FC<PumpStationSceneProps> = ({ 
  waterLevel,
  pumps,
  flowRate,
  turbidity
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const pumpsRef = useRef<THREE.Group[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Dark underwater/industrial vibe
    scene.fog = new THREE.FogExp2(0x020408, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, -2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 2, 20);
    blueLight.position.set(0, 2, 0);
    scene.add(blueLight);

    // --- Materials ---
    const concreteMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, roughness: 0.9, metalness: 0.1, side: THREE.DoubleSide
    });
    
    const pipeMat = new THREE.MeshPhysicalMaterial({
        color: 0x64748b, metalness: 0.6, roughness: 0.3, clearcoat: 0.5
    });

    const motorMat = new THREE.MeshStandardMaterial({
        color: 0x0f766e, metalness: 0.4, roughness: 0.4 // Teal motors
    });

    const shaftMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0, metalness: 0.8, roughness: 0.2
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

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Sump Structure
    const sumpGeo = new THREE.BoxGeometry(12, 8, 6);
    // Invert normals or use DoubleSide to see inside
    const sump = new THREE.Mesh(sumpGeo, concreteMat);
    sump.position.y = -4; // Top at 0
    mainGroup.add(sump);

    // Floor platform (Motor floor)
    const floorGeo = new THREE.BoxGeometry(14, 0.5, 8);
    const floor = new THREE.Mesh(floorGeo, concreteMat);
    floor.position.y = 0.25;
    
    // Cut holes for pumps (Visual simple bool not supported, just place on top)
    mainGroup.add(floor);

    // 2. Water Volume
    const waterGeo = new THREE.BoxGeometry(11.8, 1, 5.8);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -4; // Start low
    waterMeshRef.current = water;
    mainGroup.add(water);

    // 3. Pumps (Vertical Shaft)
    pumpsRef.current = [];
    const pumpPositions = [-3, -1, 1, 3];
    
    pumpPositions.forEach((x, i) => {
        const pumpGroup = new THREE.Group();
        pumpGroup.position.set(x, 0, 0);
        mainGroup.add(pumpGroup);
        pumpsRef.current.push(pumpGroup);

        // Motor (Above floor)
        const motorGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16);
        const motor = new THREE.Mesh(motorGeo, motorMat);
        motor.position.y = 1.25;
        pumpGroup.add(motor);

        // Shaft (Through floor to water)
        const shaftGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.y = -2;
        shaft.name = 'shaft';
        pumpGroup.add(shaft);

        // Pump Casing (Submerged)
        const casingGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const casing = new THREE.Mesh(casingGeo, pipeMat);
        casing.position.y = -5;
        pumpGroup.add(casing);

        // Discharge Pipe (Rising)
        const pipeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -5, 0),
            new THREE.Vector3(0, 0.5, -1),
            new THREE.Vector3(0, 1, -2),
            new THREE.Vector3(0, 1, -4) // To header
        ]);
        const pipeGeo = new THREE.TubeGeometry(pipeCurve, 20, 0.25, 8, false);
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pumpGroup.add(pipe);
    });

    // Discharge Header
    const headerGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
    headerGeo.rotateZ(Math.PI/2);
    const header = new THREE.Mesh(headerGeo, pipeMat);
    header.position.set(0, 1, -4);
    mainGroup.add(header);


    // 4. Flow Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100; // Hide
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xa5f3fc,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Water Level Animation
      if (waterMeshRef.current) {
          // Map 0-100% to Y: -7 to -1
          const targetY = -7.5 + (waterLevel / 100) * 7.5;
          const targetHeight = (waterLevel / 100) * 7.5;
          
          waterMeshRef.current.position.y += (targetY - waterMeshRef.current.position.y + targetHeight/2) * 0.1;
          waterMeshRef.current.scale.y += (targetHeight - waterMeshRef.current.scale.y) * 0.1;
          
          // Turbidity color
          const clearColor = new THREE.Color(0x0ea5e9);
          const dirtyColor = new THREE.Color(0x57534e);
          (waterMeshRef.current.material as THREE.MeshPhysicalMaterial).color.lerpColors(clearColor, dirtyColor, turbidity);
      }

      // 2. Pumps Rotation
      pumpsRef.current.forEach((grp, i) => {
          const state = pumps[i];
          const shaft = grp.getObjectByName('shaft');
          if (shaft && state.isRunning) {
              shaft.rotation.y -= 0.5 * state.speed;
          }
      });

      // 3. Particles Flow
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const activeCount = Math.floor(flowRate / 20); // Scale particle count by flow
          
          for(let i=0; i<pCount; i++) {
              if (i > activeCount) {
                  positions[i*3+1] = -100;
                  continue;
              }
              
              // Reset particle
              if (positions[i*3+1] < -10 || positions[i*3+2] < -5) {
                   // Pick a random running pump
                   const runningPumps = pumps.map((p, idx) => p.isRunning ? idx : -1).filter(idx => idx !== -1);
                   if (runningPumps.length > 0) {
                       const pIdx = runningPumps[Math.floor(Math.random() * runningPumps.length)];
                       const pumpX = pumpPositions[pIdx];
                       positions[i*3] = pumpX + (Math.random()-0.5)*0.2;
                       positions[i*3+1] = -5; // Pump intake
                       positions[i*3+2] = 0;
                   } else {
                       positions[i*3+1] = -100;
                   }
              }

              // Flow logic
              const x = positions[i*3];
              const y = positions[i*3+1];
              const z = positions[i*3+2];

              if (y < 1 && z > -3) {
                  // Rising in pump pipe
                  positions[i*3+1] += 0.2;
                  positions[i*3+2] -= 0.05; // Move back towards header
              } else if (z > -6) {
                  // In header
                  positions[i*3+2] -= 0.2;
                  // Converge X to header outlet (say right side)
                  positions[i*3] += 0.1;
              }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
  }, [waterLevel, pumps, flowRate, turbidity]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
