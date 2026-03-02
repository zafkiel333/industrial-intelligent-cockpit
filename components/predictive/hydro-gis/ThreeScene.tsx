import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GisSceneProps } from './three-types';

export const GisBayScene: React.FC<GisSceneProps> = ({ 
  sf6Density,
  pdLocation,
  breakerState,
  selectedPartId,
  onPartSelect,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const partsRef = useRef<THREE.Group[]>([]);
  const sparkRef = useRef<THREE.PointLight | null>(null);
  const gasParticlesRef = useRef<THREE.Points | null>(null);

  // 2026.03.02 - Bug修复：使用ref存储动态变量，避免因依赖项频繁变化导致useEffect反复触发
  // Bug情况：3D模型渲染时出现闪烁问题
  // Bug原因：useEffect依赖项（sf6Density/pdLocation/selectedPartId/viewMode等）频繁变化，导致useEffect反复执行，场景被重复创建和渲染
  const sf6DensityRef = useRef(sf6Density);
  const pdLocationRef = useRef(pdLocation);
  const breakerStateRef = useRef(breakerState);
  const selectedPartIdRef = useRef(selectedPartId);
  const viewModeRef = useRef(viewMode);

  // 实时更新ref值，保证能获取最新的变量状态
  useEffect(() => {
    sf6DensityRef.current = sf6Density;
    pdLocationRef.current = pdLocation;
    breakerStateRef.current = breakerState;
    selectedPartIdRef.current = selectedPartId;
    viewModeRef.current = viewMode;
  }, [sf6Density, pdLocation, breakerState, selectedPartId, viewMode]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-gis useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020406, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
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

    // --- Lights ---
    // 2026.03.02 - 亮度优化：提升环境光强度，增加整体基础亮度（原0.3 → 0.6）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 2026.03.02 - 亮度优化：提升青色点光源强度，扩大光照范围（原1.5 → 2.8，距离20→30）
    const cyanLight = new THREE.PointLight(0x22d3ee, 2.8, 30);
    cyanLight.position.set(5, 12, 5); // 轻微上移，更好覆盖模型主体
    scene.add(cyanLight);

    // 2026.03.02 - 亮度优化：提升紫色点光源强度，扩大光照范围（原1.5 → 2.8，距离20→30）
    const purpleLight = new THREE.PointLight(0xa855f7, 2.8, 30);
    purpleLight.position.set(-5, 4, -5); // 轻微上移，减少阴影
    scene.add(purpleLight);

    // 2026.03.02 - 亮度优化：新增主方向光，提升整体亮度和立体感
    const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainDirectionalLight.position.set(8, 15, 8); // 斜上方照射，减少模型底部阴影
    mainDirectionalLight.castShadow = false; // 关闭阴影避免性能损耗
    scene.add(mainDirectionalLight);

    // 2026.03.02 - 亮度优化：新增辅助补光，平衡暗部区域
    const fillLight = new THREE.PointLight(0xffffff, 1.0, 25);
    fillLight.position.set(0, 8, 0); // 模型中心上方，补充中心区域亮度
    scene.add(fillLight);

    // PD Spark Light
    const spark = new THREE.PointLight(0xff00ff, 0, 5);
    scene.add(spark);
    sparkRef.current = spark;

    // --- Geometry Construction (GIS Bay) ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    partsRef.current = [];

    // Materials - 完全保持原有配置，不做任何修改
    const casingMat = new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8, // Aluminum alloy
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.9
    });

    const conductorMat = new THREE.MeshStandardMaterial({
        color: 0xb45309, // Copper
        metalness: 0.6,
        roughness: 0.4
    });

    const insulatorMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, // Epoxy
        transmission: 0.5,
        opacity: 0.8,
        transparent: true,
        roughness: 0.1
    });

    const highlightMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // Helper to create GIS segments
    const createSegment = (id: string, type: 'h-pipe' | 'v-pipe' | 'breaker' | 'elbow', pos: THREE.Vector3, rot: THREE.Euler, scale: THREE.Vector3) => {
        const group = new THREE.Group();
        group.position.copy(pos);
        group.rotation.copy(rot);
        group.userData = { id, basePos: pos.clone() };

        let geo;
        let condGeo;
        
        if (type === 'breaker') {
            geo = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
            condGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.8, 16);
        } else if (type === 'v-pipe') {
            geo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
            condGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 16);
        } else if (type === 'h-pipe') {
            geo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
            geo.rotateZ(Math.PI/2);
            condGeo = new THREE.CylinderGeometry(0.15, 0.15, 4, 16);
            condGeo.rotateZ(Math.PI/2);
        } else { // Elbow (Simplified as sphere)
            geo = new THREE.SphereGeometry(1.0, 32, 32);
            condGeo = new THREE.SphereGeometry(0.2, 16, 16);
        }

        const casing = new THREE.Mesh(geo, casingMat.clone());
        casing.name = 'casing';
        group.add(casing);

        const conductor = new THREE.Mesh(condGeo, conductorMat);
        conductor.name = 'conductor';
        group.add(conductor);

        // Insulator spacers
        if (type.includes('pipe')) {
             const spacer = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.05, 32), insulatorMat);
             if(type === 'h-pipe') spacer.rotation.z = Math.PI/2;
             group.add(spacer);
        }

        // Highlight box (invisible by default)
        const box = new THREE.Mesh(geo, highlightMat);
        box.visible = false;
        box.name = 'highlight';
        box.scale.set(1.05, 1.05, 1.05);
        group.add(box);

        mainGroup.add(group);
        partsRef.current.push(group);
        return group;
    };

    // Build Layout (Typical Bay)
    // 1. Busbar Section
    createSegment('busbar-main', 'h-pipe', new THREE.Vector3(0, 0, -2), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));
    
    // 2. Disconnector (DS) Vertical
    createSegment('ds-1', 'v-pipe', new THREE.Vector3(0, 2, -2), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));
    
    // 3. Circuit Breaker (CB) - Central
    createSegment('cb-unit', 'breaker', new THREE.Vector3(0, 4.5, 0), new THREE.Euler(0,0,Math.PI/2), new THREE.Vector3(1,1,1));
    
    // 4. Elbow connection
    createSegment('elbow-1', 'elbow', new THREE.Vector3(0, 4.5, -2), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));
    createSegment('elbow-2', 'elbow', new THREE.Vector3(0, 4.5, 2), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));
    
    // 5. Outgoing DS & ES
    createSegment('ds-2', 'v-pipe', new THREE.Vector3(0, 2.5, 2), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));
    createSegment('cable-head', 'v-pipe', new THREE.Vector3(0, -0.5, 2), new THREE.Euler(0,0,0), new THREE.Vector3(1,1,1));

    // Gas Particles (SF6 Simulation)
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 4;
        pPos[i*3+1] = (Math.random()-0.5) * 4 + 2;
        pPos[i*3+2] = (Math.random()-0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x22d3ee,
        size: 0.05,
        transparent: true,
        opacity: 0.0, // Managed in animate
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    gasParticlesRef.current = particles;
    scene.add(particles);

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
            if (target.userData.id) onPartSelect(target.userData.id);
        } else {
            onPartSelect('');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. View Mode Material Updates
      // 读取ref中的最新值，而非直接使用原依赖项
      const currentViewMode = viewModeRef.current;
      const currentSelectedPartId = selectedPartIdRef.current;
      partsRef.current.forEach(group => {
          const casing = group.getObjectByName('casing') as THREE.Mesh;
          const conductor = group.getObjectByName('conductor') as THREE.Mesh;
          const highlight = group.getObjectByName('highlight') as THREE.Mesh;
          const isSelected = group.userData.id === currentSelectedPartId;

          if (highlight) highlight.visible = isSelected;

          if (casing && conductor) {
              const cMat = casing.material as THREE.MeshPhysicalMaterial;
              if (currentViewMode === 'internal') {
                  cMat.opacity = 0.2;
                  cMat.color.setHex(0x334155);
                  conductor.visible = true;
              } else if (currentViewMode === 'gas') {
                  cMat.opacity = 0.1;
                  conductor.visible = false;
              } else {
                  cMat.opacity = 0.9;
                  cMat.color.setHex(0x94a3b8);
                  conductor.visible = false;
              }
          }
      });

      // 2. SF6 Gas Particles
      // 读取ref中的最新sf6Density值
      const currentSf6Density = sf6DensityRef.current;
      if (gasParticlesRef.current) {
          const mat = gasParticlesRef.current.material as THREE.PointsMaterial;
          if (currentViewMode === 'gas') {
              mat.opacity = 0.6 * (currentSf6Density / 100);
              const positions = gasParticlesRef.current.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pCount; i++) {
                  positions[i*3+1] += Math.sin(time + positions[i*3]) * 0.01;
              }
              gasParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          } else {
              mat.opacity = 0;
          }
      }

      // 3. PD Spark Effect
      // 读取ref中的最新pdLocation值
      const currentPdLocation = pdLocationRef.current;
      if (sparkRef.current && currentPdLocation) {
          if (Math.random() > 0.9) {
              sparkRef.current.position.set(currentPdLocation[0], currentPdLocation[1], currentPdLocation[2]);
              sparkRef.current.intensity = 5;
          } else {
              sparkRef.current.intensity = 0;
          }
      } else if (sparkRef.current) {
          sparkRef.current.intensity = 0;
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
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onPartSelect]);

  // 组件返回挂载容器
  return (
    <div 
      ref={mountRef} 
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
};