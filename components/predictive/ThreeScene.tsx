
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PmAnimatables, PmSceneType } from './three-types';

interface ThreeSceneProps {
  type?: PmSceneType;
  deteriorationLevel?: number; // 0 to 1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  type = 'jaw-crusher-pm', 
  deteriorationLevel = 0.2 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("++++++++++++++++++++++++++++++++++++++++++++++");
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f2ff, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: PmAnimatables = {};
    const disposables: any[] = [];

    // --- Build Jaw Crusher Core Components ---
    
    // 1. Frame (Wireframe)
    const frameGeo = new THREE.BoxGeometry(6, 4, 4);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.2 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    group.add(frame);
    disposables.push(frameGeo, frameMat);

    // 2. Main Eccentric Shaft
    const shaftGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.1
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaftGroup.add(shaft);
    group.add(shaftGroup);
    animatables.mainShaft = shaftGroup;
    disposables.push(shaftGeo, shaftMat);

    // 3. Bearings (The focus of PM)
    const bearingGeo = new THREE.TorusGeometry(0.6, 0.2, 16, 32);
    const bearingMatNormal = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
    const bearingMatWarn = new THREE.MeshStandardMaterial({ 
        color: 0xffaa00, 
        emissive: 0xff4400, 
        emissiveIntensity: deteriorationLevel > 0.5 ? deteriorationLevel : 0 
    });
    
    const bearingL = new THREE.Mesh(bearingGeo, bearingMatNormal);
    bearingL.position.x = -1.8;
    bearingL.rotation.y = Math.PI / 2;
    shaftGroup.add(bearingL);
    animatables.bearingL = bearingL;

    const bearingR = new THREE.Mesh(bearingGeo, bearingMatWarn);
    bearingR.position.x = 1.8;
    bearingR.rotation.y = Math.PI / 2;
    shaftGroup.add(bearingR);
    animatables.bearingR = bearingR;
    disposables.push(bearingGeo, bearingMatNormal, bearingMatWarn);

    // 4. Swing Jaw
    const swingJawGroup = new THREE.Group();
    swingJawGroup.position.set(0, 0, 0);
    const jawGeo = new THREE.BoxGeometry(0.4, 3.5, 3);
    jawGeo.translate(0, -1.5, 0);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: false });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    swingJawGroup.add(jaw);
    shaftGroup.add(swingJawGroup);
    animatables.swingJaw = swingJawGroup;
    disposables.push(jawGeo, jawMat);

    // 5. Stress Wave Particles (Pulse effect)
    const createWaves = () => {
        const count = 50;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            pos[i*3] = (Math.random()-0.5)*0.5 + 1.8;
            pos[i*3+1] = (Math.random()-0.5)*1.5;
            pos[i*3+2] = (Math.random()-0.5)*1.5;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ 
            color: 0xff4400, 
            size: 0.05, 
            transparent: true, 
            opacity: deteriorationLevel 
        });
        return new THREE.Points(geo, mat);
    };
    const wave = createWaves();
    group.add(wave);
    disposables.push(wave.geometry, wave.material);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Shaft Rotation
      if (animatables.mainShaft) {
          animatables.mainShaft.rotation.x += 0.05;
      }

      // Eccentric swing animation
      if (animatables.swingJaw) {
          animatables.swingJaw.rotation.z = Math.sin(time * 5) * 0.1;
      }

      // Stress wave pulse
      wave.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
      wave.material.opacity = (0.3 + Math.sin(time * 10) * 0.2) * deteriorationLevel;

      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log("=== components predictive cleanup ===");
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [deteriorationLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
