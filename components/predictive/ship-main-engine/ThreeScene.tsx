
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipEngineAnimatables, EngineViewMode } from './three-types';

interface ThreeSceneProps {
  loadLevel?: number; // 0-1
  healthStatus?: number; // 0-1
  viewMode?: EngineViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  loadLevel = 0.7, 
  healthStatus = 0.9,
  viewMode = 'mechanical'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ship-main-engine useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业光影矩阵：多点光源确保细节 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    const coldRim = new THREE.PointLight(0x0ea5e9, 10, 50);
    coldRim.position.set(-10, 5, 10);
    scene.add(coldRim);

    const heatRim = new THREE.PointLight(0xf97316, 10, 50);
    heatRim.position.set(10, -5, -10);
    scene.add(heatRim);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: ShipEngineAnimatables = { pistons: [], combustionGlows: [] };
    const disposables: any[] = [];

    // --- 1. 引擎机座 (Engine Block) ---
    const blockGeo = new THREE.BoxGeometry(12, 5, 4);
    const blockMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.3,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.2 : 1.0
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.y = -1;
    mainGroup.add(block);
    disposables.push(blockGeo, blockMat);

    // --- 2. 气缸组 (Cylinders & Pistons) ---
    const cylCount = 6;
    const cylSpacing = 1.8;
    const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32, 1, true);
    const cylMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });

    for(let i=0; i<cylCount; i++) {
        const xPos = (i - (cylCount-1)/2) * cylSpacing;
        
        // Cylinder
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        cyl.position.set(xPos, 2, 0);
        mainGroup.add(cyl);

        // Piston Head
        const pistonGroup = new THREE.Group();
        const pistonGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.8, 32);
        const pistonMat = new THREE.MeshStandardMaterial({ 
            color: 0x94a3b8, 
            metalness: 1, 
            roughness: 0.1,
            emissive: i === 2 && healthStatus < 0.8 ? 0xff0000 : 0x000000, // 模拟异常缸
            emissiveIntensity: 0.5
        });
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        pistonGroup.add(piston);
        pistonGroup.position.set(xPos, 2, 0);
        mainGroup.add(pistonGroup);
        animatables.pistons?.push(pistonGroup);

        // Combustion Light
        const light = new THREE.PointLight(0xff5500, 0, 5);
        light.position.set(xPos, 3.8, 0);
        mainGroup.add(light);
        animatables.combustionGlows?.push(light);

        disposables.push(pistonGeo, pistonMat);
    }
    disposables.push(cylGeo, cylMat);

    // --- 3. 增压器 (Turbocharger) ---
    const turboGroup = new THREE.Group();
    const turboGeo = new THREE.SphereGeometry(1.2, 32, 16);
    turboGeo.scale(1, 0.8, 1.5);
    const turboMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const turbo = new THREE.Mesh(turboGeo, turboMat);
    turboGroup.add(turbo);
    turboGroup.position.set(5, 4, 1.5);
    mainGroup.add(turboGroup);
    animatables.turbocharger = turboGroup;
    disposables.push(turboGeo, turboMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speed = 2 + loadLevel * 8; // 转速随负荷变化

      // 活塞往复运动 (二冲程模拟)
      animatables.pistons?.forEach((p, i) => {
          const phase = i * (Math.PI * 2 / cylCount);
          const yOffset = Math.sin(time * speed + phase);
          p.position.y = 2 + yOffset * 1.5;
          
          // 燃烧闪烁效果 (上死点附近)
          if (animatables.combustionGlows) {
              const light = animatables.combustionGlows[i];
              light.intensity = yOffset > 0.8 ? (yOffset - 0.8) * 50 * loadLevel : 0;
          }
      });

      // 增压器自转
      if (animatables.turbocharger) {
          animatables.turbocharger.rotation.z += speed * 0.1;
      }

      // 异常缸指示
      if (healthStatus < 0.8) {
          const errorCyl = animatables.pistons![2];
          errorCyl.scale.setScalar(1 + Math.sin(time * 20) * 0.02);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [loadLevel, healthStatus, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
