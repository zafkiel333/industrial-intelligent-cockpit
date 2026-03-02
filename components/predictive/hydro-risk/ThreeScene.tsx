import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RiskSceneProps } from './three-types';

export const RiskPredictionScene: React.FC<RiskSceneProps> = ({ 
  explodeFactor, 
  components, 
  onComponentSelect,
  activeComponentId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const partsRef = useRef<THREE.Group[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  // 2026.02.28 bug修复：缓存实时变化的props值，避免作为useEffect依赖触发重复渲染
  // bug情况：3D模型频繁闪烁，原因是useEffect依赖项（explodeFactor/components/activeComponentId）频繁变化，导致useEffect反复执行，场景被重复初始化
  const stateRef = useRef({
    explodeFactor,
    components,
    activeComponentId,
    onComponentSelect
  });
  
  // 实时更新缓存的props值，不触发useEffect
  useEffect(() => {
    stateRef.current = {
      explodeFactor,
      components,
      activeComponentId,
      onComponentSelect
    };
  }, [explodeFactor, components, activeComponentId, onComponentSelect]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0510, 0.03); // Deep purple fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    console.log("=== hydro-risk excute clear canvas ===");
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Dramatic lighting
    const spotLight = new THREE.SpotLight(0xd946ef, 10);
    spotLight.position.set(0, 15, 0);
    spotLight.angle = 0.5;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const redLight = new THREE.PointLight(0xff0000, 2, 20);
    redLight.position.set(5, 0, 5);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 20);
    blueLight.position.set(-5, 0, -5);
    scene.add(blueLight);

    // --- Materials ---
    // Holographic wireframe look
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    const solidMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      transmission: 0.2,
      clearcoat: 1.0
    });

    const riskMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
      wireframe: true
    });

    // --- Geometry Construction (Deconstructed Unit) ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    partsRef.current = [];

    // Helper to create parts
    const createPart = (id: string, geo: THREE.BufferGeometry, baseY: number, explodeDir: THREE.Vector3) => {
      const partGroup = new THREE.Group();
      partGroup.userData = { id, baseY, explodeDir }; // Store original Y and direction
      
      const mesh = new THREE.Mesh(geo, solidMat);
      const wire = new THREE.Mesh(geo, wireframeMat);
      partGroup.add(mesh);
      partGroup.add(wire);
      
      mainGroup.add(partGroup);
      partsRef.current.push(partGroup);
      return partGroup;
    };

    // 1. Generator Top Cover
    createPart('cover', new THREE.CylinderGeometry(3.5, 3.5, 0.5, 32), 4, new THREE.Vector3(0, 1, 0));

    // 2. Stator
    createPart('stator', new THREE.CylinderGeometry(3.2, 3.2, 2, 32, 1, true), 2, new THREE.Vector3(0, 0.5, 0));

    // 3. Rotor
    createPart('rotor', new THREE.CylinderGeometry(2.8, 2.8, 1.8, 16), 2, new THREE.Vector3(1, 0, 0));

    // 4. Shaft
    createPart('shaft', new THREE.CylinderGeometry(0.5, 0.5, 8, 16), 0, new THREE.Vector3(0, 0, 0));

    // 5. Bearing
    createPart('bearing', new THREE.CylinderGeometry(1.5, 1.5, 0.8, 16), -1, new THREE.Vector3(0, 0, 1));

    // 6. Turbine Head Cover
    createPart('turbine-cover', new THREE.CylinderGeometry(3, 3, 0.3, 32), -2.5, new THREE.Vector3(0, 0, -1));

    // 7. Runner
    const runnerGeo = new THREE.TorusGeometry(2, 0.5, 16, 32);
    runnerGeo.rotateX(Math.PI/2);
    createPart('runner', runnerGeo, -4, new THREE.Vector3(0, -1, 0));

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        // Raycast against meshes inside part groups
        const objects: THREE.Object3D[] = [];
        partsRef.current.forEach(g => objects.push(...g.children));
        
        const intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            const group = intersects[0].object.parent;
            if (group && group.userData.id) {
                // 读取缓存的最新回调函数
                stateRef.current.onComponentSelect(group.userData.id);
            }
        } else {
            stateRef.current.onComponentSelect('');
        }
    };
    mountRef.current.addEventListener('click', onMouseClick);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 2026.02.28 bug修复：从ref中读取最新的props值，而非依赖useEffect传参
      const { explodeFactor, components, activeComponentId } = stateRef.current;

      // Update Part Positions (Explosion) and Colors
      partsRef.current.forEach(group => {
          const { id, baseY, explodeDir } = group.userData;
          const compData = components.find(c => c.id === id);
          
          // Explode Animation
          const targetPos = explodeDir.clone().multiplyScalar(explodeFactor * 3).add(new THREE.Vector3(0, baseY, 0));
          group.position.lerp(targetPos, 0.1);

          // Rotation for visual interest
          if (id === 'rotor' || id === 'runner' || id === 'shaft') {
              group.rotation.y += 0.01;
          }

          // Risk Coloring & Selection Highlight
          const isSelected = activeComponentId === id;
          const risk = compData?.riskLevel || 0;
          
          group.children.forEach((child) => {
              if (child instanceof THREE.Mesh) {
                  const mat = child.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
                  
                  if (isSelected) {
                      // Highlight selected
                      if ('emissive' in mat) {
                          mat.emissive.setHex(0xffffff);
                          mat.emissiveIntensity = 0.5;
                      }
                      if ('wireframe' in mat && mat.wireframe) {
                          mat.color.setHex(0xffffff);
                          mat.opacity = 0.8;
                      }
                  } else if (risk > 70) {
                      // High Risk Pulse
                      if ('emissive' in mat) {
                          mat.emissive.setHex(0xff0000);
                          mat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
                      }
                      if ('wireframe' in mat && mat.wireframe) {
                          mat.color.setHex(0xff0000);
                          mat.opacity = 0.5;
                      }
                  } else {
                      // Normal
                      if ('emissive' in mat) {
                          mat.emissive.setHex(0x000000);
                          mat.emissiveIntensity = 0;
                      }
                      if ('wireframe' in mat && mat.wireframe) {
                          mat.color.setHex(0x8b5cf6); // Purple
                          mat.opacity = 0.15;
                      }
                  }
              }
          });
      });
      console.log("=== hydro-risk excute animate ===");

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
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
      console.log("=== hydro-risk excute cleanup ===");
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onComponentSelect]); // 仅保留稳定的回调依赖（或移除，通过ref完全隔离）
  // 注：如果onComponentSelect是父组件每次渲染都新建的函数，可将其也纳入stateRef缓存，彻底移除该依赖
  

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};