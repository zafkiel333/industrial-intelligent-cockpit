import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PowerTransformerMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<PowerTransformerMaintenanceProps> = (props) => {
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
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Transformer Main Tank
    const tankGeo = new THREE.BoxGeometry(8, 6, 6);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 }); // Slate-600
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 3;
    scene.add(tank);

    // Conservator Tank (Oil Reservoir)
    const conservatorGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32);
    conservatorGeo.rotateZ(Math.PI / 2);
    const conservatorMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 }); // Slate-500
    const conservator = new THREE.Mesh(conservatorGeo, conservatorMat);
    conservator.position.set(0, 7.5, 2);
    scene.add(conservator);

    // Oil Level Indicator (Visual)
    const oilLevelGeo = new THREE.CylinderGeometry(1.4, 1.4, 5.8, 32);
    oilLevelGeo.rotateZ(Math.PI / 2);
    const oilMat = new THREE.MeshStandardMaterial({ color: 0xeab308, transparent: true, opacity: 0.8 }); // Yellow-500
    const oilVisual = new THREE.Mesh(oilLevelGeo, oilMat);
    oilVisual.position.set(0, 7.5, 2);
    scene.add(oilVisual);

    // Bushings (High Voltage)
    const bushingGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 16);
    const bushingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2 }); // Slate-400 (Porcelain)
    for (let i = -2; i <= 2; i += 2) {
      const bushing = new THREE.Mesh(bushingGeo, bushingMat);
      bushing.position.set(i, 7.5, -1.5);
      scene.add(bushing);
      
      // Rings
      for (let j = 0; j < 4; j++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 16), bushingMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 6.5 + j * 0.5;
        ring.position.x = i;
        ring.position.z = -1.5;
        scene.add(ring);
      }
    }

    // Cooling Radiators
    const radiatorGroup = new THREE.Group();
    scene.add(radiatorGroup);
    const finGeo = new THREE.BoxGeometry(0.1, 4, 2);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x334155 }); // Slate-700
    
    // Left Radiator
    for (let i = -2; i <= 2; i += 0.5) {
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(-4.5, 3, i);
      radiatorGroup.add(fin);
    }
    // Right Radiator
    for (let i = -2; i <= 2; i += 0.5) {
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(4.5, 3, i);
      radiatorGroup.add(fin);
    }

    // Temperature Glow
    const tempLight = new THREE.PointLight(0xff0000, 0, 10);
    tempLight.position.set(0, 3, 0);
    scene.add(tempLight);

    // Oil Flow Particles (Draining/Refilling)
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 0.5;
      particlePos[i * 3 + 1] = 0;
      particlePos[i * 3 + 2] = 3 + (Math.random() - 0.5) * 0.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xeab308, size: 0.2, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMaterial);
    particles.position.set(0, 0, 0);
    scene.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { oilLevel, temperature, isDraining, isRefilling } = propsRef.current;

      // Update Oil Level Visual (Scale Y axis of the rotated cylinder)
      const scale = Math.max(0.01, oilLevel / 100);
      oilVisual.scale.set(1, 1, scale);
      // Adjust position to keep it 'bottom' aligned within the conservator
      oilVisual.position.y = 7.5 - (1.5 * (1 - scale));

      // Temperature effect
      if (temperature > 60) {
        tempLight.intensity = (temperature - 60) / 40 * 5; // Max intensity at 100C
        tankMat.color.setHex(0x475569).lerp(new THREE.Color(0x7f1d1d), (temperature - 60) / 80); // Red tint
      } else {
        tempLight.intensity = 0;
        tankMat.color.setHex(0x475569);
      }

      // Oil Flow Animation
      if (isDraining || isRefilling) {
        particles.visible = true;
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          if (isDraining) {
            positions[i * 3 + 1] -= delta * 5; // Flow down
            if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 3;
          } else if (isRefilling) {
            positions[i * 3 + 1] += delta * 5; // Flow up
            if (positions[i * 3 + 1] > 3) positions[i * 3 + 1] = 0;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particles.visible = false;
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
      tankGeo.dispose();
      tankMat.dispose();
      conservatorGeo.dispose();
      conservatorMat.dispose();
      oilLevelGeo.dispose();
      oilMat.dispose();
      bushingGeo.dispose();
      bushingMat.dispose();
      finGeo.dispose();
      finMat.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
