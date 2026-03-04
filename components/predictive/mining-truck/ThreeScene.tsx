import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MiningTruckSceneProps } from './three-types';

export const MiningTruckThreeScene: React.FC<MiningTruckSceneProps> = ({
  dumpAngle,
  steeringAngle,
  wheelSpeed,
  suspensionCompression,
  payload,
  activeComponent,
  isRunning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const truckGroupRef = useRef<THREE.Group | null>(null);
  const dumpBodyRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const exhaustRef = useRef<THREE.Points | null>(null);

  // 2026.03.04 - Bug修复：使用ref保存动态props值，避免因依赖项变化导致useEffect反复执行
  // Bug原因：原代码将所有动态props放入useEffect依赖数组，这些props频繁变化会导致场景反复初始化、销毁，引发模型闪烁
  const dynamicPropsRef = useRef({
    dumpAngle,
    steeringAngle,
    wheelSpeed,
    suspensionCompression,
    payload,
    activeComponent,
    isRunning
  });

  // 仅更新ref中的props值，不触发场景重建
  useEffect(() => {
    dynamicPropsRef.current = {
      dumpAngle,
      steeringAngle,
      wheelSpeed,
      suspensionCompression,
      payload,
      activeComponent,
      isRunning
    };
  }, [dumpAngle, steeringAngle, wheelSpeed, suspensionCompression, payload, activeComponent, isRunning]);

  // 场景初始化useEffect - 仅执行一次（依赖为空数组）
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-truck useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0500, 0.02); // 尘土飞扬的矿山氛围

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 8, 15);
    camera.lookAt(0, 2, 0);

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffd700, 1.5);
    sunLight.position.set(20, 30, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const groundLight = new THREE.PointLight(0xd97706, 0.5, 20); // 地面反射光
    groundLight.position.set(0, -2, 0);
    scene.add(groundLight);

    // --- Materials ---
    const yellowPaintMat = new THREE.MeshPhysicalMaterial({
        color: 0xfacc15, // Mining Yellow
        metalness: 0.1,
        roughness: 0.4,
        clearcoat: 0.2
    });

    const blackMetalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.6
    });

    const tireMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.9,
        metalness: 0.1
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.6,
        transparent: true,
        opacity: 0.5
    });

    const highlightMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    truckGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Chassis Frame
    const chassisGeo = new THREE.BoxGeometry(4, 1, 10);
    const chassis = new THREE.Mesh(chassisGeo, blackMetalMat);
    chassis.position.y = 1.5;
    mainGroup.add(chassis);

    // 2. Wheels
    wheelsRef.current = [];
    const wheelPositions = [
        { x: -3, z: 3.5, name: 'FL' }, // Front Left
        { x: 3, z: 3.5, name: 'FR' },  // Front Right
        { x: -3, z: -3.5, name: 'RL' }, // Rear Left (Duals)
        { x: 3, z: -3.5, name: 'RR' },  // Rear Right (Duals)
    ];

    wheelPositions.forEach(pos => {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(pos.x, 1.5, pos.z); // Center of wheel
        
        // Tire Geometry
        const tireRadius = 1.5;
        const tireWidth = 1.2;
        const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 32);
        tireGeo.rotateZ(Math.PI / 2);
        const tire = new THREE.Mesh(tireGeo, tireMat);
        wheelGroup.add(tire);

        // Rim
        const rimGeo = new THREE.CylinderGeometry(0.8, 0.8, tireWidth + 0.1, 16);
        rimGeo.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, yellowPaintMat);
        wheelGroup.add(rim);

        mainGroup.add(wheelGroup);
        wheelsRef.current.push(wheelGroup);
    });

    // 3. Superstructure (Deck & Cab)
    const deckGeo = new THREE.BoxGeometry(5, 0.2, 3);
    const deck = new THREE.Mesh(deckGeo, blackMetalMat);
    deck.position.set(0, 3.5, 4);
    mainGroup.add(deck);

    // Cab (Offset to left usually)
    const cabGroup = new THREE.Group();
    cabGroup.position.set(-1.5, 3.5, 4.5);
    mainGroup.add(cabGroup);
    
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 2), yellowPaintMat);
    cabBody.position.y = 0.9;
    cabGroup.add(cabBody);
    
    const cabWindow = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.8, 1.5), glassMat);
    cabWindow.position.y = 1.4;
    cabWindow.position.z = 0.3;
    cabGroup.add(cabWindow);

    // Engine Bay / Radiator
    const engineGeo = new THREE.BoxGeometry(3, 2, 2);
    const engine = new THREE.Mesh(engineGeo, yellowPaintMat);
    engine.position.set(1, 3, 4.5);
    mainGroup.add(engine);
    
    const grillGeo = new THREE.BoxGeometry(2.8, 1.5, 0.1);
    const grill = new THREE.Mesh(grillGeo, blackMetalMat);
    grill.position.set(1, 3, 5.5);
    mainGroup.add(grill);

    // 4. Dump Body (Tray)
    const dumpGroup = new THREE.Group();
    // Pivot point at rear
    dumpGroup.position.set(0, 3, -3.5); 
    dumpBodyRef.current = dumpGroup;
    mainGroup.add(dumpGroup);

    // Tray Shape - simplified with boxes
    // Floor
    const trayFloorGeo = new THREE.BoxGeometry(5.5, 0.5, 10);
    const trayFloor = new THREE.Mesh(trayFloorGeo, yellowPaintMat);
    trayFloor.position.set(0, 0.25, 1.5); // Extend forward relative to pivot
    dumpGroup.add(trayFloor);

    // Sides
    const sideGeo = new THREE.BoxGeometry(0.5, 3, 10);
    const sideL = new THREE.Mesh(sideGeo, yellowPaintMat);
    sideL.position.set(-2.5, 1.5, 1.5);
    dumpGroup.add(sideL);
    const sideR = new THREE.Mesh(sideGeo, yellowPaintMat);
    sideR.position.set(2.5, 1.5, 1.5);
    dumpGroup.add(sideR);

    // Front Wall (Headboard)
    const frontGeo = new THREE.BoxGeometry(5.5, 3, 0.5);
    const front = new THREE.Mesh(frontGeo, yellowPaintMat);
    front.position.set(0, 1.5, 6.25);
    dumpGroup.add(front);
    
    // Canopy (Protects Cab)
    const canopyGeo = new THREE.BoxGeometry(5.5, 0.5, 3);
    const canopy = new THREE.Mesh(canopyGeo, yellowPaintMat);
    canopy.position.set(0, 3, 7.5);
    canopy.rotation.x = -0.2;
    dumpGroup.add(canopy);

    // Payload Visual (Pile of rocks)
    const loadGeo = new THREE.ConeGeometry(2.5, 2, 8);
    const loadMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 1.0 });
    const loadMesh = new THREE.Mesh(loadGeo, loadMat);
    loadMesh.position.set(0, 1, 1.5);
    loadMesh.scale.z = 2;
    dumpGroup.add(loadMesh);

    // 5. Exhaust Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x555555,
        size: 0.2,
        transparent: true,
        opacity: 0.4,
    });
    const particles = new THREE.Points(pGeo, pMat);
    exhaustRef.current = particles;
    mainGroup.add(particles);

    // 6. Highlight Box (For active component)
    const highlightBox = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), highlightMat);
    highlightBox.visible = false;
    highlightBox.name = "highlight";
    mainGroup.add(highlightBox);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 从ref中获取最新的props值
      const {
        dumpAngle: currentDumpAngle,
        steeringAngle: currentSteeringAngle,
        wheelSpeed: currentWheelSpeed,
        suspensionCompression: currentSuspensionCompression,
        activeComponent: currentActiveComponent,
        isRunning: currentIsRunning
      } = dynamicPropsRef.current;

      // 1. Dump Body Animation
      if (dumpBodyRef.current) {
          const targetRot = -currentDumpAngle * (Math.PI / 180); // Tilt back (negative X rotation)
          dumpBodyRef.current.rotation.x += (targetRot - dumpBodyRef.current.rotation.x) * 0.05;
      }

      // 2. Suspension Compression & Body Roll
      // Adjust chassis height/tilt based on payload and corner compression
      if (truckGroupRef.current) {
          // Average compression affects Y
          const avgComp = (currentSuspensionCompression.fl + currentSuspensionCompression.fr + currentSuspensionCompression.rl + currentSuspensionCompression.rr) / 4;
          const targetY = -avgComp * 0.5; // Sink down
          truckGroupRef.current.position.y = THREE.MathUtils.lerp(truckGroupRef.current.position.y, targetY, 0.1);

          // Tilt (Roll and Pitch)
          const roll = (currentSuspensionCompression.fl + currentSuspensionCompression.rl) - (currentSuspensionCompression.fr + currentSuspensionCompression.rr);
          const pitch = (currentSuspensionCompression.fl + currentSuspensionCompression.fr) - (currentSuspensionCompression.rl + currentSuspensionCompression.rr);
          
          truckGroupRef.current.rotation.z = roll * 0.1; // Side tilt
          truckGroupRef.current.rotation.x = pitch * 0.05; // Front/Back tilt
      }

      // 3. Wheel Rotation & Steering
      wheelsRef.current.forEach((wheel, i) => {
          // Rotation
          wheel.rotation.x -= currentWheelSpeed * 0.1;
          
          // Steering (Front wheels: index 0 and 1)
          if (i < 2) {
              const steerRad = currentSteeringAngle * (Math.PI / 180);
              wheel.rotation.y = steerRad;
          }
      });

      // 4. Exhaust
      if (exhaustRef.current && currentIsRunning) {
          const positions = exhaustRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              if (positions[i*3+1] > 6) {
                  // Reset to exhaust pipe (approx pos)
                  positions[i*3] = 2.5;
                  positions[i*3+1] = 4;
                  positions[i*3+2] = 4;
              }
              positions[i*3] += 0.02 + Math.random()*0.01; // Drift right
              positions[i*3+1] += 0.05 + Math.random()*0.02; // Rise
              positions[i*3+2] += (Math.random()-0.5)*0.02;
          }
          exhaustRef.current.geometry.attributes.position.needsUpdate = true;
          exhaustRef.current.visible = true;
      } else if (exhaustRef.current) {
          exhaustRef.current.visible = false;
      }

      // 5. Highlight Active Component
      if (currentActiveComponent && highlightBox) {
          highlightBox.visible = true;
          // Simple mapping of IDs to positions
          if (currentActiveComponent === 'engine') {
              highlightBox.position.set(1, 3, 5);
              highlightBox.scale.set(3.2, 2.2, 2.2);
          } else if (currentActiveComponent === 'suspension-fl') {
              highlightBox.position.set(-3, 1, 3.5);
              highlightBox.scale.set(1, 2, 1);
          } else if (currentActiveComponent === 'tire-rl') {
              highlightBox.position.set(-3, 1.5, -3.5);
              highlightBox.scale.set(2, 3.2, 3.2);
          } else {
              highlightBox.visible = false;
          }
          // Pulse effect
          (highlightBox.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 5) * 0.2;
      } else {
          highlightBox.visible = false;
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
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // 2026.03.04 - 依赖数组置空，确保场景只初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};