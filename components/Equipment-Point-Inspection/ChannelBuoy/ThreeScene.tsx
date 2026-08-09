import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ status?: any }> = ({ status }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ status });
  useEffect(() => {
    propsRef.current = { status };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

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

    // 1. Buoy Group
    const buoyGroup = new THREE.Group();
    
    const hullGeo = new THREE.CylinderGeometry(2.2, 2.2, 2.5, 32);
    const hullMat = new THREE.MeshStandardMaterial({ 
      color: 0xeab308, 
      metalness: 0.6, 
      roughness: 0.3 
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    buoyGroup.add(hull);

    const towerGeo = new THREE.CylinderGeometry(0.3, 1, 4, 8);
    const towerMat = new THREE.MeshStandardMaterial({ 
      color: 0xeab308, 
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 3.2;
    buoyGroup.add(tower);

    const panelGeo = new THREE.BoxGeometry(1, 0.05, 1.5);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const panel = new THREE.Mesh(panelGeo, panelMat);
      const angle = (i * Math.PI) / 2;
      panel.position.set(Math.cos(angle) * 1.4, 2, Math.sin(angle) * 1.4);
      panel.rotation.y = angle;
      panel.rotation.x = -Math.PI / 6;
      buoyGroup.add(panel);
    }

    const lanternGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
    const lanternMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      emissive: 0xffffff, 
      emissiveIntensity: 1 
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 5.3;
    buoyGroup.add(lantern);

    const lanternGlow = new THREE.PointLight(0xffff00, 0, 15);
    lanternGlow.position.y = 5.5;
    buoyGroup.add(lanternGlow);

    scene.add(buoyGroup);

    const oceanSize = 60;
    const oceanSegments = 40;
    const oceanGeo = new THREE.PlaneGeometry(oceanSize, oceanSize, oceanSegments, oceanSegments);
    const oceanMat = new THREE.MeshPhongMaterial({ 
      color: 0x075985, 
      transparent: true, 
      opacity: 0.4, 
      wireframe: true 
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -1.2;
    scene.add(ocean);

    const scanRingGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.4 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scene.add(scanRing);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentStatus = propsRef.current.status;
      const time = Date.now() * 0.001;

      buoyGroup.position.y = Math.sin(time * 0.8) * 0.2;
      buoyGroup.rotation.x = Math.sin(time * 0.6) * 0.1;
      buoyGroup.rotation.z = Math.cos(time * 0.7) * 0.08;

      const positions = ocean.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i+1];
        positions[i+2] = Math.sin(x * 0.3 + time) * 0.3 + Math.cos(y * 0.3 + time) * 0.3;
      }
      ocean.geometry.attributes.position.needsUpdate = true;

      const flash = (time % 4) < 0.5 ? 1 : 0;
      lanternGlow.intensity = flash * 5;
      lanternMat.emissiveIntensity = flash * 2;
      
      if (currentStatus === 'warning') {
        lanternMat.color.setHex(0xfb923c);
        lanternMat.emissive.setHex(0xfb923c);
        lanternGlow.color.setHex(0xfb923c);
      } else if (currentStatus === 'error') {
        lanternMat.color.setHex(0xef4444);
        lanternMat.emissive.setHex(0xef4444);
        lanternGlow.color.setHex(0xef4444);
      } else {
        lanternMat.color.setHex(0xffffff);
        lanternMat.emissive.setHex(0xffffff);
        lanternGlow.color.setHex(0xffff00);
      }

      scanRing.scale.setScalar(1 + (time % 2) * 2);
      scanRing.material.opacity = 0.5 - (time % 2) * 0.25;
      scanRing.position.y = -1.2 + (time % 2) * 4;

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
