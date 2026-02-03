
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SteeringFailureAnimatables } from './three-types';

interface ThreeSceneProps {
  daysOffset: number; // 0-30 天
  isSimulating: boolean;
  healthScore: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  daysOffset = 0, 
  isSimulating = true,
  healthScore = 90
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高级照明系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    blueLight.position.set(-10, 5, 5);
    scene.add(blueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SteeringFailureAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 舵柄与轴系 (Tiller & Shaft) ---
    const tillerGroup = new THREE.Group();
    const tillerGeo = new THREE.BoxGeometry(5, 0.5, 1.2);
    const tillerMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.1 
    });
    const tiller = new THREE.Mesh(tillerGeo, tillerMat);
    tiller.position.x = 2.5;
    tillerGroup.add(tiller);
    group.add(tillerGroup);
    animatables.mainTiller = tillerGroup;

    // --- 2. 液压执行缸 (Actuators) ---
    const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 32);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.6 });
    
    const cylL = new THREE.Mesh(cylGeo, cylMat);
    cylL.position.set(-3, 0, 1);
    group.add(cylL);
    animatables.actuatorL = cylL;

    const cylR = cylL.clone();
    cylR.position.set(-3, 0, -1);
    group.add(cylR);
    animatables.actuatorR = cylR;

    // 内部活塞 (Pistons)
    const pistonGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 32);
    pistonGeo.rotateZ(Math.PI / 2);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
    
    const pL = new THREE.Mesh(pistonGeo, pistonMat);
    pL.position.set(-1, 0, 1);
    group.add(pL);
    animatables.pistonL = pL;

    const pR = pL.clone();
    pR.position.set(-1, 0, -1);
    group.add(pR);
    animatables.pistonR = pR;

    // --- 3. 风险警告光环 ---
    const auraGeo = new THREE.TorusGeometry(6, 0.03, 16, 100);
    auraGeo.rotateX(Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2 });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    scene.add(aura);
    animatables.riskAura = aura;

    // --- 4. 扫描切片特效 ---
    const scanGeo = new THREE.BoxGeometry(10, 0.05, 5);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.3 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    group.add(scanner);
    animatables.scanningFringe = scanner;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 模拟劣化程度随时间轴增加 (0-30天映射)
      const severity = daysOffset / 30; 
      
      if (isSimulating) {
        // 随动运动
        const angle = Math.sin(time) * 0.5;
        if (animatables.mainTiller) animatables.mainTiller.rotation.y = angle;
        
        const travel = Math.sin(angle) * 3;
        if (animatables.pistonL) animatables.pistonL.position.x = -1 + travel;
        if (animatables.pistonR) animatables.pistonR.position.x = -1 - travel;

        // 抖动感：随未来时间推移，机械抖动加剧
        if (severity > 0.4) {
          group.position.y = Math.sin(time * 60) * (0.02 * severity);
          tillerMat.emissive.setHex(0xef4444);
          tillerMat.emissiveIntensity = severity * 0.5;
        } else {
          group.position.y = 0;
          tillerMat.emissiveIntensity = 0;
        }
      }

      // 扫描移动
      if (scanner) {
        scanner.position.y = Math.sin(time * 2) * 4;
      }

      // 风险环脉动
      if (aura) {
        const pulse = 1 + Math.sin(time * 2) * 0.1;
        aura.scale.set(pulse, pulse, pulse);
        auraMat.color.setHSL(0.5 - (severity * 0.5), 1, 0.5); // 青色转红色
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
  }, [daysOffset, isSimulating, healthScore]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
