import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EngineSceneProps } from './three-types';

export const EngineThreeScene: React.FC<EngineSceneProps> = ({
  rpm,
  cylinders,
  turboSpeed,
  viewMode,
  activeCylinder,
  onCylinderSelect,
  vibrationIntensity
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineGroupRef = useRef<THREE.Group | null>(null);
  const pistonsRef = useRef<THREE.Group[]>([]);
  const crankshaftRef = useRef<THREE.Group | null>(null);
  const turbosRef = useRef<THREE.Group[]>([]);

  // 2026.03.04 - Bug修复：创建ref存储动态props，避免依赖项变化触发useEffect重渲染
  // Bug情况：模型频繁闪烁，useEffect反复执行导致场景重新创建、渲染
  // Bug原因：useEffect依赖项（rpm/cylinders/viewMode等）频繁变化，触发整个3D场景重新初始化
  const rpmRef = useRef(rpm);
  const cylindersRef = useRef(cylinders);
  const turboSpeedRef = useRef(turboSpeed);
  const viewModeRef = useRef(viewMode);
  const activeCylinderRef = useRef(activeCylinder);
  const vibrationIntensityRef = useRef(vibrationIntensity);

  // 2026.03.04 - 仅更新ref值，不触发场景重建
  useEffect(() => {
    rpmRef.current = rpm;
    cylindersRef.current = cylinders;
    turboSpeedRef.current = turboSpeed;
    viewModeRef.current = viewMode;
    activeCylinderRef.current = activeCylinder;
    vibrationIntensityRef.current = vibrationIntensity;
  }, [rpm, cylinders, turboSpeed, viewMode, activeCylinder, vibrationIntensity]);

  // 2026.03.04 - 主渲染逻辑仅初始化一次（依赖空数组），避免反复触发
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-truck-engine useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 2026.03.04 - 优化：调亮背景色（非材质/模型颜色），提升基础亮度
    scene.background = new THREE.Color(0x100808);
    // 2026.03.04 - 优化：降低雾密度，减少亮度遮挡，雾色同步调亮
    scene.fog = new THREE.FogExp2(0x100808, 0.01);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 2026.03.04 - 优化：大幅提升曝光度，最大化亮度表现
    renderer.toneMappingExposure = 1.8;
    
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // Lights - 2026.03.04 全面优化光照系统，提升亮度且不修改材质/模型颜色
    // 1. 环境光：大幅提升强度，保证基础亮度覆盖
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 2. 新增半球光：模拟天空/地面环境光，提升整体明暗层次感和亮度
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // 3. 主方向光：大幅提升强度，作为核心照明源
    const mainLight = new THREE.DirectionalLight(0xffaa00, 3.0);
    mainLight.position.set(10, 20, 10);
    // 开启阴影（可选，进一步提升质感）
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // 4. 蓝色辅助光：提升强度，补充侧面亮度
    const blueLight = new THREE.PointLight(0x3b82f6, 4.0, 50);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    // 5. 底部补光：新增！解决底部暗部问题，提升整体亮度均匀性
    const bottomFillLight = new THREE.PointLight(0xffffff, 2.0, 40);
    bottomFillLight.position.set(0, -8, 0);
    scene.add(bottomFillLight);

    // 6. 红色警示灯：保留原有逻辑，仅调整基础强度（可选）
    const redLight = new THREE.PointLight(0xef4444, 0, 20);
    redLight.position.set(0, 5, 0);
    scene.add(redLight);

    // Materials - 完全保留原有配置，不修改任何颜色/发光属性
    const blockMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });

    const pistonMat = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0, metalness: 0.9, roughness: 0.3
    });

    const hotMat = new THREE.MeshStandardMaterial({
        color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 0.5
    });

    // Geometry Construction - 完全保留原有模型结构
    const mainGroup = new THREE.Group();
    engineGroupRef.current = mainGroup;
    scene.add(mainGroup);

    const blockL = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 3), blockMat);
    blockL.position.set(0, 2, 2);
    blockL.rotation.x = Math.PI / 6;
    mainGroup.add(blockL);

    const blockR = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 3), blockMat);
    blockR.position.set(0, 2, -2);
    blockR.rotation.x = -Math.PI / 6;
    mainGroup.add(blockR);

    const crankGroup = new THREE.Group();
    crankshaftRef.current = crankGroup;
    mainGroup.add(crankGroup);
    
    const crankShaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 16, 16);
    crankShaftGeo.rotateZ(Math.PI/2);
    const crankShaft = new THREE.Mesh(crankShaftGeo, new THREE.MeshStandardMaterial({color: 0x475569}));
    crankGroup.add(crankShaft);

    pistonsRef.current = [];
    const cylCount = 8;
    const spacing = 1.6;
    
    for(let i=0; i<cylCount; i++) {
        const x = -5.6 + i * spacing;
        const pGroup = createPistonGroup(i+1, x, 2, 2, Math.PI/6, pistonMat);
        mainGroup.add(pGroup);
        pistonsRef.current.push(pGroup);
    }
    for(let i=0; i<cylCount; i++) {
        const x = -5.6 + i * spacing + 0.8;
        const pGroup = createPistonGroup(i+9, x, 2, -2, -Math.PI/6, pistonMat);
        mainGroup.add(pGroup);
        pistonsRef.current.push(pGroup);
    }

    const turboGeo = new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8);
    const turboL = new THREE.Mesh(turboGeo, new THREE.MeshStandardMaterial({color: 0xcd7f32}));
    turboL.position.set(-8, 4, 1.5);
    mainGroup.add(turboL);
    turbosRef.current.push(turboL as any);

    const turboR = new THREE.Mesh(turboGeo, new THREE.MeshStandardMaterial({color: 0xcd7f32}));
    turboR.position.set(-8, 4, -1.5);
    mainGroup.add(turboR);
    turbosRef.current.push(turboR as any);

    function createPistonGroup(id: number, x: number, y: number, z: number, rotX: number, mat: THREE.Material) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.x = rotX;
        group.userData = { id, baseX: x, baseY: y, baseZ: z, baseRotX: rotX };

        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1, 32), mat.clone());
        head.name = 'head';
        group.add(head);

        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), new THREE.MeshStandardMaterial({color: 0x64748b}));
        rod.position.y = -1.5;
        group.add(rod);

        return group;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(mainGroup.children, true);
        if (intersects.length > 0) {
            let target: any = intersects[0].object;
            while(target.parent && !target.parent.userData.id) target = target.parent;
            if (target.parent && target.parent.userData.id) onCylinderSelect(target.parent.userData.id);
        } else {
            onCylinderSelect(-1);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      const crankSpeed = (rpmRef.current / 60) * 0.1;
      if (crankshaftRef.current) {
          crankshaftRef.current.rotation.x += crankSpeed;
      }

      turbosRef.current.forEach(t => {
          t.rotation.x += (turboSpeedRef.current / 60) * 0.05;
      });

      pistonsRef.current.forEach((p, i) => {
          const id = p.userData.id;
          const cylData = cylindersRef.current.find(c => c.id === id);
          
          const offset = i * (Math.PI / 4);
          const stroke = Math.sin(time * 10 + offset) * 1.0;
          
          p.children[0].position.y = stroke;
          p.children[1].position.y = stroke - 1.5;
          p.children[1].rotation.z = Math.sin(time * 10 + offset) * 0.2;

          const mesh = p.children[0] as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const isSelected = activeCylinderRef.current === id;

          if (viewModeRef.current === 'thermal' && cylData) {
              const tNorm = Math.max(0, Math.min(1, (cylData.temp - 400) / 400));
              const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
              mat.color.copy(color);
              mat.emissive.copy(color);
              mat.emissiveIntensity = tNorm;
          } else {
              if (isSelected) {
                  mat.color.setHex(0xffffff);
                  mat.emissive.setHex(0xffffff);
                  mat.emissiveIntensity = 0.5;
              } else {
                  mat.color.setHex(0xc0c0c0);
                  mat.emissive.setHex(0x000000);
                  mat.emissiveIntensity = 0;
              }
          }

          if (viewModeRef.current === 'exploded' && isSelected) {
             const explodeDir = p.userData.id <= 8 ? new THREE.Vector3(0, 1, 1) : new THREE.Vector3(0, 1, -1);
             p.position.lerp(new THREE.Vector3(p.userData.baseX, p.userData.baseY, p.userData.baseZ).add(explodeDir.multiplyScalar(3)), 0.1);
          } else {
             p.position.lerp(new THREE.Vector3(p.userData.baseX, p.userData.baseY, p.userData.baseZ), 0.1);
          }
      });

      if (engineGroupRef.current && vibrationIntensityRef.current > 0) {
          engineGroupRef.current.position.x = (Math.random()-0.5) * vibrationIntensityRef.current * 0.05;
          engineGroupRef.current.position.y = (Math.random()-0.5) * vibrationIntensityRef.current * 0.05;
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