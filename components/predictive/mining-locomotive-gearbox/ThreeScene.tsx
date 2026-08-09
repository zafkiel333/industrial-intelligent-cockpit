import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocoGearboxSceneProps } from './three-types';

export const LocoGearboxScene: React.FC<LocoGearboxSceneProps> = ({
  rpm,
  torqueLoad,
  oilDebrisDensity,
  viewMode,
  components,
  activeComponentId,
  onComponentSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pinionRef = useRef<THREE.Group | null>(null);
  const wheelRef = useRef<THREE.Group | null>(null);
  const debrisSystemRef = useRef<THREE.Points | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  // 2026.03.04 - Bug修复：创建ref存储实时props值，避免主useEffect依赖项频繁变化
  // Bug情况：3D模型渲染时出现闪烁问题
  // Bug原因：主useEffect依赖项（rpm/torqueLoad等）频繁变化，导致useEffect反复触发、场景重新创建和渲染
  const rpmRef = useRef(rpm);
  const torqueLoadRef = useRef(torqueLoad);
  const oilDebrisDensityRef = useRef(oilDebrisDensity);
  const viewModeRef = useRef(viewMode);
  const activeComponentIdRef = useRef(activeComponentId);
  const componentsRef = useRef(components);

  // 2026.03.04 - 仅更新ref值，不触发场景重建
  useEffect(() => {
    rpmRef.current = rpm;
    torqueLoadRef.current = torqueLoad;
    oilDebrisDensityRef.current = oilDebrisDensity;
    viewModeRef.current = viewMode;
    activeComponentIdRef.current = activeComponentId;
    componentsRef.current = components;
  }, [rpm, torqueLoad, oilDebrisDensity, viewMode, activeComponentId, components]);

  // 2026.03.04 - 主渲染逻辑仅在组件挂载/卸载时执行（依赖项为空数组），避免反复触发
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-locomotive-gearbox useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // ========== 优化1：雾效调整（更淡+更亮的雾色，提升整体亮度） ==========
    scene.fog = new THREE.FogExp2(0x101520, 0.02); // 雾色调亮，密度从0.04降至0.02（雾更淡）

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // ========== 优化2：提升曝光度（最大化亮度且不过曝） ==========
    renderer.toneMappingExposure = 2.0; // 从1.5提升至2.0，增强整体曝光

    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Lights ---
    // ========== 优化3：大幅提升环境光强度 ==========
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // 从0.3提升至1.0，基础亮度拉满
    scene.add(ambientLight);

    // ========== 优化4：新增半球光（提升环境光过渡，顶部→底部均匀亮） ==========
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5); // 天空色/地面色均为纯白，强度1.5
    hemisphereLight.position.set(0, 10, 0); // 半球光位置（顶部）
    scene.add(hemisphereLight);

    // ========== 优化5：提升主点光强度+扩大照射范围 ==========
    const mainLight = new THREE.PointLight(0xf59e0b, 10, 100); // 强度从2→10，照射距离从50→100
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    // ========== 优化6：提升蓝色聚光灯强度+扩大照射范围 ==========
    const blueLight = new THREE.SpotLight(0x3b82f6, 12, 120); // 强度从5→12，照射距离默认→120
    blueLight.position.set(-10, 5, -5);
    blueLight.angle = Math.PI / 3; // 照射角度扩大（从默认更宽）
    blueLight.penumbra = 0.2; // 边缘柔化，避免硬阴影
    scene.add(blueLight);

    // ========== 优化7：新增底部补光（解决底部暗角问题） ==========
    const bottomFillLight = new THREE.PointLight(0xffffff, 6, 80); // 纯白底部补光，强度6
    bottomFillLight.position.set(0, -8, 0); // 位置在模型正下方
    scene.add(bottomFillLight);

    // --- Materials ---（完全未修改，仅保留原材质属性）
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, metalness: 0.8, roughness: 0.3 
    });
    
    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      metalness: 0.5,
      roughness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    const stressMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // --- Geometry ---（完全未修改）
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Housing (Ghosted)
    const housingGeo = new THREE.BoxGeometry(8, 5, 4);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    mainGroup.add(housing);
    
    const housingEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(housingGeo),
        new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 })
    );
    mainGroup.add(housingEdges);

    // Helper to create gears
    const createGear = (radius: number, teeth: number, width: number, color: number) => {
        const group = new THREE.Group();
        
        // Gear Body
        const bodyGeo = new THREE.CylinderGeometry(radius - 0.2, radius - 0.2, width, 32);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Teeth
        const toothGeo = new THREE.BoxGeometry(0.4, width, 0.4);
        for(let i=0; i<teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const tooth = new THREE.Mesh(toothGeo, bodyMat);
            tooth.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            tooth.rotation.y = -angle;
            group.add(tooth);
        }

        return group;
    };

    // 2. Pinion (Input - High Speed)
    const pinionGroup = createGear(1.2, 12, 1.5, 0x94a3b8);
    pinionGroup.position.set(-2, 0, 0);
    pinionGroup.userData = { id: 'pinion' };
    pinionRef.current = pinionGroup;
    mainGroup.add(pinionGroup);

    // 3. Wheel (Output - Low Speed)
    const wheelGroup = createGear(2.8, 28, 1.5, 0x64748b);
    wheelGroup.position.set(2.2, 0, 0);
    wheelGroup.rotation.x = 0.1;
    wheelGroup.userData = { id: 'wheel' };
    wheelRef.current = wheelGroup;
    mainGroup.add(wheelGroup);

    // 4. Shafts
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 16);
    shaftGeo.rotateX(Math.PI / 2);
    
    const inputShaft = new THREE.Mesh(shaftGeo, steelMat);
    inputShaft.position.set(-2, 0, 0);
    mainGroup.add(inputShaft);

    const outputShaft = new THREE.Mesh(shaftGeo, steelMat);
    outputShaft.position.set(2.2, 0, 0);
    mainGroup.add(outputShaft);

    // 5. Debris Particles
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 7;
        pPos[i*3+1] = (Math.random()-0.5) * 4;
        pPos[i*3+2] = (Math.random()-0.5) * 3;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xd97706,
        size: 0.08,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
    });
    const debris = new THREE.Points(pGeo, pMat);
    debrisSystemRef.current = debris;
    mainGroup.add(debris);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(mainGroup.children, true);
        if (hits.length > 0) {
            let target: any = hits[0].object;
            while(target.parent && target.parent !== mainGroup) target = target.parent;
            if (target.userData.id) onComponentSelect(target.userData.id);
        } else {
            onComponentSelect('');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      const currentRpm = rpmRef.current;
      const currentTorqueLoad = torqueLoadRef.current;
      const currentOilDebrisDensity = oilDebrisDensityRef.current;
      const currentViewMode = viewModeRef.current;
      const currentActiveComponentId = activeComponentIdRef.current;
      const currentComponents = componentsRef.current;

      // Rotation Logic
      const inputSpeed = currentRpm * 0.002;
      if (pinionRef.current) pinionRef.current.rotation.x -= inputSpeed;
      if (wheelRef.current) wheelRef.current.rotation.x += inputSpeed / 2.33;
      
      inputShaft.rotation.x = (pinionRef.current?.rotation.x || 0);
      outputShaft.rotation.x = (wheelRef.current?.rotation.x || 0);

      // 1. Debris Visibility
      if (debrisSystemRef.current) {
          const mat = debrisSystemRef.current.material as THREE.PointsMaterial;
          mat.opacity = currentOilDebrisDensity * (currentViewMode === 'particles' ? 0.8 : 0.2);
          
          const pos = debrisSystemRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += Math.sin(time * 10 + i) * 0.01 * (currentRpm/1000);
          }
          debrisSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Material/View Mode
      const updateComponent = (group: THREE.Group, id: string) => {
          const data = currentComponents.find(c => c.id === id);
          const isSelected = currentActiveComponentId === id;
          const meshes = group.children.filter(c => c instanceof THREE.Mesh) as THREE.Mesh[];

          meshes.forEach(mesh => {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              
              if (currentViewMode === 'stress') {
                  const stress = data ? data.wearLevel / 100 : 0;
                  const col = new THREE.Color().setHSL(0.6 - stress * 0.6, 0.8, 0.5);
                  mat.color.copy(col);
                  mat.emissive.copy(col);
                  mat.emissiveIntensity = 0.5;
                  mat.wireframe = true;
              } else {
                  mat.wireframe = false;
                  mat.emissiveIntensity = isSelected ? 0.3 : 0;
                  
                  if (data && data.wearLevel > 70) {
                      mat.color.lerpColors(new THREE.Color(0x94a3b8), new THREE.Color(0x573e32), 0.5);
                      mat.roughness = 0.8;
                  } else {
                      mat.color.setHex(id === 'pinion' ? 0x94a3b8 : 0x64748b);
                      mat.roughness = 0.4;
                  }

                  if (isSelected) mat.emissive.setHex(0xffffff);
                  else mat.emissive.setHex(0x000000);
              }
          });
      };

      if (pinionRef.current) updateComponent(pinionRef.current, 'pinion');
      if (wheelRef.current) updateComponent(wheelRef.current, 'wheel');

      // Vibration Shake
      if (mainGroupRef.current) {
        if (currentTorqueLoad > 80) {
            const shake = 0.02;
            mainGroupRef.current.position.x = (Math.random()-0.5) * shake;
            mainGroupRef.current.position.y = (Math.random()-0.5) * shake;
        } else {
            mainGroupRef.current.position.set(0,0,0);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};