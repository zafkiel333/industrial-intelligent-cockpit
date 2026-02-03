
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { IdlerAnimatables } from './three-types';

interface ThreeSceneProps {
  wearSeverity?: number; // 0 to 1
  rotationSpeed?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearSeverity = 0.2,
  rotationSpeed = 0.05 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(6, 4, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态光影系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x0ea5e9, 20, 50);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: IdlerAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 托辊筒体 (Shell) - 半透明金属效果 ---
    const shellGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 64);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.receiveShadow = true;
    group.add(shell);
    animatables.shell = shell;
    disposables.push(shellGeo, shellMat);

    // --- 2. 轴承 (Bearings) ---
    const bearingGeo = new THREE.TorusGeometry(0.4, 0.15, 16, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ 
        color: wearSeverity > 0.6 ? 0xef4444 : 0x00ffcc,
        emissive: wearSeverity > 0.6 ? 0xff0000 : 0x000000,
        emissiveIntensity: 0.5
    });
    
    const bL = new THREE.Mesh(bearingGeo, bearingMat);
    bL.position.x = -2.5;
    bL.rotation.y = Math.PI / 2;
    group.add(bL);
    animatables.bearingL = bL;

    const bR = bL.clone();
    bR.position.x = 2.5;
    group.add(bR);
    animatables.bearingR = bR;
    disposables.push(bearingGeo, bearingMat);

    // --- 3. 轴心 (Shaft) ---
    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 7.5, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    group.add(shaft);
    disposables.push(shaftGeo);

    // --- 4. 内部热量点光 ---
    const heatGlow = new THREE.PointLight(0xff4400, wearSeverity * 5, 5);
    heatGlow.position.set(2.5, 0, 0);
    group.add(heatGlow);
    animatables.heatGlow = heatGlow;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 托辊旋转
      if (animatables.shell) {
          animatables.shell.rotation.x += rotationSpeed;
      }

      // 异常状态下的微震动模拟
      if (wearSeverity > 0.5) {
          group.position.y = Math.sin(time * 50) * 0.02 * wearSeverity;
          heatGlow.intensity = (2 + Math.sin(time * 10)) * wearSeverity;
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
  }, [wearSeverity, rotationSpeed]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
