import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaftSceneProps } from './three-types';

export const ShaftBearingScene: React.FC<ShaftSceneProps> = ({ 
  rpm = 150, 
  runoutX = 0, 
  runoutY = 0, 
  oilFilmThickness = 1,
  padTemperatures = [],
  showOilFlow = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shaftRef = useRef<THREE.Group | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);
  const padsRef = useRef<THREE.Mesh[]>([]);

  // 2026.02.28 - Bug修复：使用ref缓存实时props值，避免因依赖项频繁变化触发useEffect重渲染
  // Bug情况：useEffect依赖项（rpm/runoutX/runoutY/padTemperatures等）频繁变化导致3D模型反复初始化，出现闪烁
  // Bug原因：原代码将所有动态props放入useEffect依赖数组，每次props变化都会重建整个3D场景，引发渲染闪烁
  const propsRef = useRef({
    rpm,
    runoutX,
    runoutY,
    oilFilmThickness,
    padTemperatures,
    showOilFlow
  });

  // 实时更新ref中的props值，不触发useEffect
  useEffect(() => {
    propsRef.current = {
      rpm,
      runoutX,
      runoutY,
      oilFilmThickness,
      padTemperatures,
      showOilFlow
    };

    // 处理oilFlow显示/隐藏的即时切换
    if (oilParticlesRef.current) {
      if (showOilFlow && !oilParticlesRef.current.parent) {
        const housingGroup = oilParticlesRef.current.parent || sceneRef.current?.children.find(child => (child as THREE.Group).name === 'housingGroup');
        housingGroup && housingGroup.add(oilParticlesRef.current);
      } else if (!showOilFlow && oilParticlesRef.current.parent) {
        oilParticlesRef.current.removeFromParent();
      }
    }
  }, [rpm, runoutX, runoutY, oilFilmThickness, padTemperatures, showOilFlow]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-shaft useEffect===");
    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020409, 0.08); // Darker, denser fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 4, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Enable tone mapping for glowing effects
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); // Added
    scene.add(hemiLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 20);
    blueLight.position.set(5, 5, 5);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    purpleLight.position.set(-5, -2, -5);
    scene.add(purpleLight);

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Materials
    const chromeMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      metalness: 0.6, // Reduced from 1.0
      roughness: 0.3, // Increased from 0.1
    });
    
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.5, // Reduced
      roughness: 0.4
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.3
    });

    // 1. The Main Shaft (Rotating Part)
    const shaftGroup = new THREE.Group();
    shaftRef.current = shaftGroup;
    mainGroup.add(shaftGroup);

    // Shaft Cylinder
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 32);
    const shaftMesh = new THREE.Mesh(shaftGeo, chromeMat);
    shaftGroup.add(shaftMesh);

    // Thrust Collar (The disk that sits on pads)
    const collarGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 64);
    const collarMesh = new THREE.Mesh(collarGeo, chromeMat);
    collarMesh.position.y = 0; // Center point
    shaftGroup.add(collarMesh);

    // Generator Rotor Hub (Upper part representation)
    const rotorHubGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const rotorHub = new THREE.Mesh(rotorHubGeo, darkSteelMat);
    rotorHub.position.y = 3;
    shaftGroup.add(rotorHub);

    // Turbine Flange (Lower part)
    const flangeGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.3, 32);
    const flange = new THREE.Mesh(flangeGeo, darkSteelMat);
    flange.position.y = -3.8;
    shaftGroup.add(flange);

    // 2. Thrust Bearing Pads (Stationary)
    const padGroup = new THREE.Group();
    padGroup.position.y = -0.3; // Below collar
    mainGroup.add(padGroup);

    const padCount = 12;
    padsRef.current = [];
    
    for(let i=0; i<padCount; i++) {
        const angle = (i / padCount) * Math.PI * 2;
        // Create a pie-slice shape for pad
        const shape = new THREE.Shape();
        const rInner = 1.0;
        const rOuter = 2.4;
        const span = (Math.PI * 2 / padCount) * 0.8; // 80% coverage, 20% gap
        
        shape.moveTo(Math.cos(-span/2)*rInner, Math.sin(-span/2)*rInner);
        shape.lineTo(Math.cos(-span/2)*rOuter, Math.sin(-span/2)*rOuter);
        // Approximate arc
        const segments = 5;
        for(let j=1; j<=segments; j++) {
            const a = -span/2 + (span * j / segments);
            shape.lineTo(Math.cos(a)*rOuter, Math.sin(a)*rOuter);
        }
        shape.lineTo(Math.cos(span/2)*rInner, Math.sin(span/2)*rInner);
        for(let j=segments-1; j>=0; j--) {
            const a = -span/2 + (span * j / segments);
            shape.lineTo(Math.cos(a)*rInner, Math.sin(a)*rInner);
        }

        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        const padGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Rotate to flat
        padGeo.rotateX(-Math.PI/2);
        
        const padMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.5 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.rotation.y = -angle;
        padGroup.add(pad);
        padsRef.current.push(pad);
    }

    // 3. Oil Tank / Housing (Transparent)
    const tankGeo = new THREE.CylinderGeometry(3.5, 3.5, 2, 32, 1, true);
    const tank = new THREE.Mesh(tankGeo, glassMat);
    tank.position.y = 0;
    // Tank floor
    const floorGeo = new THREE.RingGeometry(0.85, 3.5, 32);
    floorGeo.rotateX(-Math.PI/2);
    const floor = new THREE.Mesh(floorGeo, darkSteelMat);
    floor.position.y = -1;
    
    const housingGroup = new THREE.Group();
    housingGroup.name = 'housingGroup'; // 增加名称便于查找
    housingGroup.add(tank);
    housingGroup.add(floor);
    mainGroup.add(housingGroup);

    // 4. Guide Bearing (Upper)
    const guideGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32, 1, true);
    const guide = new THREE.Mesh(guideGeo, new THREE.MeshStandardMaterial({color: 0xb45309, side: THREE.DoubleSide}));
    guide.position.y = 1.5;
    mainGroup.add(guide);

    // 5. Oil Particles
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = 1.2 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        pPos[i*3] = r * Math.cos(theta);
        pPos[i*3+1] = -0.5 + Math.random() * 1.0; // In the tank area
        pPos[i*3+2] = r * Math.sin(theta);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xf59e0b, // Oil Gold
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    oilParticlesRef.current = particles;
    if (showOilFlow) {
        housingGroup.add(particles);
    }

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 2026.02.28 - 读取ref中的最新props值，避免依赖项触发重渲染
      const currentProps = propsRef.current;

      // Shaft Rotation
      if (shaftRef.current) {
          // 使用ref中的最新rpm值
          const rotSpeed = (currentProps.rpm / 60) * Math.PI * 2 * 0.016; // approx per frame
          shaftRef.current.rotation.y -= rotSpeed;

          // Vibration / Runout simulation
          // 使用ref中的最新runoutX/runoutY值
          shaftRef.current.position.x = Math.sin(time * 10) * (currentProps.runoutX / 1000); // Scale factor for visuals
          shaftRef.current.position.z = Math.cos(time * 10) * (currentProps.runoutY / 1000);
      }

      // Pad Heat Color
      if (currentProps.padTemperatures.length === padCount) {
          padsRef.current.forEach((pad, i) => {
              const temp = currentProps.padTemperatures[i];
              const mat = pad.material as THREE.MeshStandardMaterial;
              // Map temp 40-100 to Color
              if (temp > 90) mat.color.setHex(0xef4444); // Red
              else if (temp > 75) mat.color.setHex(0xf59e0b); // Orange
              else if (temp > 60) mat.color.setHex(0xeab308); // Yellow
              else mat.color.setHex(0x94a3b8); // Steel
              
              mat.emissive.setHex(temp > 80 ? 0xff0000 : 0x000000);
              mat.emissiveIntensity = temp > 80 ? 0.5 : 0;
          });
      }

      // Oil Flow
      if (oilParticlesRef.current && currentProps.showOilFlow) {
          oilParticlesRef.current.rotation.y -= 0.005; // Slow swirl
          const pos = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              // Bobbing effect
              pos[i*3+1] += Math.sin(time + pos[i*3]) * 0.002;
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 2026.02.28 - 增加防抖优化，减少resize触发频率
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (mountRef.current && renderer && camera) {
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout); // 清理防抖定时器
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // 清理几何体和材质，防止内存泄漏
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [showOilFlow]); // 仅保留初始化相关的依赖项，动态值通过ref读取

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};