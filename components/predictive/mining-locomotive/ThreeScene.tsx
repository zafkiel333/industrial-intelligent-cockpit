import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocomotiveSceneProps } from './three-types';

export const LocomotiveThreeScene: React.FC<LocomotiveSceneProps> = ({
  speed,
  pantographHeight,
  isSparking,
  brakeTemp,
  motorTemp,
  viewMode,
  trackCurvature
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const locoGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const pantographRef = useRef<THREE.Group | null>(null);
  const sparkSystemRef = useRef<THREE.Points | null>(null);
  const tunnelRef = useRef<THREE.Group | null>(null);

  const dynamicPropsRef = useRef({
    speed,
    pantographHeight,
    isSparking,
    brakeTemp,
    motorTemp,
    viewMode,
    trackCurvature
  });

  useEffect(() => {
    dynamicPropsRef.current = {
      speed,
      pantographHeight,
      isSparking,
      brakeTemp,
      motorTemp,
      viewMode,
      trackCurvature
    };
  }, [speed, pantographHeight, isSparking, brakeTemp, motorTemp, viewMode, trackCurvature]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-locomotive useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // 优化雾效：降低密度（从0.03→0.01），让雾更淡，提升整体亮度
    scene.fog = new THREE.FogExp2(0x020409, 0.01);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 6, 12);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 提升曝光度（从1.5→2.2），显著增强整体亮度
    renderer.toneMappingExposure = 2.2;
    
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // --- 大幅增强光照系统 ---
    // 1. 环境光：强度从0.2提升到0.8，提供更强的基础照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 2. 新增半球光：提供自然的上下环境补光，避免底部过暗
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemisphereLight.position.set(0, 5, 0);
    scene.add(hemisphereLight);

    // 3. 底部补光：专门照亮车轮/底盘区域，解决底部暗部问题
    const bottomFillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    bottomFillLight.position.set(0, -5, 0);
    bottomFillLight.target.position.set(0, 0, 0);
    scene.add(bottomFillLight);
    scene.add(bottomFillLight.target);

    // 4. 头灯：强度从10提升到30，照射距离从50→80，扩大照明范围
    const headLight = new THREE.SpotLight(0xffffff, 30, 80, 0.5, 0.5);
    headLight.position.set(5, 2, 0);
    headLight.target.position.set(20, 0, 0);
    scene.add(headLight);
    scene.add(headLight.target);

    // 5. 隧道灯：强度从1提升到4，扩大照明范围（从30→50）
    const tunnelLight = new THREE.PointLight(0xffaa00, 4, 50);
    tunnelLight.position.set(0, 8, 0);
    scene.add(tunnelLight);

    // --- 材质缓存ref（未修改任何颜色属性）---
    const materialRef = {
      bodyMat: new THREE.MeshPhysicalMaterial({
        color: 0xfacc15, // 保持原有颜色
        metalness: 0.2,
        roughness: 0.4,
        clearcoat: 0.5,
        transparent: dynamicPropsRef.current.viewMode === 'xray',
        opacity: dynamicPropsRef.current.viewMode === 'xray' ? 0.2 : 1.0
      }),
      steelMat: new THREE.MeshStandardMaterial({ 
        color: 0x334155, metalness: 0.8, roughness: 0.3 // 保持原有颜色
      }),
      thermalMat: new THREE.MeshBasicMaterial({ color: 0xff0000 }) // 保持原有颜色
    };

    // --- Geometry（未修改任何模型/颜色）---
    const locoGroup = new THREE.Group();
    locoGroupRef.current = locoGroup;
    scene.add(locoGroup);

    // 1. Chassis & Body
    const chassisGeo = new THREE.BoxGeometry(8, 1, 3);
    const chassis = new THREE.Mesh(chassisGeo, materialRef.steelMat);
    chassis.position.y = 1;
    locoGroup.add(chassis);

    const cabGeo = new THREE.BoxGeometry(2.5, 3, 2.8);
    const cab = new THREE.Mesh(cabGeo, materialRef.bodyMat);
    cab.position.set(2.5, 3, 0);
    locoGroup.add(cab);

    const engineBodyGeo = new THREE.BoxGeometry(5, 2, 2.8);
    const engineBody = new THREE.Mesh(engineBodyGeo, materialRef.bodyMat);
    engineBody.position.set(-1.5, 2.5, 0);
    locoGroup.add(engineBody);

    // 2. Wheels (2 Axles)
    wheelsRef.current = [];
    [-2.5, 2.5].forEach(x => {
        const axleGroup = new THREE.Group();
        axleGroup.position.x = x;
        locoGroup.add(axleGroup);

        const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.2), materialRef.steelMat);
        axle.rotation.x = Math.PI/2;
        axle.position.y = 0.8;
        axleGroup.add(axle);

        // Wheels
        [-1.5, 1.5].forEach(z => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.4, 32), materialRef.steelMat);
            wheel.rotation.x = Math.PI/2;
            wheel.position.set(0, 0.8, z);
            
            // Add brake disc visual
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16), materialRef.steelMat.clone());
            disc.rotation.x = Math.PI/2;
            disc.position.set(0, 0.8, z * 0.8);
            disc.name = 'brakeDisc'; // Tag for thermal update
            
            axleGroup.add(wheel);
            axleGroup.add(disc);
        });
        
        // Motor (Ghosted in Xray)
        const motor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({color: 0x475569}));
        motor.position.set(0, 1.5, 0);
        motor.name = 'tractionMotor'; // Tag
        axleGroup.add(motor);

        wheelsRef.current.push(axleGroup);
    });

    // 3. Pantograph (Scissor style)
    const pantoGroup = new THREE.Group();
    pantoGroup.position.set(-2, 3.5, 0);
    pantographRef.current = pantoGroup;
    locoGroup.add(pantoGroup);

    const baseP = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), materialRef.steelMat);
    pantoGroup.add(baseP);

    // Arms (Simplified)
    const armLower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), materialRef.steelMat);
    armLower.position.set(0, 1, 0);
    armLower.rotation.z = -0.5; // Folded
    armLower.name = 'armLower';
    pantoGroup.add(armLower);

    const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), materialRef.steelMat);
    armUpper.position.set(0.8, 2.5, 0); // Approx tip of lower
    armUpper.rotation.z = 0.5;
    armUpper.name = 'armUpper';
    pantoGroup.add(armUpper);
    
    const slider = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.4), new THREE.MeshStandardMaterial({color: 0x333333}));
    slider.position.set(0, 3.5, 0); // Top
    slider.name = 'slider';
    pantoGroup.add(slider);

    // 4. Sparks Particle System
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(pGeo, pMat);
    sparkSystemRef.current = sparks;
    locoGroup.add(sparks);

    // 5. Tunnel Environment (Moving lines to simulate speed)
    const tunnelGroup = new THREE.Group();
    tunnelRef.current = tunnelGroup;
    scene.add(tunnelGroup);
    
    for(let i=0; i<20; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.2, 8, 16, Math.PI), new THREE.MeshBasicMaterial({color: 0x1e293b, transparent: true, opacity: 0.3}));
        ring.position.x = -50 + i * 10;
        ring.position.y = 4;
        ring.rotation.y = Math.PI / 2;
        tunnelGroup.add(ring);

        // Wall Lights
        const lightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), new THREE.MeshBasicMaterial({color: 0xffaa00}));
        lightMesh.position.set(-50 + i * 10, 8, 3);
        tunnelGroup.add(lightMesh);
    }

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      const {
        speed: currentSpeed,
        pantographHeight: currentPantoHeight,
        isSparking: currentIsSparking,
        brakeTemp: currentBrakeTemp,
        motorTemp: currentMotorTemp,
        viewMode: currentViewMode
      } = dynamicPropsRef.current;

      // 实时更新body材质的xray模式（未修改颜色）
      if (materialRef.bodyMat.transparent !== (currentViewMode === 'xray')) {
        materialRef.bodyMat.transparent = currentViewMode === 'xray';
        materialRef.bodyMat.opacity = currentViewMode === 'xray' ? 0.2 : 1.0;
        materialRef.bodyMat.needsUpdate = true;
      }

      // 1. Wheel Rotation (Speed)
      const rotSpeed = currentSpeed / 10; 
      wheelsRef.current.forEach(w => {
          w.children.forEach(c => {
              if (c.geometry.type === 'CylinderGeometry' && c.name !== 'brakeDisc') {
                  c.rotation.y -= rotSpeed;
              }
          });
      });

      // 2. Locomotive Movement Simulation (Tunnel moving back)
      if (tunnelRef.current) {
          tunnelRef.current.position.x += rotSpeed * 2;
          if (tunnelRef.current.position.x > 10) tunnelRef.current.position.x -= 10;
      }
      
      // 3. Locomotive Sway (Vibration)
      if (locoGroupRef.current) {
          locoGroupRef.current.position.y = Math.sin(time * 20) * 0.02 * (currentSpeed / 10);
          locoGroupRef.current.rotation.z = Math.sin(time * 5) * 0.01;
          locoGroupRef.current.rotation.y = Math.sin(time * 2) * 0.02;
      }

      // 4. Pantograph Dynamics
      if (pantographRef.current) {
          const ext = 1 + currentPantoHeight * 2;
          const slider = pantographRef.current.getObjectByName('slider');
          if (slider) {
              slider.position.y = ext;
              
              if (currentIsSparking && sparkSystemRef.current) {
                  const positions = sparkSystemRef.current.geometry.attributes.position.array as Float32Array;
                  for(let i=0; i<pCount; i++) {
                      if (Math.random() > 0.8) {
                          positions[i*3] = slider.position.x - 2 + (Math.random()-0.5)*0.5;
                          positions[i*3+1] = slider.position.y + 3.5;
                          positions[i*3+2] = slider.position.z + (Math.random()-0.5)*0.5;
                      }
                      positions[i*3] -= currentSpeed * 0.1;
                      positions[i*3+1] -= 0.1;
                  }
                  sparkSystemRef.current.geometry.attributes.position.needsUpdate = true;
                  (sparkSystemRef.current.material as THREE.PointsMaterial).opacity = 1;
              } else if (sparkSystemRef.current) {
                  (sparkSystemRef.current.material as THREE.PointsMaterial).opacity = 0;
              }
          }
      }

      // 5. Thermal Visualization（仅修改热模式下的发光属性，未修改基础颜色）
      wheelsRef.current.forEach(axle => {
          const discs = axle.children.filter(c => c.name === 'brakeDisc');
          discs.forEach((d: any) => {
             const mat = d.material as THREE.MeshStandardMaterial;
             if (currentViewMode === 'thermal') {
                 const tNorm = Math.min(1, (currentBrakeTemp - 50) / 300);
                 const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
                 mat.color.copy(color);
                 mat.emissive.copy(color);
                 mat.emissiveIntensity = tNorm;
             } else {
                 mat.color.setHex(0x334155);
                 mat.emissive.setHex(0x000000);
             }
             mat.needsUpdate = true;
          });
          
          const motor = axle.getObjectByName('tractionMotor') as THREE.Mesh;
          if (motor) {
             const mat = motor.material as THREE.MeshStandardMaterial;
             if (currentViewMode === 'thermal') {
                 const tNorm = Math.min(1, (currentMotorTemp - 50) / 100);
                 const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
                 mat.color.copy(color);
                 mat.emissive.copy(color);
                 mat.emissiveIntensity = tNorm;
             } else {
                 mat.color.setHex(0x475569);
                 mat.emissive.setHex(0x000000);
             }
             mat.needsUpdate = true;
          }
      });

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
      materialRef.bodyMat.dispose();
      materialRef.steelMat.dispose();
      materialRef.thermalMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};