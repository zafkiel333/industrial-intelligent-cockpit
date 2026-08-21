import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CoolerState } from './three-types';

interface ThreeSceneProps {
  state: CoolerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CoolerState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);

    // Radiator Fins
    const finsGroup = new THREE.Group();
    const finCount = 20;
    const finMaterials: THREE.MeshStandardMaterial[] = [];

    for (let i = 0; i < finCount; i++) {
      const finGeo = new THREE.BoxGeometry(0.1, 8, 4);
      // Base color is grey, dirt makes it darker
      const finMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.7 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.x = (i - finCount / 2) * 0.4;
      finsGroup.add(fin);
      finMaterials.push(finMat);
    }
    scene.add(finsGroup);

    // Water Spray Particles
    const sprayGeo = new THREE.BufferGeometry();
    const sprayCount = 500;
    const sprayPos = new Float32Array(sprayCount * 3);
    const sprayVel = [];
    for(let i=0; i<sprayCount; i++) {
      sprayPos[i*3] = 0;
      sprayPos[i*3+1] = 0;
      sprayPos[i*3+2] = 5; // Start in front of fins
      sprayVel.push({
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: -Math.random() * 0.5 - 0.2 // Move towards fins
      });
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    const sprayMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const spray = new THREE.Points(sprayGeo, sprayMat);
    scene.add(spray);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update fin colors based on dirt level (100 = dark brown, 0 = clean grey)
      const dirtFactor = currentState.dirtLevel / 100;
      const cleanColor = new THREE.Color(0x94a3b8);
      const dirtyColor = new THREE.Color(0x451a03);
      
      finMaterials.forEach(mat => {
        mat.color.lerpColors(cleanColor, dirtyColor, dirtFactor);
      });

      // Rotate group slightly for better view
      finsGroup.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;

      // Water spray animation
      if (currentState.isCleaning) {
        spray.visible = true;
        const positions = sprayGeo.attributes.position.array as Float32Array;
        for(let i=0; i<sprayCount; i++) {
          positions[i*3] += sprayVel[i].x;
          positions[i*3+1] += sprayVel[i].y;
          positions[i*3+2] += sprayVel[i].z;

          // Reset particle if it hits the fins or goes too far
          if (positions[i*3+2] < -2 || Math.random() < 0.05) {
            // Start from the nozzle position (simulated by mouse pos)
            positions[i*3] = currentState.waterSprayPos.x;
            positions[i*3+1] = currentState.waterSprayPos.y;
            positions[i*3+2] = 5;
          }
        }
        sprayGeo.attributes.position.needsUpdate = true;
      } else {
        spray.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
