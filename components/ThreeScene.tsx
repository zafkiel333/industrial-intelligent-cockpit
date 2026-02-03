import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Animatables, SceneType } from './three-types';
import * as SmartOps from './scene-builders/SmartOpsBuilder';
import * as Cockpit from './scene-builders/CockpitBuilder';
import * as SmartWater from './scene-builders/SmartWaterBuilder';
import * as Irrigation from './scene-builders/IrrigationBuilder';
import * as ContainerTerminal from './scene-builders/ContainerTerminalBuilder';
import * as InlandWaterway from './scene-builders/InlandWaterwayBuilder';
import * as GreenPort from './scene-builders/GreenPortBuilder';
import * as MaritimeSafety from './scene-builders/MaritimeSafetyBuilder';
interface ThreeSceneProps {
  type?: SceneType;
  color?: string;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ type = 'default', color = '#06b6d4' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const sceneType = type as SceneType;

  useEffect(() => {
    if (!mountRef.current) return;
    console.log('=== ThreeScene useEffect ===', Date.now()); 
    // 清理容器中可能存在的旧 Canvas (针对 HMR)
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }

    // Initial Size Calculation
    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = null; 
    // 2. 清空 group 中的粒子
    if(scene&&scene.group){
      scene.remove(scene.group);
    }

    // 3. 清空 scene 中的粒子
    if (scene) {
      scene.children.forEach(item => {
        if (item) {
          scene.remove(item);
        }
      });
    }


    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    //camera.position.z = 6;
    camera.position.set(0, 2, 6);
    //new
    const currentType = type as SceneType;
    
    if (SmartOps.isSmartOpsScene(currentType)) {
      SmartOps.setupSmartOpsCamera(camera, currentType);
    } 
    // else {
    //   camera.position.set(0, 0, 6);
    // }
    
    // -- Camera Strategy --
    else if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
      MaritimeSafety.setupMaritimeSafetyCamera(camera);
    } else if (GreenPort.isGreenPortScene(sceneType)) {
      GreenPort.setupGreenPortCamera(camera);
    } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
      InlandWaterway.setupInlandWaterwayCamera(camera);
    } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
      ContainerTerminal.setupContainerTerminalCamera(camera);
    } else if (Irrigation.isIrrigationScene(sceneType)) {
      Irrigation.setupIrrigationCamera(camera);
    } else if (SmartWater.isSmartWaterScene(sceneType)) {
      SmartWater.setupSmartWaterCamera(camera);
    } else if (Cockpit.isCockpitScene(sceneType)) {
      Cockpit.setupCockpitCamera(camera, sceneType);
    } 
    // else if (SmartOps.isSmartOpsScene(sceneType)) {
    //   SmartOps.setupSmartOpsCamera(camera, sceneType);
    // } 
    else {
      camera.position.set(0, 0, 6);
    }

    // Camera Positioning based on Type
    if (type === 'generator') {
      camera.position.set(0, 2, 7);
    } else if (type === 'transmission') {
      camera.position.set(0, 3, 9);
      camera.lookAt(0, 2, 0);
    } else if (type === 'pump') {
      camera.position.set(4, 2, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'outfall') {
      camera.position.set(3, 2, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'wastewater') {
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'wind-turbine') {
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 2, 0);
    } else if (type === 'ship') {
      camera.position.set(8, 4, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'berthing') {
      camera.position.set(5, 5, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'crane') {
      camera.position.set(6, 6, 10);
      camera.lookAt(0, 3, 0);
    } else if (type === 'buoy') {
      camera.position.set(0, 2, 8);
      camera.lookAt(0, 1, 0);
    } else if (type === 'tachometer') {
      camera.position.set(4, 3, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'mine-hoist') {
      camera.position.set(5, 2, 8);
      camera.lookAt(0, -1, 0);
    } else if (type === 'tbm') {
      camera.position.set(6, 3, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'drilling-rig') {
      camera.position.set(6, 4, 8);
      camera.lookAt(0, 1, 0);
    } else if (type === 'crusher') {
      camera.position.set(5, 3, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'flotation-cell') {
      camera.position.set(5, 4, 7);
      camera.lookAt(0, 0.5, 0);
    } else if (type === 'sand-maker') {
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 0, 0);
    }
  
    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    let controls: any;
    try {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true; 
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      if (type === 'transmission') {
         controls.maxPolarAngle = Math.PI / 2; 
      }
    } catch (e) {
      console.warn("OrbitControls failed to initialize", e);
    }
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
 


    // Dynamic light colors based on type
    let mainLightColor = color;
    if (type === 'generator') mainLightColor = '#f59e0b';
    if (type === 'transmission') mainLightColor = '#a855f7';
    if (type === 'pump') mainLightColor = '#06b6d4';
    if (type === 'outfall') mainLightColor = '#10b981';
    if (type === 'wastewater') mainLightColor = '#3b82f6';
    if (type === 'wind-turbine') mainLightColor = '#0ea5e9';
    if (type === 'ship') mainLightColor = '#38bdf8';
    if (type === 'berthing') mainLightColor = '#f97316';
    if (type === 'crane') mainLightColor = '#facc15';
    if (type === 'buoy') mainLightColor = '#eab308'; 
    if (type === 'tachometer') mainLightColor = '#d946ef';
    if (type === 'mine-hoist') mainLightColor = '#d97706'; 
    if (type === 'tbm') mainLightColor = '#ef4444';
    if (type === 'drilling-rig') mainLightColor = '#06b6d4';
    if (type === 'crusher') mainLightColor = '#f59e0b'; 
    if (type === 'flotation-cell') mainLightColor = '#8b5cf6';
    if (type === 'sand-maker') mainLightColor = '#eab308';
    
  
    const pointLight = new THREE.PointLight(mainLightColor, 3, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);


    const pointLight2 = new THREE.PointLight(0xffffff, 1, 20);
    pointLight2.position.set(-5, 0, 2);
    scene.add(pointLight2);

    const group = new THREE.Group();
    scene.add(group);
    if (group) {
      group.children.forEach(item => {
        if (item) {
          group.remove(item);
        }
      });
    }

    // Materials
    const geometry = new THREE.IcosahedronGeometry(1.5, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: mainLightColor, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15
    });
    const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const solidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.9,
      emissive: mainLightColor,
      emissiveIntensity: 0.15
    });
    const core = new THREE.Mesh(coreGeo, solidMaterial);

    const disposables: { dispose: () => void }[] = [];
    disposables.push(wireframeMaterial, solidMaterial);
    group.add(mesh);
    group.add(core);
    // Use a specific object to hold animated parts
    const animatables:  { 
        rotor?: THREE.Object3D, 
        particles?: THREE.Points, 
        shipGroup?: THREE.Group, 
        water?: THREE.Mesh, 
        lasers?: THREE.LineSegments[], 
        trolley?: THREE.Group, 
        hookGroup?: THREE.Group,
        buoyGroup?: THREE.Group,
        lanternLight?: THREE.PointLight,
        toneRing?: THREE.Group,
        hoistSheave?: THREE.Mesh,
        cage?: THREE.Group,
        counterWeight?: THREE.Mesh,
        ropes?: THREE.Line,
        tbmCutterhead?: THREE.Group,
        tbmDebris?: THREE.Points,
        drillString?: THREE.Group,
        topDrive?: THREE.Group,
        crusherCone?: THREE.Group,
        crusherRocks?: THREE.Points,
        flotationAgitator?: THREE.Group,
        flotationBubbles?: THREE.Points,
        flotationFroth?: THREE.Points,
        vsiRotor?: THREE.Group,
        vsiParticles?: THREE.Points
    } = {};
    // 2026.02.02，以下三段注释代码生成了另一套不受动画控制的静止3d模型，如需恢复需修复以下函数与现有3d模型生成代码的冲突
    // if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
    //   MaritimeSafety.initMaritimeSafetyScene(sceneType, group, animatables, disposables);
    // } else if (GreenPort.isGreenPortScene(sceneType)) {
    //   GreenPort.initGreenPortScene(sceneType, group, animatables, disposables);
    // } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
    //   InlandWaterway.initInlandWaterwayScene(sceneType, group, animatables, disposables);
    // } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
    //   ContainerTerminal.initContainerTerminalScene(sceneType, group, animatables, disposables);
    // } else if (Irrigation.isIrrigationScene(sceneType)) {
    //   Irrigation.initIrrigationScene(sceneType, group, animatables, disposables);
    // } else if (SmartWater.isSmartWaterScene(sceneType)) {
    //   SmartWater.initSmartWaterScene(sceneType, group, animatables, disposables);
    // } else if (Cockpit.isCockpitScene(sceneType)) {
    //   Cockpit.initCockpitScene(sceneType, group, animatables, disposables);
    // } else if (SmartOps.isSmartOpsScene(sceneType)) {
    //   SmartOps.initSmartOpsScene(sceneType, group, animatables, disposables, { wireframe: wireframeMaterial, solid: solidMaterial });
    // } else {
    //     const geometry = new THREE.IcosahedronGeometry(1.3, 2);
    //     disposables.push(geometry);
    //     const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    //     const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    //     disposables.push(coreGeo);
    //     const core = new THREE.Mesh(coreGeo, solidMaterial);
    //     group.add(mesh);
    //     group.add(core);
    // }
    
    // if (!Cockpit.isCockpitScene(sceneType) && 
    //     !SmartWater.isSmartWaterScene(sceneType) && 
    //     !Irrigation.isIrrigationScene(sceneType) &&
    //     !ContainerTerminal.isContainerTerminalScene(sceneType) &&
    //     !InlandWaterway.isInlandWaterwayScene(sceneType) &&
    //     !GreenPort.isGreenPortScene(sceneType) &&
    //     !MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
    //   group.rotation.x = 0.4;
    //   group.rotation.y = 0.6;
    // }
    
    // if (SmartOps.isSmartOpsScene(currentType)) {
    //   SmartOps.initSmartOpsScene(currentType, group, animatables, disposables, { wireframe: wireframeMaterial, solid: solidMaterial });
    // } else {
    //     const geometry = new THREE.IcosahedronGeometry(1.3, 2);
    //     disposables.push(geometry);
    //     const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    //     const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    //     disposables.push(coreGeo);
    //     const core = new THREE.Mesh(coreGeo, solidMaterial);
    //     group.add(mesh);
    //     group.add(core);
    // }


    
    // --- GEOMETRY GENERATION ---
    if (type === 'turbine') {
        console.log("=== turbine group ===");
        const geometry = new THREE.TorusKnotGeometry(1, 0.35, 128, 32, 2, 3);
        disposables.push(geometry);
        const mesh = new THREE.Mesh(geometry, wireframeMaterial);
        const coreGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 32);
        coreGeo.rotateX(Math.PI / 2);
        disposables.push(coreGeo);
        const core = new THREE.Mesh(coreGeo, solidMaterial);
        group.add(mesh);
        group.add(core);
    } else if (type === 'generator') {
        console.log("=== generator group ===");
        const statorGeo = new THREE.CylinderGeometry(2.2, 2.2, 3, 32, 4, true);
        disposables.push(statorGeo);
        const stator = new THREE.Mesh(statorGeo, wireframeMaterial);
        group.add(stator);
        const rotorGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.8, 64);
        disposables.push(rotorGeo);
        const rotorMat = new THREE.MeshStandardMaterial({color: 0x333333, metalness: 1.0, roughness: 0.4, emissive: 0xb45309, emissiveIntensity: 0.2});
        disposables.push(rotorMat);
        const rotor = new THREE.Mesh(rotorGeo, rotorMat);
        group.add(rotor);
        const capGeo = new THREE.RingGeometry(0.5, 2.2, 32);
        capGeo.rotateX(-Math.PI / 2);
        capGeo.translate(0, 1.5, 0);
        disposables.push(capGeo);
        const capTop = new THREE.Mesh(capGeo, solidMaterial);
        group.add(capTop);
        const capBottom = capTop.clone();
        capBottom.position.y = -3; 
        group.add(capBottom);
        const ringGeo = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
        disposables.push(ringGeo);
        const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }));
        group.add(ringMesh);
    } else if (type === 'transmission') {
        console.log("=== transmission group ===");
        const towerHeight = 7;
        const towerBaseWidth = 1.5;
        const towerTopWidth = 0.5;
        const towerGeo = new THREE.CylinderGeometry(towerTopWidth, towerBaseWidth, towerHeight, 4, 8, true);
        towerGeo.translate(0, towerHeight/2 - 2, 0);
        disposables.push(towerGeo);
        const tower = new THREE.Mesh(towerGeo, wireframeMaterial);
        group.add(tower);
        const armGeo = new THREE.BoxGeometry(3.5, 0.1, 0.2);
        disposables.push(armGeo);
        const armTop = new THREE.Mesh(armGeo, solidMaterial);
        armTop.position.set(0, 4, 0);
        group.add(armTop);
        const armMid = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 0.2), solidMaterial);
        armMid.position.set(0, 2.5, 0);
        group.add(armMid);
        const armBot = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.2), solidMaterial);
        armBot.position.set(0, 1, 0);
        group.add(armBot);
        const insGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        const insMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 });
        disposables.push(insGeo, insMat);
        [-1.5, 1.5].forEach(x => { const ins1 = new THREE.Mesh(insGeo, insMat); ins1.position.set(x, 3.6, 0); group.add(ins1); });
        [-2.0, 2.0].forEach(x => { const ins = new THREE.Mesh(insGeo, insMat); ins.position.set(x, 2.1, 0); group.add(ins); });
        [-1.5, 1.5].forEach(x => { const ins = new THREE.Mesh(insGeo, insMat); ins.position.set(x, 0.6, 0); group.add(ins); });
    } else if (type === 'pump') {
        console.log("=== pump group ===");
        const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
        disposables.push(motorGeo);
        const motor = new THREE.Mesh(motorGeo, solidMaterial);
        motor.position.y = 2.5;
        group.add(motor);
        const finGeo = new THREE.CylinderGeometry(1.3, 1.3, 2, 8, 1, true);
        disposables.push(finGeo);
        const fins = new THREE.Mesh(finGeo, wireframeMaterial);
        fins.position.y = 2.5;
        group.add(fins);
        const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
        disposables.push(shaftGeo);
        const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.2 }));
        shaft.position.y = 0.5;
        group.add(shaft);
        const voluteGeo = new THREE.SphereGeometry(1.8, 32, 16);
        voluteGeo.scale(1, 0.6, 1);
        disposables.push(voluteGeo);
        const volute = new THREE.Mesh(voluteGeo, solidMaterial);
        volute.position.y = -1.5;
        group.add(volute);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6, roughness: 0.4 });
        disposables.push(pipeMat);
        const inletGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 16);
        inletGeo.rotateZ(Math.PI / 2);
        inletGeo.translate(-2, -1.5, 0);
        disposables.push(inletGeo);
        const inlet = new THREE.Mesh(inletGeo, pipeMat);
        group.add(inlet);
        const outletGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 16);
        outletGeo.rotateX(Math.PI / 2);
        outletGeo.translate(0, -1.5, 2);
        disposables.push(outletGeo);
        const outlet = new THREE.Mesh(outletGeo, pipeMat);
        group.add(outlet);
    } else if (type === 'outfall') {
        console.log("=== outfall group ===");
        const wallGeo = new THREE.BoxGeometry(4, 5, 1);
        disposables.push(wallGeo);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 });
        disposables.push(wallMat);
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.z = -1;
        wall.position.y = 0;
        group.add(wall);
        const pipeGeo = new THREE.CylinderGeometry(1, 1, 3, 32, 1, true);
        pipeGeo.rotateX(Math.PI / 2);
        disposables.push(pipeGeo);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, side: THREE.DoubleSide });
        disposables.push(pipeMat);
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.z = 0.5;
        group.add(pipe);
        const particleCount = 100;
        const particles = new Float32Array(particleCount * 3);
        const particleGeo = new THREE.BufferGeometry();
        for(let i=0; i<particleCount; i++) {
             particles[i*3] = (Math.random() - 0.5) * 0.8;
             particles[i*3+1] = (Math.random() - 0.5) * 0.8;
             particles[i*3+2] = 2 + Math.random() * 2;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
        const pMat = new THREE.PointsMaterial({ color: 0x34d399, size: 0.08, transparent: true, opacity: 0.6 });
        disposables.push(particleGeo, pMat);
        const particleSystem = new THREE.Points(particleGeo, pMat);
        group.add(particleSystem);
        animatables.particles = particleSystem;
    } else if (type === 'wastewater') {
        console.log("=== wastewater group ===");
        const aeroGeo = new THREE.BoxGeometry(4, 1.5, 3);
        disposables.push(aeroGeo);
        const tankMat = new THREE.MeshStandardMaterial({ 
            color: 0x1e3a8a, 
            roughness: 0.2, 
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        disposables.push(tankMat);
        const aerationTank = new THREE.Mesh(aeroGeo, tankMat);
        aerationTank.position.set(-2, 0, 0);
        group.add(aerationTank);
        const bubbleCount = 150;
        const bubblePos = new Float32Array(bubbleCount * 3);
        const bubbleGeo = new THREE.BufferGeometry();
        for(let i=0; i<bubbleCount; i++) {
            bubblePos[i*3] = -3.5 + Math.random() * 3;
            bubblePos[i*3+1] = -0.7 + Math.random() * 1.5;
            bubblePos[i*3+2] = -1 + Math.random() * 2;
        }
        bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
        const bubbleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.6, transparent: true });
        disposables.push(bubbleGeo, bubbleMat);
        const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
        group.add(bubbles);
        animatables.particles = bubbles; // Reuse particles logic for bubbles
        const settlerGeo = new THREE.CylinderGeometry(2, 2, 1.5, 32);
        disposables.push(settlerGeo);
        const settler = new THREE.Mesh(settlerGeo, tankMat);
        settler.position.set(2.5, 0, 0);
        group.add(settler);
        const bridgeGeo = new THREE.BoxGeometry(4.2, 0.2, 0.4);
        disposables.push(bridgeGeo);
        const bridge = new THREE.Mesh(bridgeGeo, solidMaterial);
        bridge.position.set(2.5, 0.8, 0);
        group.add(bridge);
    } else if (type === 'wind-turbine') {
        console.log("=== wind-turbine group ===");
        const towerGeo = new THREE.CylinderGeometry(0.3, 0.6, 8, 32);
        towerGeo.translate(0, 4, 0);
        disposables.push(towerGeo);
        const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.1 });
        disposables.push(whiteMaterial);
        const tower = new THREE.Mesh(towerGeo, whiteMaterial);
        group.add(tower);
        const nacelleGeo = new THREE.BoxGeometry(1.5, 0.8, 1);
        disposables.push(nacelleGeo);
        const nacelle = new THREE.Mesh(nacelleGeo, whiteMaterial);
        nacelle.position.y = 8;
        nacelle.position.z = -0.3;
        group.add(nacelle);
        const rotorGroup = new THREE.Group();
        rotorGroup.position.set(0, 8, 0.5);
        group.add(rotorGroup);
        animatables.rotor = rotorGroup;
        const hubGeo = new THREE.ConeGeometry(0.4, 0.8, 16);
        hubGeo.rotateX(Math.PI / 2);
        disposables.push(hubGeo);
        const hub = new THREE.Mesh(hubGeo, whiteMaterial);
        rotorGroup.add(hub);
        const bladeGeo = new THREE.BoxGeometry(0.3, 4.5, 0.1);
        bladeGeo.translate(0, 2.25, 0);
        disposables.push(bladeGeo);
        for (let i = 0; i < 3; i++) {
           const blade = new THREE.Mesh(bladeGeo, whiteMaterial);
           blade.rotation.z = i * (Math.PI * 2 / 3);
           rotorGroup.add(blade);
        }
        // Wind particles
        const particleCount = 80;
        const particlePos = new Float32Array(particleCount * 3);
        const particleGeo = new THREE.BufferGeometry();
        for(let i=0; i<particleCount; i++) {
            particlePos[i*3] = -5 + Math.random() * 10;
            particlePos[i*3+1] = 5 + Math.random() * 5;
            particlePos[i*3+2] = 5 + Math.random() * 5;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.05, opacity: 0.6, transparent: true });
        disposables.push(particleGeo, pMat);
        const particles = new THREE.Points(particleGeo, pMat);
        group.add(particles);
        animatables.particles = particles;
    } else if (type === 'ship') {
      console.log("=== ship group ===");
        const shipGroup = new THREE.Group();
        group.add(shipGroup);
        animatables.shipGroup = shipGroup;
        const hullGeo = new THREE.BoxGeometry(2, 1.2, 8);
        disposables.push(hullGeo);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.4 });
        disposables.push(hullMat);
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0;
        shipGroup.add(hull);
        const bridgeGeo = new THREE.BoxGeometry(1.8, 1.5, 1.5);
        disposables.push(bridgeGeo);
        const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        disposables.push(bridgeMat);
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, 1.3, -2.5);
        shipGroup.add(bridge);
        const containerGeo = new THREE.BoxGeometry(1.5, 0.8, 4);
        disposables.push(containerGeo);
        const containerMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.8 });
        disposables.push(containerMat);
        const containers = new THREE.Mesh(containerGeo, containerMat);
        containers.position.set(0, 1, 1);
        shipGroup.add(containers);
        const waterGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
        waterGeo.rotateX(-Math.PI / 2);
        disposables.push(waterGeo);
        const waterMat = new THREE.MeshStandardMaterial({ 
            color: 0x0284c7, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1,
            metalness: 0.5,
            wireframe: true 
        });
        disposables.push(waterMat);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -0.5;
        group.add(water);
        animatables.water = water;
    } else if (type === 'berthing') {
        console.log("=== berthing group ===");
        const quayGeo = new THREE.BoxGeometry(4, 3, 12);
        disposables.push(quayGeo);
        const quayMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
        disposables.push(quayMat);
        const quay = new THREE.Mesh(quayGeo, quayMat);
        quay.position.set(-3, 0, 0);
        group.add(quay);
        const shipGroup = new THREE.Group();
        group.add(shipGroup);
        animatables.shipGroup = shipGroup;
        const hullSideGeo = new THREE.BoxGeometry(2, 4, 10);
        disposables.push(hullSideGeo);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.2 });
        disposables.push(hullMat);
        const hull = new THREE.Mesh(hullSideGeo, hullMat);
        hull.position.set(1.5, 0.5, 0);
        shipGroup.add(hull);
        const deckGeo = new THREE.BoxGeometry(1.8, 0.1, 9.8);
        disposables.push(deckGeo);
        const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
        deck.position.set(1.5, 2.5, 0);
        shipGroup.add(deck);
        const waterGeo = new THREE.PlaneGeometry(15, 15);
        waterGeo.rotateX(-Math.PI / 2);
        disposables.push(waterGeo);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, transparent: true, opacity: 0.5 });
        disposables.push(waterMat);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -1;
        group.add(water);
    } else if (type === 'crane') {
        console.log("=== crane group ===");
        const craneGroup = new THREE.Group();
        group.add(craneGroup);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
        const legGeo = new THREE.BoxGeometry(0.5, 6, 0.5);
        disposables.push(legGeo);
        const legL1 = new THREE.Mesh(legGeo, legMaterial); legL1.position.set(-4, 3, 2); craneGroup.add(legL1);
        const legL2 = new THREE.Mesh(legGeo, legMaterial); legL2.position.set(-4, 3, -2); craneGroup.add(legL2);
        const legR1 = new THREE.Mesh(legGeo, legMaterial); legR1.position.set(4, 3, 2); craneGroup.add(legR1);
        const legR2 = new THREE.Mesh(legGeo, legMaterial); legR2.position.set(4, 3, -2); craneGroup.add(legR2);
        const girderGeo = new THREE.BoxGeometry(12, 0.8, 1);
        disposables.push(girderGeo);
        const girder = new THREE.Mesh(girderGeo, legMaterial);
        girder.position.set(0, 6, 0);
        craneGroup.add(girder);
        const trolleyGroup = new THREE.Group();
        trolleyGroup.position.set(0, 6.5, 0); 
        craneGroup.add(trolleyGroup);
        animatables.trolley = trolleyGroup;
        const trolleyGeo = new THREE.BoxGeometry(1, 0.5, 1.2);
        disposables.push(trolleyGeo);
        const trolley = new THREE.Mesh(trolleyGeo, new THREE.MeshStandardMaterial({color: 0x334155}));
        trolleyGroup.add(trolley);
        const hookGroup = new THREE.Group();
        hookGroup.position.set(0, -2, 0); 
        trolleyGroup.add(hookGroup);
        animatables.hookGroup = hookGroup;
        const containerGeo = new THREE.BoxGeometry(2, 2, 4);
        disposables.push(containerGeo);
        const container = new THREE.Mesh(containerGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        container.position.y = -1.1; 
        hookGroup.add(container);
    } else if (type === 'buoy') {
        console.log("=== buoy group ===");
        const buoyGroup = new THREE.Group();
        group.add(buoyGroup);
        animatables.buoyGroup = buoyGroup;
        const hullGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
        disposables.push(hullGeo);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2 });
        disposables.push(hullMat);
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0;
        buoyGroup.add(hull);
        const towerGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
        disposables.push(towerGeo);
        const tower = new THREE.Mesh(towerGeo, hullMat);
        tower.position.y = 2.5;
        buoyGroup.add(tower);
        const lanternGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
        disposables.push(lanternGeo);
        const lantern = new THREE.Mesh(lanternGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 }));
        lantern.position.y = 4.2;
        buoyGroup.add(lantern);
        const light = new THREE.PointLight(0xffff00, 0, 20); 
        light.position.y = 4.5;
        buoyGroup.add(light);
        animatables.lanternLight = light;
        const waterGeo = new THREE.PlaneGeometry(30, 30, 64, 64);
        waterGeo.rotateX(-Math.PI / 2);
        disposables.push(waterGeo);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8, wireframe: true, transparent: true, opacity: 0.4 });
        disposables.push(waterMat);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -0.8;
        group.add(water);
        animatables.water = water;
    } else if (type === 'tachometer') {
        console.log("=== tachometer group ===");
        const tachGroup = new THREE.Group();
        group.add(tachGroup);
        const toneRingGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
        const teethGroup = new THREE.Group();
        const toothGeo = new THREE.BoxGeometry(0.3, 0.5, 0.5);
        for(let i=0; i<32; i++) {
            const tooth = new THREE.Mesh(toothGeo, solidMaterial);
            const angle = (i / 32) * Math.PI * 2;
            tooth.position.x = Math.cos(angle) * 2;
            tooth.position.z = Math.sin(angle) * 2;
            tooth.rotation.y = -angle;
            teethGroup.add(tooth);
        }
        disposables.push(toneRingGeo, toothGeo);
        const ringCore = new THREE.Mesh(toneRingGeo, solidMaterial);
        teethGroup.add(ringCore);
        tachGroup.add(teethGroup);
        animatables.toneRing = teethGroup;
        const sensorGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
        sensorGeo.rotateX(Math.PI/2);
        disposables.push(sensorGeo);
        const sensor = new THREE.Mesh(sensorGeo, new THREE.MeshStandardMaterial({ color: 0xd946ef }));
        sensor.position.set(2.5, 0, 0); 
        tachGroup.add(sensor);
        tachGroup.rotation.x = 0.5;
        tachGroup.rotation.y = 0.5;
    } else if (type === 'mine-hoist') {
        console.log("=== mine-hoist group ===");
        const hoistGroup = new THREE.Group();
        group.add(hoistGroup);
        const sheaveGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
        sheaveGeo.rotateZ(Math.PI / 2);
        disposables.push(sheaveGeo);
        const sheaveMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.6 });
        disposables.push(sheaveMat);
        const sheave = new THREE.Mesh(sheaveGeo, sheaveMat);
        sheave.position.y = 4;
        hoistGroup.add(sheave);
        animatables.hoistSheave = sheave;
        const cageGroup = new THREE.Group();
        cageGroup.position.set(-2.5, 0, 0);
        hoistGroup.add(cageGroup);
        animatables.cage = cageGroup;
        const cageGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
        disposables.push(cageGeo);
        const cage = new THREE.Mesh(cageGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true }));
        cageGroup.add(cage);
        const cwGeo = new THREE.BoxGeometry(1, 1.5, 0.5);
        disposables.push(cwGeo);
        const cw = new THREE.Mesh(cwGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
        cw.position.set(2.5, -2, 0);
        hoistGroup.add(cw);
        animatables.counterWeight = cw;
        const ropeGeo = new THREE.BufferGeometry();
        const ropePos = new Float32Array([
            -2.5, 0, 0, 
            -2.5, 4, 0, 
            2.5, 4, 0,  
            2.5, -2, 0  
        ]);
        ropeGeo.setAttribute('position', new THREE.BufferAttribute(ropePos, 3));
        const ropeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        disposables.push(ropeGeo, ropeMat);
        const ropes = new THREE.Line(ropeGeo, ropeMat);
        hoistGroup.add(ropes);
        animatables.ropes = ropes;
    } else if (type === 'tbm') {
        console.log("=== tbm group ===");
        const tbmGroup = new THREE.Group();
        group.add(tbmGroup);
        const cutterheadGroup = new THREE.Group();
        cutterheadGroup.position.z = 2.5; 
        cutterheadGroup.rotateX(Math.PI / 2); 
        tbmGroup.add(cutterheadGroup);
        animatables.tbmCutterhead = cutterheadGroup;
        const discGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 32);
        disposables.push(discGeo);
        const discMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.4 });
        disposables.push(discMat);
        const disc = new THREE.Mesh(discGeo, discMat);
        cutterheadGroup.add(disc);
        const bodyGeo = new THREE.CylinderGeometry(1.85, 1.85, 5, 32);
        bodyGeo.rotateX(Math.PI / 2);
        disposables.push(bodyGeo);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.5, metalness: 0.5 });
        disposables.push(bodyMat);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        tbmGroup.add(body);
        const particleCount = 100;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(particleCount * 3);
        for(let i=0; i<particleCount; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 3; 
            pPos[i*3+1] = -1.5 + Math.random(); 
            pPos[i*3+2] = 2.5 + Math.random(); 
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.05 });
        const particles = new THREE.Points(pGeo, pMat);
        disposables.push(pGeo);
        disposables.push(pMat);
        tbmGroup.add(particles);
        animatables.tbmDebris = particles;
        tbmGroup.rotation.y = -0.5;
    } else if (type === 'drilling-rig') {
        console.log("=== drilling-rig group ===");
        const rigGroup = new THREE.Group();
        group.add(rigGroup);
        const platGeo = new THREE.BoxGeometry(4, 0.5, 4);
        disposables.push(platGeo);
        const platform = new THREE.Mesh(platGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
        platform.position.y = 0;
        rigGroup.add(platform);
        const derrickHeight = 7;
        const derrickGeo = new THREE.CylinderGeometry(0.8, 2, derrickHeight, 4, 1, true);
        derrickGeo.translate(0, derrickHeight / 2, 0);
        derrickGeo.rotateY(Math.PI/4);
        disposables.push(derrickGeo);
        const derrick = new THREE.Mesh(derrickGeo, new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.3 }));
        rigGroup.add(derrick);
        const stringGroup = new THREE.Group();
        stringGroup.position.y = 5;
        rigGroup.add(stringGroup);
        animatables.drillString = stringGroup;
        const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 12);
        pipeGeo.translate(0, -4, 0);
        disposables.push(pipeGeo);
        const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
        stringGroup.add(pipe);
    } else if (type === 'crusher') {
        console.log("=== crusher group ===");
        const crusherGroup = new THREE.Group();
        group.add(crusherGroup);
        const frameGeo = new THREE.CylinderGeometry(2.5, 1.5, 3, 32, 1, true);
        disposables.push(frameGeo);
        const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide }));
        crusherGroup.add(frame);
        const hopperGeo = new THREE.ConeGeometry(3.5, 1.5, 32, 1, true);
        hopperGeo.translate(0, 2.25, 0);
        hopperGeo.rotateX(Math.PI);
        disposables.push(hopperGeo);
        const hopper = new THREE.Mesh(hopperGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }));
        crusherGroup.add(hopper);
        const mantleGroup = new THREE.Group();
        crusherGroup.add(mantleGroup);
        animatables.crusherCone = mantleGroup;
        const coneGeo = new THREE.ConeGeometry(1.2, 2.5, 32);
        disposables.push(coneGeo);
        const cone = new THREE.Mesh(coneGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }));
        cone.position.y = -0.5;
        mantleGroup.add(cone);
        const particleCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(particleCount * 3);
        for(let i=0; i<particleCount; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 2; 
            pPos[i*3+1] = 2 + Math.random() * 3; 
            pPos[i*3+2] = (Math.random() - 0.5) * 2; 
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.1 });
        const particles = new THREE.Points(pGeo, pMat);
        console.log('=== ThreeScene开始创建粒子 ===', Date.now()); 
        crusherGroup.add(particles);
        animatables.crusherRocks = particles;
        disposables.push(pGeo);
        disposables.push(pMat);
    } else if (type === 'flotation-cell') {
        console.log("=== flotation-cell group ===");
        const floatGroup = new THREE.Group();
        group.add(floatGroup);
        const tankGeo = new THREE.CylinderGeometry(2.5, 2.5, 3.5, 32, 1, true);
        disposables.push(tankGeo);
        const tankMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x8b5cf6, 
            roughness: 0.1, 
            metalness: 0.1, 
            transparent: true, 
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        floatGroup.add(tank);
        const mechGroup = new THREE.Group();
        floatGroup.add(mechGroup);
        animatables.flotationAgitator = mechGroup;
        const shaftGeo = new THREE.CylinderGeometry(0.15, 0.15, 4.5, 16);
        disposables.push(shaftGeo);
        const shaft = new THREE.Mesh(shaftGeo, solidMaterial);
        mechGroup.add(shaft);
        const bladeGeo = new THREE.BoxGeometry(1.5, 0.1, 0.4);
        disposables.push(bladeGeo);
        const blades1 = new THREE.Mesh(bladeGeo, solidMaterial);
        blades1.position.y = -1.5;
        mechGroup.add(blades1);
        const bubCount = 300;
        const bubGeo = new THREE.BufferGeometry();
        const bubPos = new Float32Array(bubCount * 3);
        for(let i=0; i<bubCount; i++) {
            bubPos[i*3] = (Math.random() - 0.5) * 4; 
            bubPos[i*3+1] = -1.5 + Math.random() * 3; 
            bubPos[i*3+2] = (Math.random() - 0.5) * 4; 
        }
        bubGeo.setAttribute('position', new THREE.BufferAttribute(bubPos, 3));
        const bubMat = new THREE.PointsMaterial({ color: 0xc4b5fd, size: 0.08, transparent: true, opacity: 0.6 });
        const bubbles = new THREE.Points(bubGeo, bubMat);
        floatGroup.add(bubbles);
        animatables.flotationBubbles = bubbles;
        disposables.push(bubGeo);
        disposables.push(bubMat);
    } else if (type === 'sand-maker') {
        console.log("=== sand-maker group ===");
        const vsiGroup = new THREE.Group();
        group.add(vsiGroup);
        const baseGeo = new THREE.CylinderGeometry(3, 3, 2, 32);
        disposables.push(baseGeo);
        const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x4b5563 }));
        base.position.y = -1;
        vsiGroup.add(base);
        const chamberGeo = new THREE.CylinderGeometry(3, 3, 1.5, 32, 2, true);
        chamberGeo.translate(0, 0.75, 0);
        disposables.push(chamberGeo);
        const chamberMat = new THREE.MeshBasicMaterial({ color: 0xeab308, wireframe: true, transparent: true, opacity: 0.3 });
        const chamber = new THREE.Mesh(chamberGeo, chamberMat);
        vsiGroup.add(chamber);
        const rotorGroup = new THREE.Group();
        vsiGroup.add(rotorGroup);
        animatables.vsiRotor = rotorGroup;
        const impellerGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 6);
        disposables.push(impellerGeo);
        const impeller = new THREE.Mesh(impellerGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        impeller.position.y = 0.5;
        rotorGroup.add(impeller);
        const pCount = 300;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for(let i=0; i<pCount; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 0.5;
            pPos[i*3+1] = 3 + Math.random();
            pPos[i*3+2] = (Math.random() - 0.5) * 0.5;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xfcd34d, size: 0.1 });
        const particles = new THREE.Points(pGeo, pMat);
        vsiGroup.add(particles);
        animatables.vsiParticles = particles;
        disposables.push(pGeo);
        disposables.push(pMat);
    } else {
        console.log("=== Default Sci-Fi Sphere group ===");
        // Default Sci-Fi Sphere
        const geometry = new THREE.IcosahedronGeometry(1.3, 2);
        disposables.push(geometry);
        const mesh = new THREE.Mesh(geometry, wireframeMaterial);
        const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
        disposables.push(coreGeo);
        const core = new THREE.Mesh(coreGeo, solidMaterial);
        group.add(mesh);
        group.add(core);
    }

    // Default Orientation
    if (type !== 'generator' && type !== 'transmission' && type !== 'pump' && type !== 'outfall' && type !== 'wastewater' && type !== 'wind-turbine' && type !== 'ship' && type !== 'berthing' && type !== 'crane' && type !== 'buoy' && type !== 'tachometer' && type !== 'mine-hoist' && type !== 'tbm' && type !== 'drilling-rig' && type !== 'crusher' && type !== 'flotation-cell' && type !== 'sand-maker') {
      group.rotation.x = 0.4;
      group.rotation.y = 0.6;
    }

    // Animation Loop
    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      // 1. 累加时间增量（用于驱动自动化动画）
      time += 0.02; 
      // 2. 更新轨道控制器（如果存在）
      if (controls) {
        controls.update();
      }
      
      // 3. 核心冲突解决：判断使用哪种动画模式
      if (SmartOps.isSmartOpsScene(currentType)) {
          // 如果是新版的 SmartOps 场景，调用自动化动画接口
          //console.log("=== SmartOpsScene animate ===");
          SmartOps.animateSmartOpsScene(currentType, animatables, time);
      } else {
          // 如果是旧版的常规场景，保留原有的简单旋转逻辑
          group.rotation.y += 0.005;
      }
      // 4. 执行渲染
      //renderer.render(scene, camera);

      if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
        MaritimeSafety.animateMaritimeSafetyScene(sceneType, animatables, time);
      } else if (GreenPort.isGreenPortScene(sceneType)) {
        GreenPort.animateGreenPortScene(sceneType, animatables, time);
      } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
        InlandWaterway.animateInlandWaterwayScene(sceneType, animatables, time);
      } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
        ContainerTerminal.animateContainerTerminalScene(sceneType, animatables, time);
      } else if (Irrigation.isIrrigationScene(sceneType)) {
        Irrigation.animateIrrigationScene(sceneType, animatables, time);
      } else if (SmartWater.isSmartWaterScene(sceneType)) {
        SmartWater.animateSmartWaterScene(sceneType, animatables, time);
      } else if (Cockpit.isCockpitScene(sceneType)) {
        Cockpit.animateCockpitScene(sceneType, animatables, time);
      } 
      // else if (SmartOps.isSmartOpsScene(sceneType)) {
      //   SmartOps.animateSmartOpsScene(sceneType, animatables, time);
      // }//重复if段
      // 2026.02.02，以下代码给模型赋予了第二套运动逻辑，虽然好像没有冲突，但是其好像加速了动画速度
      // // Animations
      // if (type === 'wind-turbine' && animatables.rotor) {
      //     animatables.rotor.rotation.z -= 0.05;
      //     if (animatables.particles) {
      //         const positions = animatables.particles.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<positions.length; i+=3) {
      //             positions[i+2] -= 0.1; 
      //             if (positions[i+2] < -5) positions[i+2] = 8;
      //         }
      //         animatables.particles.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'ship' && animatables.shipGroup) {
      //     animatables.shipGroup.rotation.x = Math.sin(time * 0.5) * 0.05; 
      //     animatables.shipGroup.rotation.z = Math.sin(time * 0.8) * 0.05; 
      //     if (animatables.water) animatables.water.position.y = -0.5 + Math.sin(time) * 0.05;
      // }
      // if (type === 'berthing' && animatables.shipGroup) {
      //     animatables.shipGroup.position.x = 1.5 + Math.sin(time * 0.5) * 0.05; 
      // }
      // if (type === 'crane' && animatables.trolley) {
      //     animatables.trolley.position.x = Math.sin(time * 0.5) * 3;
      // }
      // if (type === 'buoy' && animatables.buoyGroup) {
      //     animatables.buoyGroup.position.y = Math.sin(time * 1.5) * 0.3;
      //     animatables.buoyGroup.rotation.x = Math.sin(time * 1.2) * 0.15;
      //     animatables.buoyGroup.rotation.z = Math.cos(time * 1.1) * 0.15;
      //     if (animatables.lanternLight) {
      //         const flashCycle = time % 4;
      //         animatables.lanternLight.intensity = (flashCycle < 0.5) ? 5 : 0;
      //     }
      // }
      // if (type === 'tachometer' && animatables.toneRing) {
      //     animatables.toneRing.rotation.y -= 0.5;
      // }
      // if (type === 'mine-hoist') {
      //     const cycleTime = 10; 
      //     const progress = (time % cycleTime) / cycleTime; 
      //     const yPos = Math.sin(progress * Math.PI * 2) * 3 - 2; 
      //     if (animatables.hoistSheave) animatables.hoistSheave.rotation.x -= 0.05 * Math.cos(progress * Math.PI * 2);
      //     if (animatables.cage) animatables.cage.position.y = yPos;
      //     if (animatables.counterWeight) animatables.counterWeight.position.y = -yPos + 1;
      //     if (animatables.ropes) {
      //         const pos = animatables.ropes.geometry.attributes.position.array as Float32Array;
      //         pos[1] = yPos + 1.2; 
      //         pos[10] = -yPos + 1 + 0.7; 
      //         animatables.ropes.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'tbm') {
      //     if (animatables.tbmCutterhead) animatables.tbmCutterhead.rotation.z -= 0.05;
      //     if (animatables.tbmDebris) {
      //         const pos = animatables.tbmDebris.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<pos.length; i+=3) {
      //             pos[i] += (Math.random() - 0.5) * 0.1;
      //             pos[i+1] += (Math.random() - 0.5) * 0.1;
      //             if (Math.random() > 0.9) {
      //                 pos[i] = (Math.random() - 0.5) * 3;
      //                 pos[i+1] = -1.5 + Math.random();
      //             }
      //         }
      //         animatables.tbmDebris.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'drilling-rig' && animatables.drillString) {
      //     animatables.drillString.rotation.y += 0.2;
      // }
      // if (type === 'crusher' && animatables.crusherCone) {
      //   animatables.crusherCone.rotation.z = Math.sin(time * 10) * 0.05;
      //   animatables.crusherCone.rotation.x = Math.cos(time * 10) * 0.05;
      //   if (animatables.crusherRocks) {
      //       const pos = animatables.crusherRocks.geometry.attributes.position.array as Float32Array;
      //       for(let i=0; i<pos.length; i+=3) {                  
      //         pos[i+1] -= 0.15;
      //         if (pos[i+1] > 0) { pos[i] *= 0.98; pos[i+2] *= 0.98; }
      //         if (pos[i+1] < -2) {
      //             pos[i] = (Math.random() - 0.5) * 3;
      //             pos[i+1] = 3;
      //             pos[i+2] = (Math.random() - 0.5) * 3;
      //         }
      //       }
      //       animatables.crusherRocks.geometry.attributes.position.needsUpdate = true;
      //   }
      // }
      // if (type === 'flotation-cell') {
      //     if (animatables.flotationAgitator) animatables.flotationAgitator.rotation.y += 0.15;
      //     if (animatables.flotationBubbles) {
      //         const pos = animatables.flotationBubbles.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<pos.length; i+=3) {
      //             pos[i+1] += 0.02;
      //             const x = pos[i]; const z = pos[i+2];
      //             pos[i] = x * Math.cos(0.02) - z * Math.sin(0.02);
      //             pos[i+2] = x * Math.sin(0.02) + z * Math.cos(0.02);
      //             if (pos[i+1] > 1.5) { pos[i+1] = -1.5; pos[i] = (Math.random() - 0.5) * 4; pos[i+2] = (Math.random() - 0.5) * 4; }
      //         }
      //         animatables.flotationBubbles.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'sand-maker') {
      //     if (animatables.vsiRotor) animatables.vsiRotor.rotation.y -= 0.5;
      //     if (animatables.vsiParticles) {
      //         const pos = animatables.vsiParticles.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<pos.length; i+=3) {
      //             let x = pos[i]; let y = pos[i+1]; let z = pos[i+2];
      //             if (y > 0.5) { y -= 0.15; x *= 0.95; z *= 0.95; } 
      //             else if (y > -1.0) {
      //                 const angle = Math.atan2(z, x) - 0.5;
      //                 const r = Math.sqrt(x*x + z*z) + 0.4;
      //                 x = r * Math.cos(angle); z = r * Math.sin(angle); y -= 0.05;
      //             }
      //             if (y < -1.5 || (x*x + z*z > 12)) { x = (Math.random() - 0.5) * 0.5; y = 3 + Math.random(); z = (Math.random() - 0.5) * 0.5; }
      //             pos[i] = x; pos[i+1] = y; pos[i+2] = z;
      //         }
      //         animatables.vsiParticles.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      if (type === 'outfall' && animatables.particles) {
          // Outfall specific animation if needed (particles static jitter handled by material/re-creation usually, but let's add flow)
          // Simple jitter
      }

      renderer.render(scene, camera);
    };
    animate();

    // Robust Resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
           const newWidth = entry.contentRect.width;
           const newHeight = entry.contentRect.height;
           if (newWidth > 0 && newHeight > 0) {
             camera.aspect = newWidth / newHeight;
             camera.updateProjectionMatrix();
             renderer.setSize(newWidth, newHeight);
           }
        }
      }
    });
    
    resizeObserver.observe(mountRef.current);

    // Cleanup
    return () => {
      console.log("=== Cleanup all object ===")
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (controls) controls.dispose();
      if (group && scene) {
        scene.remove(group);
      }
      if(scene){
        scene.clear();
      }
      geometry.dispose();
      coreGeo.dispose();
      wireframeMaterial.dispose();
      disposables.forEach(d => d.dispose());
      solidMaterial.dispose();
      renderer.dispose();
      
    };
  }, [type, color]);

  return <div ref={mountRef} className="w-full h-full cursor-move z-0" title="Click and drag to rotate" />;
};