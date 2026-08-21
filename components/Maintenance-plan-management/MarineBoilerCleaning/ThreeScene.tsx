import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MarineBoilerCleaningProps } from './three-types';

export const ThreeScene: React.FC<MarineBoilerCleaningProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffaa55, 1.5, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Boiler Group
    const boilerGroup = new THREE.Group();
    scene.add(boilerGroup);

    // Main Shell (Transparent to see inside)
    const shellGeo = new THREE.CylinderGeometry(5, 5, 12, 32);
    const shellMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x445566, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.3,
      transmission: 0.5
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    boilerGroup.add(shell);

    // Top and Bottom Caps
    const capGeo = new THREE.SphereGeometry(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.4 });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 6;
    boilerGroup.add(topCap);
    
    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.position.y = -6;
    bottomCap.rotation.x = Math.PI;
    boilerGroup.add(bottomCap);

    // Internal Tubes (Water/Smoke tubes)
    const tubes: THREE.Mesh[] = [];
    const tubeGeo = new THREE.CylinderGeometry(0.2, 0.2, 11.8, 8);
    const tubeMatNormal = new THREE.MeshStandardMaterial({ color: 0x883322, metalness: 0.5, roughness: 0.5 }); // Rusty/Hot
    const tubeMatClean = new THREE.MeshStandardMaterial({ color: 0x22aa88, metalness: 0.5, roughness: 0.5 }); // Chemical cleaning

    for (let r = 1; r <= 4; r += 1.5) {
      const count = r * 6;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const tube = new THREE.Mesh(tubeGeo, tubeMatNormal.clone());
        tube.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        boilerGroup.add(tube);
        tubes.push(tube);
      }
    }

    // Burner
    const burnerGeo = new THREE.CylinderGeometry(1.5, 2, 2, 16);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const burner = new THREE.Mesh(burnerGeo, burnerMat);
    burner.position.set(0, -5, 4);
    burner.rotation.x = Math.PI / 2;
    boilerGroup.add(burner);

    // Flame/Chemical Fluid effect
    const fluidGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const fluidMat = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8 });
    const fluid = new THREE.Mesh(fluidGeo, fluidMat);
    fluid.position.set(0, -5, 2);
    boilerGroup.add(fluid);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { pressure, temperature, isCleaning } = propsRef.current;

      if (!isCleaning) {
        // Normal operation: Hot, pulsating flame
        scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
        fluidMat.color.setHex(0xff5500); // Fire
        fluid.scale.set(1 + Math.sin(time * 10) * 0.1, 1 + Math.sin(time * 15) * 0.2, 1 + Math.sin(time * 10) * 0.1);
        
        // Tubes look hot
        const heatColor = new THREE.Color(0x883322).lerp(new THREE.Color(0xffaa00), Math.max(0, (temperature - 100) / 100));
        tubes.forEach(t => (t.material as THREE.MeshStandardMaterial).color.copy(heatColor));
        
        // Shell pulses slightly with pressure
        shell.scale.setScalar(1 + (pressure / 100) * 0.02);
      } else {
        // Cleaning mode: Cool, chemical circulation
        scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
        fluidMat.color.setHex(0x00ffaa); // Chemical fluid
        fluid.scale.set(1.5, 1.5, 1.5); // Fill bottom
        
        // Tubes turn green/clean progressively
        const cleanPhase = (Math.sin(time * 0.5) + 1) / 2;
        const cleanColor = new THREE.Color(0x883322).lerp(new THREE.Color(0x22aa88), cleanPhase);
        tubes.forEach(t => (t.material as THREE.MeshStandardMaterial).color.copy(cleanColor));
        
        shell.scale.setScalar(1);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      tubeGeo.dispose();
      tubes.forEach(t => (t.material as THREE.Material).dispose());
      tubeMatNormal.dispose();
      tubeMatClean.dispose();
      burnerGeo.dispose();
      burnerMat.dispose();
      fluidGeo.dispose();
      fluidMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
