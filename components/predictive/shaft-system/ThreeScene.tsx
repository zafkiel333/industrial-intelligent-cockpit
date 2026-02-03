import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaftSystemAnimatables } from './three-types';

interface ThreeSceneProps {
  rpm?: number;
  misalignmentFactor?: number; // 0-1
  healthScore?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rpm = 120, 
  misalignmentFactor = 0.2,
  healthScore = 95
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 极光工业光影系统 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const topLight = new THREE.DirectionalLight(0xffffff, 2);
    topLight.position.set(5, 20, 10);
    scene.add(topLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 20, 50);
    cyanLight.position.set(-10, 5, 5);
    scene.add(cyanLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ShaftSystemAnimatables = { bearings: [] };
    const disposables: any[] = [];

    // --- 1. 推进轴 (The Main Shaft) ---
    const shaftGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.6, 0.6, 25, 64);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.2 
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaftGroup.add(shaft);
    group.add(shaftGroup);
    animatables.mainShaft = shaftGroup;
    disposables.push(shaftGeo, shaftMat);

    // --- 2. 螺旋桨 (Propeller) ---
    const propGroup = new THREE.Group();
    const hubGeo = new THREE.CylinderGeometry(0.7, 0.8, 2, 32);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, shaftMat);
    propGroup.add(hub);

    const bladeGeo = new THREE.BoxGeometry(0.2, 5, 1.5);
    bladeGeo.translate(0, 2.5, 0);
    for(let i=0; i<4; i++) {
        const blade = new THREE.Mesh(bladeGeo, shaftMat);
        blade.rotation.x = (i * Math.PI) / 2;
        blade.rotation.y = 0.5; // 螺距角
        propGroup.add(blade);
    }
    propGroup.position.x = 12.5;
    shaftGroup.add(propGroup);
    animatables.propeller = propGroup;

    // --- 3. 轴承支座 (Bearing Blocks) ---
    const bPositions = [-10, -3, 4, 10];
    const bGeo = new THREE.BoxGeometry(1.5, 2, 2);
    const bMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        transparent: true, 
        opacity: 0.8 
    });
    
    bPositions.forEach((pos, idx) => {
        const b = new THREE.Mesh(bGeo, bMat);
        b.position.x = pos;
        b.position.y = -1;
        group.add(b);
        
        // 关键节点高亮 (如果是尾轴承且健康度低)
        if (idx === 3 && healthScore < 85) {
            const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            b.add(glow);
        }
    });

    // --- 4. 理想中心线 (Alignment Baseline) ---
    const linePoints = [new THREE.Vector3(-15, 0, 0), new THREE.Vector3(15, 0, 0)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x22d3ee, dashSize: 0.5, gapSize: 0.3 });
    const baseline = new THREE.Line(lineGeo, lineMat);
    baseline.computeLineDistances();
    group.add(baseline);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speed = (rpm / 60) * 0.1;

      // 旋转模拟
      if (animatables.mainShaft) {
          animatables.mainShaft.rotation.x += speed;
          
          // 模拟不对中引起的轴向晃动 (Whirling)
          const wobble = misalignmentFactor * 0.05;
          animatables.mainShaft.position.y = Math.sin(time * 10) * wobble;
          animatables.mainShaft.position.z = Math.cos(time * 10) * wobble;
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
  }, [rpm, misalignmentFactor, healthScore]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};