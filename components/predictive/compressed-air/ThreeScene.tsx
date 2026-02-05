
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AirSystemAnimatables } from './three-types';

interface ThreeSceneProps {
  pressureLevel?: number; // 0-1 (0.8 MPa standard)
  flowVelocity?: number; // 0-1
  isAnomalyActive?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  pressureLevel = 0.7, 
  flowVelocity = 0.5,
  isAnomalyActive = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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

    // --- 高动态科技光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const bluePoint = new THREE.PointLight(0x0ea5e9, 20, 50);
    bluePoint.position.set(-10, 5, 5);
    scene.add(bluePoint);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: AirSystemAnimatables = { leakGlows: new THREE.Group() };
    const disposables: any[] = [];

    // --- 1. 螺杆压缩机主机 (Compressor Block) ---
    const compGeo = new THREE.BoxGeometry(4, 3, 3);
    const compMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.9, 
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const compressor = new THREE.Mesh(compGeo, compMat);
    group.add(compressor);
    disposables.push(compGeo, compMat);

    // --- 2. 储气罐 (Air Storage Tank) ---
    const tankGeo = new THREE.CylinderGeometry(2, 2, 6, 32);
    const tankMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.8, 
        roughness: 0.4,
        emissive: 0x0ea5e9,
        emissiveIntensity: pressureLevel * 0.5
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(7, 1.5, 0);
    group.add(tank);
    animatables.storageTank = tank;
    disposables.push(tankGeo, tankMat);

    // --- 3. 气流管路与粒子系统 (Piping & Particles) ---
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2, 0, 0),
        new THREE.Vector3(5, 0, 0),
        new THREE.Vector3(7, 1.5, 0),
        new THREE.Vector3(9, 0, 0),
        new THREE.Vector3(12, 0, 0),
    ]);

    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    
    for(let i=0; i<pCount; i++) {
        const pt = curve.getPoint(i / pCount);
        pPos[i*3] = pt.x;
        pPos[i*3+1] = pt.y;
        pPos[i*3+2] = pt.z;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    
    const pMat = new THREE.PointsMaterial({ 
        size: 0.1, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const flowPoints = new THREE.Points(pGeo, pMat);
    group.add(flowPoints);
    animatables.airFlowParticles = flowPoints;
    disposables.push(pGeo, pMat);

    // --- 4. 异常泄漏点闪烁 (Leak Point) ---
    if (isAnomalyActive) {
        const leakGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const leakMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
        const leak = new THREE.Mesh(leakGeo, leakMat);
        leak.position.set(10, 0, 0);
        animatables.leakGlows?.add(leak);
        group.add(animatables.leakGlows!);
        disposables.push(leakGeo, leakMat);
    }

    // --- 5. 压力脉动场 (Pressure Pulse Aura) ---
    const pulseGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, wireframe: true });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.position.copy(tank.position);
    group.add(pulse);
    animatables.pressurePulse = pulse;
    disposables.push(pulseGeo, pulseMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 整体缓慢自转
      group.rotation.y += 0.002;

      // 空气粒子流动
      if (animatables.airFlowParticles) {
          const pos = animatables.airFlowParticles.geometry.attributes.position.array as Float32Array;
          const colors = animatables.airFlowParticles.geometry.attributes.color.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              let t = (i / pCount + time * flowVelocity * 0.2) % 1;
              const point = curve.getPoint(t);
              pos[i*3] = point.x + (Math.random() - 0.5) * 0.2;
              pos[i*3+1] = point.y + (Math.random() - 0.5) * 0.2;
              pos[i*3+2] = point.z + (Math.random() - 0.5) * 0.2;

              colors[i*3] = 0.14; 
              colors[i*3+1] = 0.71; 
              colors[i*3+2] = 0.93;
          }
          animatables.airFlowParticles.geometry.attributes.position.needsUpdate = true;
          animatables.airFlowParticles.geometry.attributes.color.needsUpdate = true;
      }

      // 压力脉冲效果
      if (animatables.pressurePulse) {
          const s = 1 + Math.sin(time * 5) * 0.05 * pressureLevel;
          animatables.pressurePulse.scale.set(s, s, s);
          (animatables.pressurePulse.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.sin(time * 5) * 0.05;
      }

      // 泄漏点异常报警
      if (animatables.leakGlows && isAnomalyActive) {
          animatables.leakGlows.children.forEach(l => {
              (l as THREE.Mesh).scale.setScalar(1 + Math.sin(time * 15) * 0.5);
          });
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
  }, [pressureLevel, flowVelocity, isAnomalyActive]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
