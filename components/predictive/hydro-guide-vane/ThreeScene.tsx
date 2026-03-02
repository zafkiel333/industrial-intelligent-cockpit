import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GuideVaneSceneProps } from './three-types';

export const GuideVaneScene: React.FC<GuideVaneSceneProps> = ({ 
  opening, 
  servoPressure, 
  frictionIndex = [], 
  isMoving,
  showForces = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const ringRef = useRef<THREE.Group | null>(null);
  const vanesRef = useRef<THREE.Group[]>([]);
  const servosRef = useRef<THREE.Group[]>([]);

  // 2026.03.02 - Bug修复：使用ref保存实时props值，避免依赖项变化触发useEffect重渲染导致模型闪烁
  // Bug情况：原代码useEffect依赖props变量（opening/servoPressure等），这些变量频繁变化会导致useEffect反复执行，重新创建3D场景/渲染循环，引发模型闪烁
  // Bug原因：useEffect依赖项包含频繁更新的props，每次变化都会重新初始化整个3D场景（创建相机、渲染器、几何体等），导致视觉闪烁
  const openingRef = useRef(opening);
  const servoPressureRef = useRef(servoPressure);
  const frictionIndexRef = useRef(frictionIndex);
  const isMovingRef = useRef(isMoving);
  const showForcesRef = useRef(showForces);

  // 仅更新ref值，不触发3D场景重建
  useEffect(() => {
    openingRef.current = opening;
    servoPressureRef.current = servoPressure;
    frictionIndexRef.current = frictionIndex;
    isMovingRef.current = isMoving;
    showForcesRef.current = showForces;
  }, [opening, servoPressure, frictionIndex, isMoving, showForces]);

  // 核心3D场景初始化逻辑：仅执行一次（依赖项为空数组）
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-guide-vane useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // 2026.03.02 - 优化：降低雾的浓度，提升整体亮度，让叶片更清晰
    scene.fog = new THREE.FogExp2(0x0a0500, 0.02); // 雾浓度从0.04降至0.02

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // 2026.03.02 - 优化：调整相机位置，让叶片视角更清晰（稍微拉近+降低高度）
    camera.position.set(0, 8, 12); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 2026.03.02 - 优化：提升渲染器亮度（toneMappingExposure）
    renderer.toneMappingExposure = 1.2; // 默认1.0，提升至1.2增强整体亮度
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
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
    // 2026.03.02 - 优化：提升环境光强度（从0.3→0.6），让整体亮度提高
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 2026.03.02 - 优化：提升琥珀色点光源强度（从2→3），调整位置更贴近叶片
    const amberLight = new THREE.PointLight(0xf59e0b, 3, 30); // 强度+范围提升
    amberLight.position.set(3, 8, 6); // 位置调整，更聚焦叶片区域
    scene.add(amberLight);

    // 2026.03.02 - 优化：提升蓝色补光强度（从1→2），增加叶片细节对比度
    const blueLight = new THREE.PointLight(0x3b82f6, 2, 30); 
    blueLight.position.set(-3, 8, -6); 
    scene.add(blueLight);

    // 2026.03.02 - 新增：添加定向光，专门照射叶片，增强轮廓感
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 8); // 从斜上方照射叶片
    directionalLight.target.position.set(0, 0, 0); // 指向场景中心
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.7, roughness: 0.3 
    });
    
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, metalness: 0.6, roughness: 0.4
    });

    const activeServoMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.2
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Regulating Ring (The large ring that rotates)
    const ringGroup = new THREE.Group();
    ringRef.current = ringGroup;
    mainGroup.add(ringGroup);

    const ringGeo = new THREE.TorusGeometry(4, 0.2, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringGroup.add(ringMesh);

    // 2. Guide Vanes (24 vanes distributed)
    const vaneCount = 20;
    const vaneRadius = 5.5; // Circle outside the ring
    vanesRef.current = [];

    const vaneShape = new THREE.Shape();
    // Teardrop shape for vane profile
    vaneShape.moveTo(0, 0);
    vaneShape.quadraticCurveTo(0.3, 0.5, 0, 1.5);
    vaneShape.quadraticCurveTo(-0.3, 0.5, 0, 0);
    
    const vaneGeo = new THREE.ExtrudeGeometry(vaneShape, { depth: 2, bevelEnabled: false });
    vaneGeo.center(); // Center geometry for rotation

    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.5); // Linkage arm

    for(let i=0; i<vaneCount; i++) {
        const angle = (i / vaneCount) * Math.PI * 2;
        
        // Vane Group (Pivot point)
        const vaneGroup = new THREE.Group();
        vaneGroup.position.set(Math.cos(angle)*vaneRadius, 0, Math.sin(angle)*vaneRadius);
        mainGroup.add(vaneGroup); // Add to main, not ring (they pivot in place)
        
        // The Vane Blade
        const vane = new THREE.Mesh(vaneGeo, steelMat.clone()); // Clone mat for individual color updates
        vane.rotation.x = Math.PI / 2; // Upright
        vaneGroup.add(vane);
        
        // The Link Arm (Connecting Ring to Vane)
        // Visual simplification: An arm attached to the ring pointing to the vane
        // We add the arm to the RING group at the corresponding spot
        const armGroup = new THREE.Group();
        armGroup.position.set(Math.cos(angle)*4, 0, Math.sin(angle)*4);
        armGroup.rotation.y = -angle; // Point outward roughly
        ringGroup.add(armGroup);
        
        const arm = new THREE.Mesh(armGeo, steelMat);
        arm.position.z = 0.75; // Offset
        armGroup.add(arm);

        // Store ref to vane group to rotate it
        vaneGroup.userData = { mesh: vane, baseAngle: -angle };
        vanesRef.current.push(vaneGroup);
    }

    // 3. Servomotors (2 large cylinders pushing the ring)
    const servoGroup1 = new THREE.Group();
    const servoGroup2 = new THREE.Group();
    servosRef.current = [servoGroup1, servoGroup2];
    mainGroup.add(servoGroup1);
    mainGroup.add(servoGroup2);

    const cylinderGeo = new THREE.CylinderGeometry(0.4, 0.4, 3, 16);
    cylinderGeo.rotateZ(Math.PI / 2);
    const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
    rodGeo.rotateZ(Math.PI / 2);

    // Position Servos tangent to ring
    const servoPos = 4.5;
    servoGroup1.position.set(-servoPos, 0, 3);
    servoGroup1.rotation.y = -Math.PI / 6;
    
    servoGroup2.position.set(servoPos, 0, -3);
    servoGroup2.rotation.y = Math.PI - Math.PI / 6;

    [servoGroup1, servoGroup2].forEach(g => {
        const body = new THREE.Mesh(cylinderGeo, steelMat);
        const rod = new THREE.Mesh(rodGeo, activeServoMat);
        rod.position.x = 1.5; // Extended
        rod.name = "rod";
        g.add(body);
        g.add(rod);
    });

    // --- Animation Loop ---
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // 读取ref中的实时值，而非直接使用props
      const currentOpening = openingRef.current;
      const currentServoPressure = servoPressureRef.current;
      const currentFrictionIndex = frictionIndexRef.current;
      const currentIsMoving = isMovingRef.current;

      // 1. Regulating Ring Rotation (Based on Opening %)
      const targetRot = (currentOpening / 100) * 0.26;
      if (ringRef.current) {
          ringRef.current.rotation.y += (targetRot - ringRef.current.rotation.y) * 0.1;
      }

      // 2. Vane Rotation (Linked to Ring)
      const currentRingRot = ringRef.current ? ringRef.current.rotation.y : 0;
      
      vanesRef.current.forEach((vaneGroup, i) => {
          const { mesh, baseAngle } = vaneGroup.userData;
          
          // Rotation logic
          vaneGroup.rotation.y = baseAngle + currentRingRot * 1.5; 

          // Friction Heat Visualization
          const friction = currentFrictionIndex[i] || 0;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (friction > 0.5) {
              // High friction -> Red/Orange
              mat.color.setHSL(0.05, 1.0, 0.5); 
              mat.emissive.setHex(0xff0000);
              mat.emissiveIntensity = friction * 0.5 + Math.sin(Date.now()*0.01)*0.2;
          } else {
              mat.color.setHex(0x475569);
              mat.emissive.setHex(0x000000);
          }
      });

      // 3. Servo Piston Movement
      servosRef.current.forEach(g => {
          const rod = g.getObjectByName("rod");
          if (rod) {
              const ext = 1.5 + (currentOpening / 100) * 1.0; 
              rod.position.x += (ext - rod.position.x) * 0.1;
              
              const mat = rod.material as THREE.MeshStandardMaterial;
              if (currentIsMoving) {
                  mat.emissiveIntensity = 0.5 + (currentServoPressure / 20) * 0.5;
              } else {
                  mat.emissiveIntensity = 0.2;
              }
          }
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // 依赖项为空数组，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};