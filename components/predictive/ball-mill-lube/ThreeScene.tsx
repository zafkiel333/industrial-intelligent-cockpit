
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LubeAnimatables } from './three-types';

interface ThreeSceneProps {
  filmThickness?: number; // 0-1 (1 is healthy)
  contaminationLevel?: number; // 0-1
  isOperating?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  filmThickness = 0.8,
  contaminationLevel = 0.2,
  isOperating = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 10, 25);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 8, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const fluidLight = new THREE.PointLight(0x10b981, 15, 30);
    fluidLight.position.set(-5, 2, 5);
    scene.add(fluidLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: LubeAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 轴颈 (Trunnion) ---
    const trunnionGeo = new THREE.CylinderGeometry(4, 4, 6, 64);
    trunnionGeo.rotateZ(Math.PI / 2);
    const trunnionMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b, 
        metalness: 0.9, 
        roughness: 0.1 
    });
    const trunnion = new THREE.Mesh(trunnionGeo, trunnionMat);
    group.add(trunnion);
    animatables.trunnion = trunnion;
    disposables.push(trunnionGeo, trunnionMat);

    // --- 2. 轴瓦壳体 (Bearing Shell) ---
    const shellGeo = new THREE.CylinderGeometry(4.5, 4.5, 5, 32, 1, true, 0, Math.PI);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.4,
        wireframe: true 
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.y = -0.2;
    group.add(shell);
    disposables.push(shellGeo, shellMat);

    // --- 3. 动态油膜 (Dynamic Oil Film) ---
    const filmGeo = new THREE.CylinderGeometry(4.1, 4.1, 5.8, 64, 1, true, 0, Math.PI);
    filmGeo.rotateZ(Math.PI / 2);
    const filmMat = new THREE.MeshStandardMaterial({ 
        color: filmThickness < 0.4 ? 0xef4444 : 0x10b981, 
        transparent: true, 
        opacity: 0.6,
        emissive: filmThickness < 0.4 ? 0xff0000 : 0x10b981,
        emissiveIntensity: 0.5
    });
    const oilFilm = new THREE.Mesh(filmGeo, filmMat);
    oilFilm.position.y = -0.1;
    group.add(oilFilm);
    animatables.oilFilm = oilFilm;
    disposables.push(filmGeo, filmMat);

    // --- 4. 杂质颗粒流 (Contamination Particles) ---
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI;
        const r = 4.05 + Math.random() * 0.1;
        pPos[i*3] = (Math.random() - 0.5) * 5.5;
        pPos[i*3+1] = -Math.sin(angle) * r;
        pPos[i*3+2] = Math.cos(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: contaminationLevel > 0.6 ? 0xf59e0b : 0x94a3b8, 
        size: 0.05, 
        transparent: true, 
        opacity: contaminationLevel 
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.oilParticles = particles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (isOperating) {
          // 轴颈旋转
          if (animatables.trunnion) animatables.trunnion.rotation.x += 0.01;
          
          // 油膜脉动
          if (animatables.oilFilm) {
              const scale = 1 + Math.sin(time * 5) * 0.002;
              animatables.oilFilm.scale.set(1, scale, scale);
          }

          // 颗粒流动
          if (animatables.oilParticles) {
              const positions = animatables.oilParticles.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pCount; i++) {
                  positions[i*3] += 0.02; // 沿轴向缓慢流动
                  if (positions[i*3] > 2.7) positions[i*3] = -2.7;
              }
              animatables.oilParticles.geometry.attributes.position.needsUpdate = true;
          }
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
  }, [filmThickness, contaminationLevel, isOperating]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
