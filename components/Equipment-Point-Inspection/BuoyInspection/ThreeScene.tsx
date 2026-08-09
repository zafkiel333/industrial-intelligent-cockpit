import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ pitch?: number, roll?: number }> = ({ 
  pitch = 0, 
  roll = 0 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ pitch, roll });
  useEffect(() => {
    propsRef.current = { pitch, roll };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const OrbitControlsImpl = (OrbitControls as any).OrbitControls || OrbitControls;
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 浮标主体组
    const buoyGroup = new THREE.Group();
    
    // 浮体 (Body)
    const bodyGeo = new THREE.CylinderGeometry(2.5, 2.5, 3, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    buoyGroup.add(body);

    // 塔架 (Tower)
    const towerGeo = new THREE.CylinderGeometry(0.5, 1.2, 4, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xeab308, wireframe: true });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 3.5;
    buoyGroup.add(tower);

    // 灯器 (Lantern)
    const lanternGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
    const lanternMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      emissive: 0xffffff, 
      emissiveIntensity: 0.5 
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 5.8;
    buoyGroup.add(lantern);

    // 太阳能板 (Solar Panels)
    const panelGeo = new THREE.BoxGeometry(1.2, 0.1, 1.8);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8 });
    for(let i=0; i<4; i++) {
        const panel = new THREE.Mesh(panelGeo, panelMat);
        const angle = (i * Math.PI) / 2;
        panel.position.set(Math.cos(angle)*1.5, 4, Math.sin(angle)*1.5);
        panel.rotation.y = angle;
        panel.rotation.x = -Math.PI / 4;
        buoyGroup.add(panel);
    }

    scene.add(buoyGroup);

    // 2. 动态海平面 (点阵模拟)
    const oceanPoints = 2000;
    const oceanGeo = new THREE.BufferGeometry();
    const oceanPos = new Float32Array(oceanPoints * 3);
    for(let i=0; i<oceanPoints; i++) {
        oceanPos[i*3] = (Math.random() - 0.5) * 40;
        oceanPos[i*3+1] = -1.5;
        oceanPos[i*3+2] = (Math.random() - 0.5) * 40;
    }
    oceanGeo.setAttribute('position', new THREE.BufferAttribute(oceanPos, 3));
    const oceanMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.1, transparent: true, opacity: 0.3 });
    const ocean = new THREE.Points(oceanGeo, oceanMat);
    scene.add(ocean);

    // 3. 激光扫描环
    const scanRingGeo = new THREE.TorusGeometry(4, 0.02, 16, 100);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.5 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xeab308, 5, 20);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      const currentPitch = propsRef.current.pitch;
      const currentRoll = propsRef.current.roll;

      buoyGroup.rotation.x = Math.sin(time * 0.8) * 0.1 + (currentPitch * Math.PI / 180);
      buoyGroup.rotation.z = Math.cos(time * 0.7) * 0.08 + (currentRoll * Math.PI / 180);
      buoyGroup.position.y = Math.sin(time * 1.2) * 0.2;

      const positions = ocean.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<oceanPoints; i++) {
          const x = positions[i*3];
          const z = positions[i*3+2];
          positions[i*3+1] = -1.5 + Math.sin(x*0.2 + time) * 0.15 + Math.cos(z*0.3 + time) * 0.15;
      }
      ocean.geometry.attributes.position.needsUpdate = true;

      scanRing.scale.setScalar(1 + Math.sin(time * 2) * 0.5);
      scanRing.position.y = 3 + Math.sin(time) * 3;
      scanRing.material.opacity = 0.5 - (Math.abs(Math.sin(time)) * 0.3);

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
