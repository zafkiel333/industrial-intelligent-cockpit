import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DisconnectSceneProps } from './three-types';

export const DisconnectSwitchScene: React.FC<DisconnectSceneProps> = ({ 
  switchState,
  bladeAngle,
  contactTemp,
  wearLevel,
  sparkIntensity,
  showThermal
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const contactGlowRef = useRef<THREE.PointLight[]>([]);

  // 2026.03.02 - Bug修复：创建ref存储实时props值，避免依赖项变化触发useEffect重复执行
  // Bug情况：3D模型频繁闪烁，场景反复初始化
  // Bug原因：useEffect依赖数组包含bladeAngle/contactTemp等频繁变化的props，导致每次变量更新都会重新创建场景、渲染器等核心对象
  const switchStateRef = useRef(switchState);
  const bladeAngleRef = useRef(bladeAngle);
  const contactTempRef = useRef(contactTemp);
  const wearLevelRef = useRef(wearLevel);
  const sparkIntensityRef = useRef(sparkIntensity);
  const showThermalRef = useRef(showThermal);

  // 单独更新ref值，确保动画循环能获取最新props，且不触发场景重建
  useEffect(() => {
    switchStateRef.current = switchState;
    bladeAngleRef.current = bladeAngle;
    contactTempRef.current = contactTemp;
    wearLevelRef.current = wearLevel;
    sparkIntensityRef.current = sparkIntensity;
    showThermalRef.current = showThermal;
  }, [switchState, bladeAngle, contactTemp, wearLevel, sparkIntensity, showThermal]);

  // 核心场景初始化逻辑：仅依赖mountRef，确保只在挂载/卸载时执行一次
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-disconnect useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Industrial dark fog
    scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 12, 10);
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
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 2;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const heatLight = new THREE.PointLight(0xff4500, 0, 10); // Dynamic heat light
    heatLight.position.set(0, 4, 0);
    scene.add(heatLight);
    contactGlowRef.current = [heatLight];

    // --- Materials ---
    const porcelainMat = new THREE.MeshPhysicalMaterial({
        color: 0x574c41, // Brown ceramic
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0
    });

    const aluminumMat = new THREE.MeshStandardMaterial({ 
        color: 0xcbd5e1, metalness: 0.6, roughness: 0.3 
    });

    const copperMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, metalness: 0.7, roughness: 0.3
    });

    const contactMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Will be tinted by heat
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x000000
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Base Frame
    const baseGeo = new THREE.BoxGeometry(10, 0.5, 2);
    const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({color: 0x334155}));
    mainGroup.add(base);

    // Insulators (Post type)
    const insulatorGeo = new THREE.CylinderGeometry(0.6, 0.8, 3.5, 16);
    // Add rings for sheds
    const sheds = new THREE.Group();
    for(let i=0; i<8; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.15, 8, 16), porcelainMat);
        ring.rotation.x = Math.PI/2;
        ring.position.y = -1.5 + i * 0.45;
        sheds.add(ring);
    }

    // Left Insulator
    const leftPost = new THREE.Group();
    leftPost.position.set(-3, 2, 0);
    const insL = new THREE.Mesh(insulatorGeo, porcelainMat);
    leftPost.add(insL);
    leftPost.add(sheds.clone());
    mainGroup.add(leftPost);

    // Right Insulator
    const rightPost = new THREE.Group();
    rightPost.position.set(3, 2, 0);
    const insR = new THREE.Mesh(insulatorGeo, porcelainMat);
    rightPost.add(insR);
    rightPost.add(sheds.clone());
    mainGroup.add(rightPost);

    // --- Rotating Arms (Blades) ---
    // Horizontal Center Break style
    
    // Left Arm Group (Rotates on top of left insulator)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-3, 4, 0); // Top of insulator
    mainGroup.add(leftArmGroup);
    leftArmRef.current = leftArmGroup;

    // Mechanism Housing
    const housingGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
    const housingL = new THREE.Mesh(housingGeo, aluminumMat);
    leftArmGroup.add(housingL);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(3.2, 0.2, 0.4);
    bladeGeo.translate(1.6, 0, 0); // Pivot at end
    const bladeL = new THREE.Mesh(bladeGeo, aluminumMat);
    bladeL.position.y = 0.5;
    leftArmGroup.add(bladeL);

    // Contact Finger (The tip)
    const contactGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);
    const contactL = new THREE.Mesh(contactGeo, contactMat);
    contactL.position.set(3.2, 0.5, 0);
    contactL.name = "contact";
    leftArmGroup.add(contactL);

    // Right Arm Group
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(3, 4, 0);
    mainGroup.add(rightArmGroup);
    rightArmRef.current = rightArmGroup;

    const housingR = new THREE.Mesh(housingGeo, aluminumMat);
    rightArmGroup.add(housingR);

    // Blade
    const bladeGeoR = new THREE.BoxGeometry(3.2, 0.2, 0.4);
    bladeGeoR.translate(-1.6, 0, 0); // Pivot at end
    const bladeR = new THREE.Mesh(bladeGeoR, aluminumMat);
    bladeR.position.y = 0.5;
    rightArmGroup.add(bladeR);

    // Contact Jaw (The receiver)
    const jawGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const jawR = new THREE.Mesh(jawGeo, contactMat);
    jawR.position.set(-3.2, 0.5, 0);
    jawR.name = "contact";
    rightArmGroup.add(jawR);

    // Spark Particles
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.2, transparent: true, opacity: 0 });
    const sparks = new THREE.Points(pGeo, pMat);
    scene.add(sparks);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // Blade Rotation - 读取ref中最新的bladeAngle值
      const rad = bladeAngleRef.current * Math.PI / 180;
      if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.y = -rad;
          rightArmRef.current.rotation.y = rad;
      }

      // Thermal & Wear Visualization - 读取ref中最新的热/磨损/显示状态值
      const targetColor = new THREE.Color(0xffffff);
      if (showThermalRef.current) {
          // Heat map logic: Temp > 50 starts glowing orange -> red
          const tNorm = Math.min(1, Math.max(0, (contactTempRef.current - 40) / 100)); // 40C to 140C range
          const heatColor = new THREE.Color().setHSL(0.1 - tNorm * 0.1, 1.0, 0.5 + tNorm * 0.3); // Orange to White Hot
          
          mainGroup.traverse((child) => {
              if (child.name === 'contact' && child instanceof THREE.Mesh) {
                  (child.material as THREE.MeshStandardMaterial).color.lerp(heatColor, 0.1);
                  (child.material as THREE.MeshStandardMaterial).emissive.copy(heatColor);
                  (child.material as THREE.MeshStandardMaterial).emissiveIntensity = tNorm * 2;
              }
          });

          // Glow light
          if (contactGlowRef.current[0]) {
              contactGlowRef.current[0].intensity = tNorm * 5;
              contactGlowRef.current[0].color = heatColor;
          }
      } else {
          // Standard view: Wear shows as darkening/roughness - 读取ref中最新的磨损值
          mainGroup.traverse((child) => {
              if (child.name === 'contact' && child instanceof THREE.Mesh) {
                  const m = child.material as THREE.MeshStandardMaterial;
                  m.color.setHex(0xb45309); // Copper/Silver base
                  m.emissive.setHex(0x000000);
                  // Wear -> darker
                  const darkening = 1 - (wearLevelRef.current / 200);
                  m.color.multiplyScalar(darkening);
              }
          });
          if (contactGlowRef.current[0]) contactGlowRef.current[0].intensity = 0;
      }

      // Spark Animation - 读取ref中最新的火花强度值
      if (sparkIntensityRef.current > 0) {
          const positions = sparks.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              if (Math.random() > 0.9) {
                  // Reset to center
                  positions[i*3] = (Math.random()-0.5)*0.5;
                  positions[i*3+1] = 4.5 + (Math.random()-0.5)*0.5;
                  positions[i*3+2] = (Math.random()-0.5)*0.5;
              } else {
                  // Fly out
                  positions[i*3] += (Math.random()-0.5)*0.2;
                  positions[i*3+1] += (Math.random()-0.5)*0.2;
                  positions[i*3+2] += (Math.random()-0.5)*0.2;
              }
          }
          sparks.geometry.attributes.position.needsUpdate = true;
          (sparks.material as THREE.PointsMaterial).opacity = sparkIntensityRef.current;
      } else {
          (sparks.material as THREE.PointsMaterial).opacity = 0;
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
      // 清理几何体和材质，防止内存泄漏
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
    };
  }, [mountRef]); // 仅依赖mountRef，确保场景只初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};