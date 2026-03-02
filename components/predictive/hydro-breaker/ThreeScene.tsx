import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BreakerSceneProps } from './three-types';

export const BreakerScene: React.FC<BreakerSceneProps> = ({ 
  breakerState,
  travelPosition,
  arcIntensity,
  springCompression,
  mechanismVibration,
  showInternal
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const movingPartsRef = useRef<THREE.Group[]>([]);
  const arcsRef = useRef<THREE.PointLight[]>([]);
  const springRef = useRef<THREE.Mesh | null>(null);
  const mechanismRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-breaker useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020204, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 调整1：提高整体曝光度（核心提亮手段）
    renderer.toneMappingExposure = 2.0; // 原1.5 → 2.0
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
    controls.target.set(0, 2, 0);
    // 2026.03.02 bug修复：初始渲染视角偏右，重新进入正常
    // bug原因：OrbitControls启用阻尼后，初始未执行update()同步状态，导致初始帧视角未应用target设置
    controls.update(); // 强制同步控件状态，确保初始视角正确

    // --- Lights ---
    // 调整2：增强环境光（基础照明）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 原0.2 → 0.5
    scene.add(ambientLight);

    // 调整3：增强聚光灯强度+优化照射范围
    const spotLight = new THREE.SpotLight(0xffffff, 10); // 原5 → 10
    spotLight.position.set(8, 12, 8); // 原(5,10,5) → 更高更广的位置
    spotLight.angle = 0.8; // 原0.5 → 0.8（照射范围更大）
    spotLight.penumbra = 0.3; // 原0.5 → 0.3（边缘更柔和）
    spotLight.castShadow = true; // 新增：开启阴影增强立体感
    scene.add(spotLight);

    // 调整4：增强蓝色点光强度+扩大范围
    const blueLight = new THREE.PointLight(0x0ea5e9, 4, 30); // 原2/20 → 4/30
    blueLight.position.set(-5, 8, -5); // 原-5,5,-5 → 稍高位置
    scene.add(blueLight);

    // 新增5：补充暖色调点光（平衡冷色，提亮暗部）
    const warmLight = new THREE.PointLight(0xfbbf24, 3, 25); 
    warmLight.position.set(5, 7, 5);
    scene.add(warmLight);

    // 新增6：添加平行光（模拟自然光，整体提亮）
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 15, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- Materials ---
    const porcelainMat = new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.2, // Slightly transparent
        opacity: 0.9,
        transparent: true,
        clearcoat: 1.0
    });

    const transparentPorcelainMat = new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.8,
        opacity: 0.3,
        transparent: true,
        side: THREE.DoubleSide
    });

    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b, metalness: 0.8, roughness: 0.3 
    });

    const copperMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, metalness: 0.6, roughness: 0.4
    });

    const springMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, metalness: 0.6, roughness: 0.4
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    
    // 1. Base Frame
    const baseGeo = new THREE.BoxGeometry(8, 0.5, 2);
    const base = new THREE.Mesh(baseGeo, steelMat);
    base.position.y = 0.25;
    mainGroup.add(base);

    // 2. Mechanism Box (Control)
    const mechBoxGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
    const mechBox = new THREE.Mesh(mechBoxGeo, steelMat);
    mechBox.position.set(-3, 1.5, 0);
    mainGroup.add(mechBox);
    mechanismRef.current = mechBox;

    // Spring inside mechanism
    const springGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
    // Create a spiral texture or shape? Simple cylinder for now, scaled vertically
    const spring = new THREE.Mesh(springGeo, springMat);
    spring.position.set(-3, 1.5, 0.8); // Visible on side
    spring.rotation.x = Math.PI / 2;
    mainGroup.add(spring);
    springRef.current = spring;

    // 3. Three Phases (Poles)
    movingPartsRef.current = [];
    arcsRef.current = [];

    const matToUse = showInternal ? transparentPorcelainMat : porcelainMat;

    [-1.5, 1.0, 3.5].forEach((x, i) => {
        const poleGroup = new THREE.Group();
        poleGroup.position.set(x, 0.5, 0);
        mainGroup.add(poleGroup);

        // Insulator Column (Support)
        const supportGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 16);
        const support = new THREE.Mesh(supportGeo, matToUse);
        support.position.y = 1.25;
        poleGroup.add(support);
        
        // Interrupting Chamber (Top T-shape)
        const chamberGeo = new THREE.CylinderGeometry(0.4, 0.4, 4, 16);
        chamberGeo.rotateZ(Math.PI / 2); // Horizontal? Or Vertical? Usually Vertical T or Y
        // Let's do T-shape Live Tank
        const chamberVerticalGeo = new THREE.CylinderGeometry(0.4, 0.4, 3, 16);
        const chamber = new THREE.Mesh(chamberVerticalGeo, matToUse);
        chamber.position.y = 4.0;
        poleGroup.add(chamber);

        // Terminals
        const termGeo = new THREE.BoxGeometry(1, 0.2, 0.5);
        const termTop = new THREE.Mesh(termGeo, steelMat);
        termTop.position.y = 5.5;
        poleGroup.add(termTop);
        
        const termBot = new THREE.Mesh(termGeo, steelMat);
        termBot.position.y = 2.5; // Connection point
        poleGroup.add(termBot);

        // Internal Moving Contact (Rod)
        const rodGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
        const rod = new THREE.Mesh(rodGeo, copperMat);
        rod.position.y = 3.5; // Initial center
        poleGroup.add(rod);
        movingPartsRef.current.push(rod);

        // Fixed Contact (Upper)
        const fixedContactGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
        const fixedContact = new THREE.Mesh(fixedContactGeo, copperMat);
        fixedContact.position.y = 5.0;
        poleGroup.add(fixedContact);

        // Arc Light
        const arcLight = new THREE.PointLight(0x00ffff, 0, 5);
        arcLight.position.set(x, 4.5, 0); // Gap location
        scene.add(arcLight);
        arcsRef.current.push(arcLight);
    });

    // Linkage Rod (Connecting mechanism to poles)
    const linkageGeo = new THREE.BoxGeometry(7, 0.1, 0.1);
    const linkage = new THREE.Mesh(linkageGeo, steelMat);
    linkage.position.set(1, 0.8, 0);
    mainGroup.add(linkage);

    // --- Animation Loop ---
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // 1. Mechanism Vibration
      if (mechanismRef.current) {
          mechanismRef.current.position.x = -3 + (Math.random() - 0.5) * mechanismVibration * 0.1;
      }

      // 2. Spring Compression Visual
      if (springRef.current) {
          // Scale Z (which is visual width due to rotation)
          const scale = 0.5 + (springCompression / 100) * 0.5;
          springRef.current.scale.y = scale; // Cylinder Y is length
      }

      // 3. Contact Movement
      movingPartsRef.current.forEach(rod => {
          // Travel 0 (Open) -> rod is low (e.g. y=3.0)
          // Travel 100 (Closed) -> rod is high touching fixed (e.g. y=4.5)
          // Range 1.5 units
          const targetY = 3.0 + (travelPosition / 100) * 1.5;
          rod.position.y = targetY;
      });

      // 4. Arc Intensity
      arcsRef.current.forEach(light => {
          light.intensity = arcIntensity * 5 + (Math.random() * arcIntensity * 5);
          light.color.setHSL(Math.random() * 0.1 + 0.5, 1.0, 0.5); // Blue-Cyan flicker
      });

      // Update materials based on mode
      const targetMat = showInternal ? transparentPorcelainMat : porcelainMat;
      // Note: In a real app we'd traverse and update, here we rely on initial setup or simpler toggle if needed. 
      // For performance in this snippet, assuming mode doesn't flip rapidly.

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
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
  }, [breakerState, travelPosition, arcIntensity, springCompression, mechanismVibration, showInternal]);

  return <div ref={mountRef} className="w-full h-full" />;
};