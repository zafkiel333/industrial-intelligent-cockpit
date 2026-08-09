import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StatorSceneProps } from './three-types';

export const StatorWindingScene: React.FC<StatorSceneProps> = ({ 
  activeSlot = null,
  pdLocation,
  tempMap = [],
  vibrationAmp = 0,
  wireframe = false
}) => {
  // ========== 核心改造：用 ref 存储所有需要剔除依赖的 props ==========
  const activeSlotRef = useRef<number | null>(activeSlot);
  const pdLocationRef = useRef<any>(pdLocation);
  const vibrationAmpRef = useRef<number>(vibrationAmp);
  const wireframeRef = useRef<boolean>(wireframe);

  // 同步 props 到 ref（每次 props 更新时执行，不触发重渲染），2026.02.28,修复了canvas闪烁的bug，成因：依赖项反复更新导致useEffect多次触发
  activeSlotRef.current = activeSlot;
  pdLocationRef.current = pdLocation;
  vibrationAmpRef.current = vibrationAmp;
  wireframeRef.current = wireframe;

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const windingsRef = useRef<THREE.Group | null>(null);
  const pdSpriteRef = useRef<THREE.Sprite | null>(null);
  // 新增：存储绕组mesh，用于动态更新activeSlot的材质
  const windingBarsRef = useRef<THREE.Mesh[]>([]);
  // 新增：存储铁芯mesh，用于动态更新wireframe
  const coreMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    // console.log('activeSlot 引用:', activeSlotRef.current);
    // console.log('pdLocation 引用:', pdLocationRef.current);
    // console.log('tempMap 引用:', tempMap);
    // console.log('vibrationAmp 引用:', vibrationAmpRef.current);
    // console.log('wireframe 引用:', wireframeRef.current);

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 清空挂载节点，避免多canvas
    console.log("=== hydro-stator excute clear canvas ===");
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    scene.add(hemiLight);
    
    const purpleLight = new THREE.PointLight(0xd946ef, 1.5, 20);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 1.5, 20);
    blueLight.position.set(-5, -5, -5);
    scene.add(blueLight);

    // --- Geometry: Stator Core & Windings ---
    const group = new THREE.Group();
    windingsRef.current = group;
    scene.add(group);

    // 1. Core (Iron)
    const coreGeo = new THREE.CylinderGeometry(4, 4, 3, 64, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.5, 
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe: wireframeRef.current // 初始值用ref
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coreMeshRef.current = core; // 存储铁芯mesh到ref
    group.add(core);

    // Core Slots Visualization (Lines)
    const slotsCount = 48;
    for(let i=0; i<slotsCount; i++) {
        const angle = (i / slotsCount) * Math.PI * 2;
        const x = Math.cos(angle) * 3.95;
        const z = Math.sin(angle) * 3.95;
        
        // Vertical slot line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, -1.5, z),
            new THREE.Vector3(x, 1.5, z)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    }

    // 2. Windings (Copper Bars & End Turns)
    const windingMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Copper
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0xb45309,
        emissiveIntensity: 0.1
    });

    const activeWindingMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Hot/Active
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0xef4444,
        emissiveIntensity: 0.8
    });

    // 清空绕组mesh数组（避免重复渲染）
    windingBarsRef.current = [];
    for(let i=0; i<slotsCount; i++) {
        const angle = (i / slotsCount) * Math.PI * 2;
        const isSelected = activeSlotRef.current !== null && i === (activeSlotRef.current - 1);
        
        // Bar inside slot
        const barGeo = new THREE.BoxGeometry(0.1, 3.2, 0.1);
        const bar = new THREE.Mesh(barGeo, isSelected ? activeWindingMat : windingMat);
        bar.position.set(Math.cos(angle)*3.9, 0, Math.sin(angle)*3.9);
        bar.rotation.y = -angle;
        group.add(bar);
        windingBarsRef.current.push(bar); // 存储绕组bar到数组

        // Upper End Winding (Diamond shape approximation)
        const upperCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(angle)*3.9, 1.6, Math.sin(angle)*3.9),
            new THREE.Vector3(Math.cos(angle)*4.2, 2.0, Math.sin(angle)*4.2),
            new THREE.Vector3(Math.cos(angle + 0.1)*4.5, 2.2, Math.sin(angle + 0.1)*4.5), // Twist
        ]);
        const tubeGeo = new THREE.TubeGeometry(upperCurve, 8, 0.04, 6, false);
        const tube = new THREE.Mesh(tubeGeo, isSelected ? activeWindingMat : windingMat);
        group.add(tube);
        windingBarsRef.current.push(tube); // 存储上端绕组

        // Lower End Winding
        const lowerCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(angle)*3.9, -1.6, Math.sin(angle)*3.9),
            new THREE.Vector3(Math.cos(angle)*4.2, -2.0, Math.sin(angle)*4.2),
            new THREE.Vector3(Math.cos(angle - 0.1)*4.5, -2.2, Math.sin(angle - 0.1)*4.5), // Twist opp
        ]);
        const tubeGeoLow = new THREE.TubeGeometry(lowerCurve, 8, 0.04, 6, false);
        const tubeLow = new THREE.Mesh(tubeGeoLow, isSelected ? activeWindingMat : windingMat);
        group.add(tubeLow);
        windingBarsRef.current.push(tubeLow); // 存储下端绕组
    }

    // 3. Partial Discharge Effect (Sprite)
    const map = new THREE.TextureLoader().load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png' );
    const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, blending: THREE.AdditiveBlending } );
    const sprite = new THREE.Sprite( material );
    sprite.scale.set(1.5, 1.5, 1.5);
    sprite.visible = false;
    scene.add( sprite );
    pdSpriteRef.current = sprite;

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      console.log("===hydro-stator animate excute===");
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // ========== 1. 响应 vibrationAmp 变化（振动效果） ==========
      if (windingsRef.current && vibrationAmpRef.current > 0) {
          const scale = 1 + Math.sin(time * 20) * (vibrationAmpRef.current * 0.005);
          windingsRef.current.scale.set(1, scale, 1);
      } else if (windingsRef.current) {
          // 无振动时恢复原始缩放
          windingsRef.current.scale.set(1, 1, 1);
      }

      // ========== 2. 响应 pdLocation 变化（局部放电效果） ==========
      if (pdSpriteRef.current) {
          if (pdLocationRef.current) { 
             if (Math.random() > 0.8) {
                 pdSpriteRef.current.visible = true;
                 pdSpriteRef.current.material.opacity = Math.random();
                 const angle = time * 0.5;
                 pdSpriteRef.current.position.set(Math.cos(angle)*3.8, 1.8, Math.sin(angle)*3.8);
             } else {
                 pdSpriteRef.current.visible = false;
             }
          } else {
              pdSpriteRef.current.visible = false;
          }
      }

      // ========== 3. 响应 wireframe 变化（线框模式） ==========
      if (coreMeshRef.current && coreMeshRef.current.material) {
          // @ts-ignore 确保材质的wireframe属性同步最新值
          coreMeshRef.current.material.wireframe = wireframeRef.current;
          coreMeshRef.current.material.needsUpdate = true; // 强制更新材质
      }

      // ========== 4. 响应 activeSlot 变化（选中槽位高亮） ==========
      const currentActiveSlot = activeSlotRef.current;
      windingBarsRef.current.forEach((mesh, index) => {
          // 计算当前mesh对应的槽位索引（每3个mesh对应一个槽位：bar+upper+lower）
          const slotIndex = Math.floor(index / 3);
          const isSelected = currentActiveSlot !== null && slotIndex === (currentActiveSlot - 1);
          mesh.material = isSelected ? activeWindingMat : windingMat;
          mesh.material.needsUpdate = true; // 强制更新材质
      });

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
      console.log("===hydro-stator cleanup excute===");
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // 清空ref，避免内存泄漏
      windingBarsRef.current = [];
      coreMeshRef.current = null;
      pdSpriteRef.current = null;
      windingsRef.current = null;
      sceneRef.current = null;
    };
  }, []); // 依赖项为空，完全剔除所有props依赖,2026.02.28,修复了canvas闪烁的bug，成因：依赖项反复更新导致useEffect多次触发

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};