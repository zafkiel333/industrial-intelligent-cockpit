import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AuxGenAnimatables } from './three-types';

interface ThreeSceneProps {
  loadLevel?: number; // 0-1
  healthScore?: number; // 0-100
  isParallel?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  loadLevel = 0.5, 
  healthScore = 90,
  isParallel = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 环境光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const cyanPoint = new THREE.PointLight(0x22d3ee, 10, 50);
    cyanPoint.position.set(-5, 5, 5);
    scene.add(cyanPoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: AuxGenAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 柴油机部分 (Diesel Engine) ---
    const engineGroup = new THREE.Group();
    const engineBlockGeo = new THREE.BoxGeometry(4, 2.5, 2.5);
    const engineBlockMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.3 
    });
    const engineBlock = new THREE.Mesh(engineBlockGeo, engineBlockMat);
    engineGroup.add(engineBlock);
    
    // 气缸盖细节
    const cylGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for(let i=0; i<6; i++) {
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        cyl.position.set((i - 2.5) * 0.6, 1.3, 0);
        engineGroup.add(cyl);
    }
    group.add(engineGroup);
    animatables.dieselEngine = engineGroup;

    // --- 2. 发电机部分 (Alternator) ---
    const genGeo = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    genGeo.rotateZ(Math.PI / 2);
    const genMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.9, 
        roughness: 0.1,
        transparent: true,
        opacity: 0.8,
        emissive: 0x0ea5e9,
        emissiveIntensity: loadLevel * 0.5
    });
    const generator = new THREE.Mesh(genGeo, genMat);
    generator.position.x = 4;
    group.add(generator);
    animatables.alternator = generator;

    // --- 3. 磁场流线 (Magnetic Flux Simulation) ---
    const fluxGroup = new THREE.Group();
    const fluxCount = 12;
    for(let i=0; i<fluxCount; i++) {
        const ringGeo = new THREE.TorusGeometry(1.5, 0.01, 8, 50);
        ringGeo.rotateY(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0x22d3ee, 
            transparent: true, 
            opacity: 0.3 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.x = 4 + (Math.random() - 0.5) * 2;
        fluxGroup.add(ring);
    }
    group.add(fluxGroup);
    animatables.magneticFluxLines = fluxGroup;

    // --- 4. 联轴器 (Coupling) ---
    const couplingGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
    couplingGeo.rotateZ(Math.PI / 2);
    const coupling = new THREE.Mesh(couplingGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 }));
    coupling.position.x = 2;
    group.add(coupling);
    animatables.coupling = coupling;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 旋转模拟 (根据负载调整速度感)
      const speed = 0.05 * (1 + loadLevel);
      if (animatables.dieselEngine) {
          animatables.dieselEngine.position.y = Math.sin(time * 50) * 0.01 * loadLevel; // 机械震动
      }
      
      // 磁场动态
      if (animatables.magneticFluxLines) {
          animatables.magneticFluxLines.rotation.x += speed * 2;
          animatables.magneticFluxLines.children.forEach((ring, i) => {
              (ring as THREE.Mesh).scale.setScalar(1 + Math.sin(time * 5 + i) * 0.1);
          });
      }

      // 健康度反馈
      if (healthScore < 80) {
          group.position.x = Math.sin(time * 30) * 0.02; // 异常震颤
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
  }, [loadLevel, healthScore, isParallel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};