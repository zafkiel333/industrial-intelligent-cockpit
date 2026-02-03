
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaftAnimatables, ShaftViewMode } from './three-types';

interface ThreeSceneProps {
  healthScore?: number;
  rpm?: number;
  viewMode?: ShaftViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  healthScore = 95,
  rpm = 45,
  viewMode = 'standard'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 8, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态光影系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const cyanLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    cyanLight.position.set(-10, 5, -5);
    scene.add(cyanLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ShaftAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 主轴 (Main Shaft) ---
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 64);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 1.0, 
        roughness: 0.15,
        transparent: viewMode === 'xray',
        opacity: viewMode === 'xray' ? 0.3 : 1.0
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    group.add(shaft);
    animatables.mainShaft = shaft;
    disposables.push(shaftGeo, shaftMat);

    // --- 2. 轴承座 (Bearing Houses) ---
    const createBearingUnit = (xPos: number, isCritical: boolean) => {
        const bGroup = new THREE.Group();
        bGroup.position.x = xPos;

        // 外壳
        const houseGeo = new THREE.BoxGeometry(1.5, 2, 2);
        const houseMat = new THREE.MeshStandardMaterial({ 
            color: 0x1e293b,
            metalness: 0.8,
            emissive: isCritical && healthScore < 70 ? 0xff0000 : 0x000000,
            emissiveIntensity: 0.5
        });
        const house = new THREE.Mesh(houseGeo, houseMat);
        bGroup.add(house);

        // 内部滚子模拟
        const rollerGeo = new THREE.TorusGeometry(0.9, 0.1, 16, 32);
        rollerGeo.rotateY(Math.PI / 2);
        const rollerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 });
        const roller = new THREE.Mesh(rollerGeo, rollerMat);
        bGroup.add(roller);

        return bGroup;
    };

    const bearingDE = createBearingUnit(-3.5, false); // 驱动端
    const bearingNDE = createBearingUnit(3.5, true);  // 非驱动端 (模拟异常点)
    group.add(bearingDE, bearingNDE);
    animatables.bearingDE = bearingDE;
    animatables.bearingNDE = bearingNDE;

    // --- 3. 联轴器 (Coupling) ---
    const coupGeo = new THREE.CylinderGeometry(1.2, 1.2, 1, 32);
    coupGeo.rotateZ(Math.PI / 2);
    const coup = new THREE.Mesh(coupGeo, shaftMat);
    coup.position.x = -4.8;
    group.add(coup);

    // --- 4. 扭矩流粒子 ---
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        pPos[i*3] = (Math.random() - 0.5) * 10;
        pPos[i*3+1] = Math.cos(angle) * 0.9;
        pPos[i*3+2] = Math.sin(angle) * 0.9;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x0ea5e9, 
        size: 0.05, 
        transparent: true, 
        opacity: viewMode === 'stress' ? 0.8 : 0 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.torqueParticles = particles;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speedFactor = (rpm / 60) * 0.2;

      // 自转
      if (animatables.mainShaft) {
          animatables.mainShaft.rotation.x += speedFactor;
      }
      
      // 扭矩粒子沿轴向移动
      if (viewMode === 'stress' && animatables.torqueParticles) {
          const positions = animatables.torqueParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3] += 0.05;
              if (positions[i*3] > 5) positions[i*3] = -5;
          }
          animatables.torqueParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 异常轴承微震动
      if (healthScore < 80 && animatables.bearingNDE) {
          animatables.bearingNDE.position.y = Math.sin(time * 50) * (0.01 * (100 - healthScore) / 100);
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
  }, [healthScore, rpm, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
