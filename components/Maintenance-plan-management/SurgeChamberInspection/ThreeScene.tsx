import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SurgeChamberInspectionProps } from './three-types';

export const ThreeScene: React.FC<SurgeChamberInspectionProps> = ({ waterLevel = 50, status = '正常', inspectionProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const scannerRef = useRef<THREE.Mesh | null>(null);
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
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 30, 40);

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
    controls.maxPolarAngle = Math.PI / 2 + 0.2; // Allow looking slightly below horizon
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x00ffff, 0.6);
    dirLight.position.set(10, 50, 10);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x3b82f6, 1, 50);
    pointLight.position.set(0, -10, 0);
    scene.add(pointLight);

    // Surge Chamber Structure (Hollow Cylinder)
    const chamberHeight = 60;
    const chamberRadius = 15;
    const chamberGeo = new THREE.CylinderGeometry(chamberRadius, chamberRadius, chamberHeight, 64, 1, true);
    const chamberMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe: false
    });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    scene.add(chamber);

    // Wireframe overlay for tech look
    const wireframeGeo = new THREE.WireframeGeometry(chamberGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    scene.add(wireframe);

    // Bottom Base
    const baseGeo = new THREE.CylinderGeometry(chamberRadius + 2, chamberRadius + 2, 2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -chamberHeight / 2 - 1;
    scene.add(base);

    // Connecting Pipe
    const pipeGeo = new THREE.CylinderGeometry(4, 4, 30, 32);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(20, -chamberHeight / 2 + 5, 0);
    scene.add(pipe);

    // Water Level
    const waterGeo = new THREE.CylinderGeometry(chamberRadius - 0.2, chamberRadius - 0.2, chamberHeight, 32);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, 
      transparent: true, 
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    // Initial position based on waterLevel (0-100 mapped to chamber height)
    const normalizedLevel = Math.max(0, Math.min(100, waterLevel)) / 100;
    water.scale.y = normalizedLevel;
    water.position.y = -chamberHeight / 2 + (chamberHeight * normalizedLevel) / 2;
    scene.add(water);
    waterMeshRef.current = water;

    // Inspection Scanner (Ring)
    const scannerGeo = new THREE.TorusGeometry(chamberRadius + 0.5, 0.5, 16, 64);
    const scannerMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8 });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.rotation.x = Math.PI / 2;
    scanner.visible = false;
    scene.add(scanner);
    scannerRef.current = scanner;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.02;
      controlsRef.current.update();

      // Animate water level based on prop
      if (waterMeshRef.current) {
        const targetNormalizedLevel = Math.max(0, Math.min(100, waterLevel)) / 100;
        // Smooth transition
        waterMeshRef.current.scale.y += (targetNormalizedLevel - waterMeshRef.current.scale.y) * 0.05;
        // Ensure scale.y is never exactly 0 to avoid matrix issues
        if (waterMeshRef.current.scale.y < 0.001) waterMeshRef.current.scale.y = 0.001;
        waterMeshRef.current.position.y = -chamberHeight / 2 + (chamberHeight * waterMeshRef.current.scale.y) / 2;
        
        // Add slight wave effect to water
        waterMeshRef.current.rotation.y = Math.sin(time) * 0.05;
      }

      // Handle status and inspection progress
      if (scannerRef.current) {
        if (status === '巡检中' || status === '评估中') {
          scannerRef.current.visible = true;
          // Move scanner up and down based on progress (0-100)
          const scanPos = -chamberHeight / 2 + (chamberHeight * (inspectionProgress / 100));
          scannerRef.current.position.y += (scanPos - scannerRef.current.position.y) * 0.1;
          
          // Pulse effect
          (scannerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 10) * 0.3;
          
          if (status === '评估中') {
             (scannerRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xa855f7); // Purple
          } else {
             (scannerRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x3b82f6); // Blue
          }
        } else {
          scannerRef.current.visible = false;
        }
      }

      // Warning state
      if (status === '警告') {
        chamberMat.color.setHex(0x451a1a); // Dark red tint
        wireframeMat.color.setHex(0xf59e0b); // Amber wireframe
      } else {
        chamberMat.color.setHex(0x334155);
        wireframeMat.color.setHex(0x0ea5e9);
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
  }, [waterLevel, status, inspectionProgress]);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
