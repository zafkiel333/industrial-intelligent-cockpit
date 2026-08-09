import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NavigationLockOverhaulProps } from './three-types';

export const ThreeScene: React.FC<NavigationLockOverhaulProps> = ({ waterLevel = 45.5, gateStatus = '开启', maintenanceProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Scene objects
  const waterRef = useRef<THREE.Mesh | null>(null);
  const leftGateRef = useRef<THREE.Group | null>(null);
  const rightGateRef = useRef<THREE.Group | null>(null);
  const scaffoldRef = useRef<THREE.Group | null>(null);

  const propsRef = useRef({ waterLevel, gateStatus, maintenanceProgress });

  useEffect(() => {
    propsRef.current = { waterLevel, gateStatus, maintenanceProgress };
  }, [waterLevel, gateStatus, maintenanceProgress]);

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
    camera.position.set(0, 40, 60);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Lock Structure
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    
    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(10, 40, 80);
    const leftWall = new THREE.Mesh(leftWallGeo, concreteMat);
    leftWall.position.set(-25, 10, 0);
    scene.add(leftWall);

    // Right Wall
    const rightWallGeo = new THREE.BoxGeometry(10, 40, 80);
    const rightWall = new THREE.Mesh(rightWallGeo, concreteMat);
    rightWall.position.set(25, 10, 0);
    scene.add(rightWall);

    // Bottom
    const bottomGeo = new THREE.BoxGeometry(40, 2, 80);
    const bottom = new THREE.Mesh(bottomGeo, concreteMat);
    bottom.position.set(0, -9, 0);
    scene.add(bottom);

    // Miter Gates (Downstream)
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    
    // Left Gate
    const leftGateGroup = new THREE.Group();
    const leftGatePanel = new THREE.Mesh(new THREE.BoxGeometry(22, 30, 2), gateMat);
    leftGatePanel.position.set(11, 15, 0); // Offset so pivot is at origin
    leftGateGroup.add(leftGatePanel);
    leftGateGroup.position.set(-20, -8, 30);
    scene.add(leftGateGroup);
    leftGateRef.current = leftGateGroup;

    // Right Gate
    const rightGateGroup = new THREE.Group();
    const rightGatePanel = new THREE.Mesh(new THREE.BoxGeometry(22, 30, 2), gateMat);
    rightGatePanel.position.set(-11, 15, 0); // Offset so pivot is at origin
    rightGateGroup.add(rightGatePanel);
    rightGateGroup.position.set(20, -8, 30);
    scene.add(rightGateGroup);
    rightGateRef.current = rightGateGroup;

    // Water
    const waterGeo = new THREE.BoxGeometry(40, 1, 80);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x0284c7, 
        transparent: true, 
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);
    waterRef.current = water;

    // Maintenance Scaffolding
    const scaffoldGroup = new THREE.Group();
    const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true });
    
    // Build scaffolding around gates
    for (let i = 0; i < 3; i++) {
        const platform = new THREE.Mesh(new THREE.BoxGeometry(40, 0.5, 10), scaffoldMat);
        platform.position.set(0, i * 10, 25);
        scaffoldGroup.add(platform);
    }
    for (let x of [-18, -10, 0, 10, 18]) {
        const support = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 30), scaffoldMat);
        support.position.set(x, 15, 25);
        scaffoldGroup.add(support);
    }
    scaffoldGroup.position.y = -8;
    scaffoldGroup.visible = false;
    scene.add(scaffoldGroup);
    scaffoldRef.current = scaffoldGroup;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.016;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Update Water Level (map 30-65 to Y position -8 to +20)
      if (waterRef.current) {
          const normalizedLevel = (currentProps.waterLevel - 30) / (65 - 30);
          const targetY = -8 + normalizedLevel * 28;
          waterRef.current.position.y = targetY;
          
          // Scale water height slightly to look like a volume
          waterRef.current.scale.y = Math.max(0.1, normalizedLevel * 28);
          // Adjust position so bottom stays at -8
          waterRef.current.position.y = -8 + (waterRef.current.scale.y / 2);
      }

      // Animate Gates
      if (leftGateRef.current && rightGateRef.current) {
          let targetAngle = 0;
          if (currentProps.gateStatus === '开启') {
              targetAngle = Math.PI / 2.5; // Open inwards
          } else if (currentProps.gateStatus === '关闭' || currentProps.gateStatus === '检修中') {
              targetAngle = Math.PI / 12; // Closed (slight V shape)
          }

          // Smoothly interpolate current angle to target angle
          leftGateRef.current.rotation.y += (targetAngle - leftGateRef.current.rotation.y) * 0.05;
          rightGateRef.current.rotation.y += (-targetAngle - rightGateRef.current.rotation.y) * 0.05;
      }

      // Maintenance Visualization
      if (scaffoldRef.current) {
          if (currentProps.gateStatus === '检修中') {
              scaffoldRef.current.visible = true;
              // Build scaffolding based on progress
              scaffoldRef.current.scale.y = Math.max(0.01, currentProps.maintenanceProgress / 100);
              scaffoldRef.current.position.y = -8 + (30 * scaffoldRef.current.scale.y) / 2 - 15;
          } else {
              scaffoldRef.current.visible = false;
          }
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
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
