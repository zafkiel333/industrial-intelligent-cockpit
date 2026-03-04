import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocoRulSceneProps } from './three-types';

export const LocomotiveRulScene: React.FC<LocoRulSceneProps> = ({ 
  components, 
  activeComponentId, 
  onSelect, 
  explodeFactor, 
  previewTimeMonth 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const compGroupsRef = useRef<THREE.Group[]>([]);
  const timeTunnelRef = useRef<THREE.Group | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const warningLightRef = useRef<THREE.PointLight | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // 2026.03.04 修复：创建Ref存储动态Props值，避免作为useEffect依赖导致频繁触发
  // Bug情况：3D模型渲染时出现频繁闪烁问题
  // 原因：原代码将components/activeComponentId/explodeFactor/previewTimeMonth作为useEffect依赖项，这些变量频繁变化会导致useEffect反复执行，
  // 每次执行都会重新创建场景、渲染器、相机等核心对象，引发模型闪烁和性能问题
  const componentsRef = useRef(components);
  const activeComponentIdRef = useRef(activeComponentId);
  const explodeFactorRef = useRef(explodeFactor);
  const previewTimeMonthRef = useRef(previewTimeMonth);

  // 2026.03.04 修复：同步Props变化到Ref中，确保动画循环能读取到最新值
  // 仅更新Ref值，不重建3D核心对象，避免闪烁
  useEffect(() => {
    componentsRef.current = components;
    activeComponentIdRef.current = activeComponentId;
    explodeFactorRef.current = explodeFactor;
    previewTimeMonthRef.current = previewTimeMonth;
  }, [components, activeComponentId, explodeFactor, previewTimeMonth]);

  // 核心初始化逻辑：仅执行一次，避免重复创建3D对象导致闪烁
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-locomotive-rul useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 场景初始化（仅执行一次）
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0510, 0.02); // Deep violet fog

    // 相机初始化
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 渲染器初始化（修复多Canvas问题）
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    
    // 清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 控制器初始化
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 50);
    purpleLight.position.set(-10, 5, -10);
    scene.add(purpleLight);

    const warningLight = new THREE.PointLight(0xff0000, 0, 50); // Activates on low health
    warningLight.position.set(0, 5, 0);
    scene.add(warningLight);
    warningLightRef.current = warningLight;

    // --- Time Tunnel (Visual Effect for Prediction) ---
    const tunnelGroup = new THREE.Group();
    timeTunnelRef.current = tunnelGroup;
    scene.add(tunnelGroup);

    for(let i=0; i<10; i++) {
        const ringGeo = new THREE.TorusGeometry(8 + i, 0.05, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.1 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.z = -5 + i * 2;
        tunnelGroup.add(ring);
    }

    // --- 主组件容器初始化 ---
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // --- 初始化组件（首次加载） ---
    const initComponents = () => {
      if (!mainGroupRef.current) return;
      mainGroupRef.current.clear();
      compGroupsRef.current = [];

      componentsRef.current.forEach((comp) => {
          const group = new THREE.Group();
          group.userData = { 
              id: comp.id, 
              basePos: new THREE.Vector3(...comp.position),
              degradationRate: comp.degradationRate,
              initialHealth: comp.currentHealth
          };

          // Materials（每次创建组件时重新生成，避免材质共享问题）
          const baseMat = new THREE.MeshPhysicalMaterial({
              color: 0xfacc15, // Yellow base
              metalness: 0.5,
              roughness: 0.2,
              clearcoat: 0.5
          });

          const techMat = new THREE.MeshStandardMaterial({
              color: 0x334155,
              metalness: 0.8,
              roughness: 0.4
          });

          const highlightMat = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              wireframe: true,
              transparent: true,
              opacity: 0.3
          });

          // Geometry based on type
          let mesh;
          if (comp.category === 'body') {
              mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMat.clone());
          } else if (comp.category === 'wheel') {
              mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), techMat.clone());
              mesh.rotation.z = Math.PI / 2;
          } else if (comp.category === 'motor') {
              mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16), techMat.clone());
          } else if (comp.category === 'pantograph') {
              mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), techMat.clone());
          } else {
              mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), techMat.clone());
          }
          
          mesh.scale.set(...comp.scale);
          mesh.name = "mesh";
          group.add(mesh);

          // Selection Highlight
          const highlight = new THREE.Mesh(mesh.geometry, highlightMat);
          highlight.scale.multiplyScalar(1.05);
          highlight.visible = false;
          highlight.name = "highlight";
          if (comp.category === 'wheel') highlight.rotation.z = Math.PI / 2;
          group.add(highlight);

          mainGroupRef.current!.add(group);
          compGroupsRef.current.push(group);
      });
    };

    // 首次初始化组件
    initComponents();

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, cameraRef.current!);
        
        // Raycast recursively
        const hits = raycaster.intersectObjects(mainGroupRef.current?.children || [], true);
        if (hits.length > 0) {
            let target: any = hits[0].object;
            while(target.parent && target.parent !== mainGroupRef.current) target = target.parent;
            if (target.userData.id) onSelect(target.userData.id);
        } else {
            onSelect('');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controlsRef.current?.update();

      // 读取最新的previewTimeMonth值（从Ref获取）
      const currentPreviewMonth = previewTimeMonthRef.current;
      const currentExplodeFactor = explodeFactorRef.current;
      const currentActiveComponentId = activeComponentIdRef.current;

      // Time Tunnel Animation（使用最新的预览时间）
      if (timeTunnelRef.current) {
          timeTunnelRef.current.position.z = (time * 2) % 2;
          const pulse = 1 + (currentPreviewMonth / 12) * 0.5;
          timeTunnelRef.current.scale.setScalar(pulse);
      }

      let minHealthInScene = 100;

      // 遍历组件（使用Ref中最新的组件列表）
      compGroupsRef.current.forEach(group => {
          const { id, basePos, degradationRate, initialHealth } = group.userData;
          
          // 1. Explode Logic（使用最新的爆炸系数）
          const dir = new THREE.Vector3(basePos.x, basePos.y, basePos.z).normalize();
          if (basePos.y > 1) dir.y += 1;
          const targetPos = basePos.clone().add(dir.multiplyScalar(currentExplodeFactor * 5));
          group.position.lerp(targetPos, 0.1);

          // 2. Future Health Simulation (Coloring)（使用最新的预览时间）
          const predictedHealth = Math.max(0, initialHealth - degradationRate * currentPreviewMonth);
          if (predictedHealth < minHealthInScene) minHealthInScene = predictedHealth;

          const mesh = group.getObjectByName('mesh') as THREE.Mesh;
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          
          // Color Mapping: Green -> Yellow -> Red -> Dark Grey (Dead)
          const hNorm = predictedHealth / 100;
          const targetColor = new THREE.Color();
          
          if (predictedHealth < 20) targetColor.setHex(0x333333); // Failed
          else targetColor.setHSL(hNorm * 0.3, 1.0, 0.4); // Red(0) to Green(0.3)
          
          mat.color.lerp(targetColor, 0.1);
          
          // Emissive pulse for critical parts in future
          if (predictedHealth < 40) {
              mat.emissive.setHex(0xff0000);
              mat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
          } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
          }

          // 3. Selection State（使用最新的激活组件ID）
          const highlight = group.getObjectByName('highlight');
          if (highlight) highlight.visible = (id === currentActiveComponentId);
      });

      // Global warning light（使用最新的健康值）
      if (warningLightRef.current) {
        if (minHealthInScene < 40) {
            warningLightRef.current.intensity = 2 + Math.sin(time * 5) * 2;
        } else {
            warningLightRef.current.intensity = 0;
        }
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    animate();

    // 窗口大小调整处理
    const handleResize = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      // 清理3D对象
      sceneRef.current?.clear();
    };
  }, []); // 依赖项置空，确保仅初始化一次

  // 监听组件变化，重新初始化组件（仅更新组件，不重建整个场景）
  useEffect(() => {
    // 2026.03.04 修复：组件列表变化时仅重新初始化组件，避免重建整个3D场景
    if (componentsRef.current !== components) {
      const initComponents = () => {
        if (!mainGroupRef.current) return;
        mainGroupRef.current.clear();
        compGroupsRef.current = [];

        components.forEach((comp) => {
            const group = new THREE.Group();
            group.userData = { 
                id: comp.id, 
                basePos: new THREE.Vector3(...comp.position),
                degradationRate: comp.degradationRate,
                initialHealth: comp.currentHealth
            };

            // Materials
            const baseMat = new THREE.MeshPhysicalMaterial({
                color: 0xfacc15, // Yellow base
                metalness: 0.5,
                roughness: 0.2,
                clearcoat: 0.5
            });

            const techMat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                metalness: 0.8,
                roughness: 0.4
            });

            const highlightMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });

            // Geometry based on type
            let mesh;
            if (comp.category === 'body') {
                mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMat.clone());
            } else if (comp.category === 'wheel') {
                mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), techMat.clone());
                mesh.rotation.z = Math.PI / 2;
            } else if (comp.category === 'motor') {
                mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16), techMat.clone());
            } else if (comp.category === 'pantograph') {
                mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), techMat.clone());
            } else {
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), techMat.clone());
            }
            
            mesh.scale.set(...comp.scale);
            mesh.name = "mesh";
            group.add(mesh);

            // Selection Highlight
            const highlight = new THREE.Mesh(mesh.geometry, highlightMat);
            highlight.scale.multiplyScalar(1.05);
            highlight.visible = false;
            highlight.name = "highlight";
            if (comp.category === 'wheel') highlight.rotation.z = Math.PI / 2;
            group.add(highlight);

            mainGroupRef.current!.add(group);
            compGroupsRef.current.push(group);
        });
      };
      initComponents();
    }
  }, [components]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};