import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PenstockValveMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<PenstockValveMaintenanceProps> = ({ openingAngle = 0, status = '正常', maintenanceProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const valveDiscRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      sceneRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(10, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Valve Body (Pipe section)
    const bodyGeo = new THREE.CylinderGeometry(4.5, 4.5, 8, 32, 1, true);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4 // Make it semi-transparent to see inside
    });
    const valveBody = new THREE.Mesh(bodyGeo, bodyMat);
    valveBody.rotation.z = Math.PI / 2;
    scene.add(valveBody);

    // Flanges
    const flangeGeo = new THREE.TorusGeometry(4.5, 0.5, 16, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const flange1 = new THREE.Mesh(flangeGeo, flangeMat);
    flange1.rotation.y = Math.PI / 2;
    flange1.position.x = -4;
    scene.add(flange1);
    const flange2 = new THREE.Mesh(flangeGeo, flangeMat);
    flange2.rotation.y = Math.PI / 2;
    flange2.position.x = 4;
    scene.add(flange2);

    // Valve Disc (Butterfly)
    const discGeo = new THREE.CylinderGeometry(4.4, 4.4, 0.5, 32);
    const discMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.9,
      roughness: 0.1
    });
    const valveDisc = new THREE.Mesh(discGeo, discMat);
    // Initial rotation (closed)
    valveDisc.rotation.x = Math.PI / 2;
    scene.add(valveDisc);
    valveDiscRef.current = valveDisc;

    // Valve Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 10, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    scene.add(shaft);

    // Actuator Box
    const actuatorGeo = new THREE.BoxGeometry(3, 4, 3);
    const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const actuator = new THREE.Mesh(actuatorGeo, actuatorMat);
    actuator.position.y = 6;
    scene.add(actuator);

    // Water Flow Visualization
    const waterGeo = new THREE.CylinderGeometry(4.2, 4.2, 16, 32);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.z = Math.PI / 2;
    scene.add(water);
    waterMeshRef.current = water;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.05;
      controlsRef.current.update();

      // Animate valve disc rotation based on openingAngle (0 to 90 degrees)
      if (valveDiscRef.current) {
        let targetRotation = Math.PI / 2; // Closed (90 degrees around X)
        
        if (status === '测试中') {
          // Simulate testing motion
          targetRotation = (Math.PI / 2) - (Math.sin(time * 0.5) * 0.5 + 0.5) * (Math.PI / 2);
        } else {
          // Normal operation based on openingAngle
          targetRotation = (Math.PI / 2) - (openingAngle * Math.PI / 180);
        }
        
        // Smooth rotation
        valveDiscRef.current.rotation.x += (targetRotation - valveDiscRef.current.rotation.x) * 0.1;
      }

      // Animate water flow based on valve opening
      if (waterMeshRef.current && valveDiscRef.current) {
        // Calculate effective opening (0 = closed, 1 = fully open)
        const effectiveOpening = 1 - (valveDiscRef.current.rotation.x / (Math.PI / 2));
        
        if (effectiveOpening > 0.05) {
          waterMeshRef.current.visible = true;
          (waterMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.2 + effectiveOpening * 0.4;
          // Simulate flow by moving texture or simple scaling (using scaling for simplicity here)
          waterMeshRef.current.scale.x = 1 + Math.sin(time * 2) * 0.02 * effectiveOpening;
        } else {
          waterMeshRef.current.visible = false;
        }
      }

      // Visual indicator for maintenance
      if (status === '检修中') {
        actuator.material.color.setHex(0x3b82f6); // Blue for maintenance
        // Flash light
        dirLight.intensity = 0.5 + Math.sin(time * 4) * 0.3;
      } else if (status === '警告') {
        actuator.material.color.setHex(0xf59e0b); // Amber for warning
        dirLight.intensity = 0.8;
      } else {
        actuator.material.color.setHex(0x1e293b); // Normal
        dirLight.intensity = 0.8;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    resizeObserverRef.current = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        for (let entry of entries) {
          if (entry.target === mountRef.current) {
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            if (cameraRef.current && rendererRef.current && width > 0 && height > 0) {
              cameraRef.current.aspect = width / height;
              cameraRef.current.updateProjectionMatrix();
              rendererRef.current.setSize(width, height, false);
            }
          }
        }
      });
    });

    if (mountRef.current) {
      resizeObserverRef.current.observe(mountRef.current);
    }

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
              else object.material.dispose();
            }
          }
        });
      }
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [openingAngle, status, maintenanceProgress]);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
