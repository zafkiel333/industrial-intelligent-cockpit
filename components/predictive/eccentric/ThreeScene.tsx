
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EccentricAnimatables } from './three-types';

interface ThreeSceneProps {
  rotationSpeed?: number;
  riskLevel?: number; // 0 to 1
  oilFlowActive?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  rotationSpeed = 0.05, 
  riskLevel = 0.2,
  oilFlowActive = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===eccentric useEffect===");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(6, 6, 8);

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffaa00, 50);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: EccentricAnimatables = {};
    const disposables: any[] = [];

    // 1. Eccentric Core (The Outer Sleeve)
    const sleeveGeo = new THREE.CylinderGeometry(2, 2.2, 5, 32, 1, true);
    const sleeveMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.DoubleSide, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    mainGroup.add(sleeve);
    disposables.push(sleeveGeo, sleeveMat);

    // 2. The Eccentric Bushing (Inner revolving part)
    const eccentricGroup = new THREE.Group();
    // Offset the center to simulate eccentricity
    eccentricGroup.position.x = 0.3; 
    mainGroup.add(eccentricGroup);
    animatables.eccentricShaft = eccentricGroup;

    const bushingGeo = new THREE.CylinderGeometry(1.4, 1.4, 4.8, 32);
    const bushingMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: riskLevel > 0.6 ? 0xff0000 : 0xf59e0b,
      emissiveIntensity: riskLevel * 0.5
    });
    const bushing = new THREE.Mesh(bushingGeo, bushingMat);
    eccentricGroup.add(bushing);
    animatables.bushing = bushing;
    disposables.push(bushingGeo, bushingMat);

    // 3. Thermal Hotspot Glow (Pulse near high risk)
    const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: 0xff3300, 
      transparent: true, 
      opacity: 0 
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 1;
    eccentricGroup.add(glow);
    animatables.heatGlow = glow;
    disposables.push(glowGeo, glowMat);

    // 4. Lubrication Oil Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.45 + Math.random() * 0.2;
      pPos[i*3] = Math.cos(angle) * r;
      pPos[i*3+1] = (Math.random() - 0.5) * 4;
      pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffcc00, size: 0.03, transparent: true, opacity: 0.6 });
    const oilParticles = new THREE.Points(pGeo, pMat);
    eccentricGroup.add(oilParticles);
    animatables.oilParticles = oilParticles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Rotation with wobbling
      if (animatables.eccentricShaft) {
        animatables.eccentricShaft.rotation.y += rotationSpeed;
        // Simulating the eccentric wobble
        animatables.eccentricShaft.position.x = Math.sin(time * 2) * 0.2;
        animatables.eccentricShaft.position.z = Math.cos(time * 2) * 0.2;
      }

      // Thermal glow pulse
      if (animatables.heatGlow) {
        animatables.heatGlow.material.opacity = (Math.sin(time * 5) * 0.2 + 0.3) * riskLevel;
        animatables.heatGlow.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
      }

      // Oil Flow
      if (oilFlowActive && animatables.oilParticles) {
        const positions = animatables.oilParticles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<pCount; i++) {
          positions[i*3+1] -= 0.05;
          if(positions[i*3+1] < -2) positions[i*3+1] = 2;
        }
        animatables.oilParticles.geometry.attributes.position.needsUpdate = true;
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [rotationSpeed, riskLevel, oilFlowActive]);

  return <div ref={mountRef} className="w-full h-full" />;
};
