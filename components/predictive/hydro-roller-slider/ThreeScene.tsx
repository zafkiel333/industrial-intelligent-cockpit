import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RollerSceneProps } from './three-types';

export const RollerSliderScene: React.FC<RollerSceneProps> = ({ 
  wearLevel,
  rotationSpeed,
  contactStress,
  debrisAmount,
  lubricationMode,
  showHeatmap
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rollerRef = useRef<THREE.Group | null>(null);
  const trackRef = useRef<THREE.Mesh | null>(null);
  const debrisRef = useRef<THREE.Points | null>(null);

  // 2026.03.02 Bug修复：使用ref存储动态值，避免依赖项变化触发useEffect重渲染
  // Bug情况：模型频繁闪烁，useEffect反复执行导致3D场景被重复创建/销毁
  // Bug原因：useEffect依赖项（wearLevel/rotationSpeed等）是频繁变化的状态变量，每次变化都会触发useEffect重新执行
  // 修复方案：将动态依赖项存入ref，在动画循环中实时读取最新值，而非依赖useEffect重新渲染
  const dynamicValuesRef = useRef({
    wearLevel,
    rotationSpeed,
    contactStress,
    debrisAmount,
    lubricationMode,
    showHeatmap
  });

  // 实时更新ref中的值（不触发useEffect）
  useEffect(() => {
    dynamicValuesRef.current = {
      wearLevel,
      rotationSpeed,
      contactStress,
      debrisAmount,
      lubricationMode,
      showHeatmap
    };
  }, [wearLevel, rotationSpeed, contactStress, debrisAmount, lubricationMode, showHeatmap]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-roller-slider useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0502, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(10, 6, 10);
    camera.lookAt(0, 0, 0);

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
    controls.minDistance = 5;
    controls.maxDistance = 30;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.SpotLight(0xffffff, 3);
    mainLight.position.set(5, 10, 5);
    mainLight.angle = 0.5;
    mainLight.penumbra = 0.5;
    scene.add(mainLight);

    const wearLight = new THREE.PointLight(0xd97706, 1, 10); // Bronze/Rust glow
    wearLight.position.set(0, 1, 2);
    scene.add(wearLight);

    // --- Materials ---
    const rollerMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, // Steel base
        metalness: 0.8,
        roughness: 0.2
    });

    const trackMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.6,
        roughness: 0.7
    });

    const rustMat = new THREE.MeshStandardMaterial({
        color: 0x7c2d12,
        metalness: 0.1,
        roughness: 0.9
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Track / Rail
    const trackGeo = new THREE.BoxGeometry(20, 1, 4);
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.y = -0.5;
    trackRef.current = track;
    mainGroup.add(track);

    // 2. Roller Assembly
    const rollerGroup = new THREE.Group();
    rollerRef.current = rollerGroup;
    mainGroup.add(rollerGroup);

    // Wheel
    const wheelGeo = new THREE.CylinderGeometry(2, 2, 1.5, 64);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheel = new THREE.Mesh(wheelGeo, rollerMat.clone()); // Clone for dynamic update
    wheel.position.y = 2;
    rollerGroup.add(wheel);

    // Axle
    const axleGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.5, 32);
    axleGeo.rotateZ(Math.PI / 2);
    const axle = new THREE.Mesh(axleGeo, new THREE.MeshStandardMaterial({color: 0x334155, metalness: 0.7, roughness: 0.4}));
    axle.position.y = 2;
    rollerGroup.add(axle);

    // Side Brackets (simplified)
    const bracketGeo = new THREE.BoxGeometry(0.5, 3, 2);
    const bracketL = new THREE.Mesh(bracketGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    bracketL.position.set(-2, 2, 0);
    rollerGroup.add(bracketL);
    
    const bracketR = new THREE.Mesh(bracketGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    bracketR.position.set(2, 2, 0);
    rollerGroup.add(bracketR);

    // 3. Debris Particles (Spalling)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xd97706,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(pGeo, pMat);
    debrisRef.current = particles;
    mainGroup.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 2026.03.02 从ref中读取最新的动态值，保证实时性且不触发useEffect
      const { 
        wearLevel: currentWear, 
        rotationSpeed: currentRotSpeed,
        contactStress: currentStress,
        debrisAmount: currentDebris,
        lubricationMode: currentLube,
        showHeatmap: currentHeatmap
      } = dynamicValuesRef.current;

      // 1. Roller Motion (Oscillating on track)
      const xPos = Math.sin(time * currentRotSpeed * 0.5) * 6; // 使用实时旋转速度
      if (rollerRef.current) {
          rollerRef.current.position.x = xPos;
          
          // Rotate wheel based on movement (v = r * omega => omega = v/r)
          const wheelMesh = rollerRef.current.children[0] as THREE.Mesh;
          wheelMesh.rotation.x = -(xPos / 2); // Simple roll approx
      }

      // 2. Wear Visualization
      if (rollerRef.current) {
          const wheelMesh = rollerRef.current.children[0] as THREE.Mesh;
          const mat = wheelMesh.material as THREE.MeshStandardMaterial;

          // Update color/roughness based on wear
          const baseColor = new THREE.Color(0x94a3b8);
          const wornColor = new THREE.Color(0x574034); // Rusty brown
          
          mat.color.lerpColors(baseColor, wornColor, currentWear);
          mat.roughness = 0.2 + currentWear * 0.7; // Gets rougher
          mat.metalness = 0.8 - currentWear * 0.6; // Loses shine

          // Heatmap Overlay (Contact Stress)
          if (currentHeatmap) {
              mat.emissive.setHex(0xff0000);
              const pulse = (Math.sin(time * 10) + 1) * 0.5;
              mat.emissiveIntensity = currentStress * 0.8 * pulse;
          } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
          }
      }

      // 3. Debris Particles
      if (debrisRef.current && rollerRef.current) {
          const positions = debrisRef.current.geometry.attributes.position.array as Float32Array;
          const activeCount = Math.floor(pCount * currentDebris * currentWear);
          
          for(let i=0; i<pCount; i++) {
              if (i > activeCount) {
                  positions[i*3+1] = -100;
                  continue;
              }

              // Emit from bottom of roller
              if (positions[i*3+1] < 0 || positions[i*3+1] > 2) {
                  positions[i*3] = rollerRef.current.position.x + (Math.random()-0.5)*1.5;
                  positions[i*3+1] = 0; // Contact level
                  positions[i*3+2] = (Math.random()-0.5)*1.5;
              }

              // Fly out
              positions[i*3] += (Math.random()-0.5)*0.05;
              positions[i*3+1] += 0.05; // Up
              positions[i*3+2] += (Math.random()-0.5)*0.05;
          }
          debrisRef.current.geometry.attributes.position.needsUpdate = true;
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
      // 2026.03.02 补充清理：释放几何体和材质内存
      if (sceneRef.current) {
        sceneRef.current.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat: any) => mat.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }
    };
  }, []); // 2026.03.02 移除所有动态依赖项，仅在组件挂载/卸载时执行

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};