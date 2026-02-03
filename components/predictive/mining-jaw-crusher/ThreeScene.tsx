
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { JawCrusherSceneProps } from './three-types';

export const JawCrusherThreeScene: React.FC<JawCrusherSceneProps> = ({
  state,
  isRunning,
  viewMode,
  onPartSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const movableJawRef = useRef<THREE.Group | null>(null);
  const flywheelRef = useRef<THREE.Mesh | null>(null);
  const rocksRef = useRef<THREE.Points | null>(null);
  const togglePlateRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.03); // Dusty dark atmosphere

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const orangeLight = new THREE.PointLight(0xf97316, 2, 20); // Crusher internal glow
    orangeLight.position.set(0, 4, 0);
    scene.add(orangeLight);

    // --- Materials ---
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, metalness: 0.6, roughness: 0.7,
        transparent: viewMode === 'stress', opacity: viewMode === 'stress' ? 0.3 : 1.0
    });
    
    const jawPlateMat = new THREE.MeshStandardMaterial({
        color: 0x57534e, metalness: 0.3, roughness: 0.9 // Manganese steel look
    });

    const wearMat = new THREE.MeshStandardMaterial({
        color: 0xff0000, metalness: 0.2, roughness: 0.5
    });

    const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 0.8, roughness: 0.4
    });

    // --- Geometry Construction ---
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);

    // 1. Fixed Jaw (Front Frame)
    const fixedJawGeo = new THREE.BoxGeometry(1.5, 6, 4);
    const fixedJaw = new THREE.Mesh(fixedJawGeo, frameMat);
    fixedJaw.position.set(2, 3, 0);
    fixedJaw.rotation.z = -0.1; // Slight angle
    fixedJaw.userData = { id: 'fixed-jaw' };
    machineGroup.add(fixedJaw);

    // Fixed Jaw Plate (Wear liner)
    const fixedPlateGeo = new THREE.BoxGeometry(0.5, 5.5, 3.5);
    const fixedPlate = new THREE.Mesh(fixedPlateGeo, viewMode === 'wear' ? wearMat : jawPlateMat);
    fixedPlate.position.set(1.2, 3, 0);
    fixedPlate.rotation.z = -0.1;
    machineGroup.add(fixedPlate);

    // 2. Movable Jaw Assembly
    const movableGroup = new THREE.Group();
    // Pivot at top (Eccentric Shaft location)
    movableGroup.position.set(-1, 5.5, 0); 
    movableJawRef.current = movableGroup;
    machineGroup.add(movableGroup);

    // Jaw Body
    const movJawGeo = new THREE.BoxGeometry(1.5, 6, 3.5);
    const movJaw = new THREE.Mesh(movJawGeo, frameMat);
    movJaw.position.set(0, -2.5, 0); // Hang down
    movJaw.rotation.z = 0.2; // Angle towards fixed
    movableGroup.add(movJaw);
    
    // Movable Jaw Plate
    const movPlateGeo = new THREE.BoxGeometry(0.5, 5.5, 3.5);
    const movPlate = new THREE.Mesh(movPlateGeo, viewMode === 'wear' ? wearMat : jawPlateMat);
    movPlate.position.set(0.8, -2.5, 0);
    movPlate.rotation.z = 0.2;
    movableGroup.add(movPlate);

    // 3. Side Frames
    const sideGeo = new THREE.BoxGeometry(6, 4, 0.5);
    const sideL = new THREE.Mesh(sideGeo, frameMat);
    sideL.position.set(0, 2, 2.25);
    machineGroup.add(sideL);
    
    const sideR = new THREE.Mesh(sideGeo, frameMat);
    sideR.position.set(0, 2, -2.25);
    machineGroup.add(sideR);

    // 4. Flywheel
    const flywheelGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    flywheelGeo.rotateX(Math.PI/2);
    const flywheel = new THREE.Mesh(flywheelGeo, wheelMat);
    flywheel.position.set(-1, 5.5, 2.8);
    flywheelRef.current = flywheel;
    machineGroup.add(flywheel);

    // 5. Toggle Plate (Rear Support)
    const toggleGeo = new THREE.BoxGeometry(2, 0.2, 3);
    const toggle = new THREE.Mesh(toggleGeo, new THREE.MeshStandardMaterial({color: 0x78350f}));
    toggle.position.set(-2.5, 1, 0);
    toggle.rotation.z = -0.5;
    togglePlateRef.current = toggle;
    machineGroup.add(toggle);

    // 6. Rock Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 1.5 + 0.5; // Between jaws
        pPos[i*3+1] = Math.random() * 6; // Height
        pPos[i*3+2] = (Math.random()-0.5) * 3;
        pSizes[i] = Math.random() * 0.2 + 0.05;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xa8a29e,
        size: 0.1,
        vertexColors: false,
        transparent: true,
        opacity: 0.8
    });
    const rocks = new THREE.Points(pGeo, pMat);
    rocksRef.current = rocks;
    machineGroup.add(rocks);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(machineGroup.children, true);
        if (hits.length > 0) {
            onPartSelect('JawPlate'); // Simplified selection
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

      if (isRunning) {
          // Eccentric Motion
          const ecc = 0.15;
          const speed = state.rpm / 60 * 0.5;
          
          if (movableJawRef.current) {
              // The top pivots on eccentric, bottom is constrained by toggle
              // Simplified visual: Circular motion at top, rocking at bottom
              movableJawRef.current.position.x = -1 + Math.cos(time * 20) * ecc;
              movableJawRef.current.position.y = 5.5 + Math.sin(time * 20) * ecc;
              
              // Toggle plate interaction
              // Rocking angle
              movableJawRef.current.rotation.z = Math.sin(time * 20) * 0.05;
          }

          if (flywheelRef.current) {
              flywheelRef.current.rotation.z -= 0.2;
          }

          // Rocks Falling
          if (rocksRef.current) {
              const positions = rocksRef.current.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pCount; i++) {
                  positions[i*3+1] -= 0.1; // Fall
                  
                  // "Crushing" effect: Jitter X/Z as they fall
                  if (positions[i*3+1] < 4 && positions[i*3+1] > 0) {
                      positions[i*3] += (Math.random()-0.5)*0.05;
                  }

                  // Reset
                  if (positions[i*3+1] < -1) {
                      positions[i*3+1] = 6;
                      positions[i*3] = (Math.random()-0.5) * 1.5 + 0.5;
                  }
              }
              rocksRef.current.geometry.attributes.position.needsUpdate = true;
          }
      }

      // View Mode Updates
      if (viewMode === 'wear') {
           // Highlight jaw plates red/orange based on height (lower wears faster)
           // Simplified: Mat color set above, maybe pulse intensity
           (fixedPlate.material as THREE.MeshStandardMaterial).emissive.setHex(0xef4444);
           (fixedPlate.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(time)*0.2;
      } else {
           (fixedPlate.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [state, isRunning, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
