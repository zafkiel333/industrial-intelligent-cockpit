import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroTurbineOverhaulProps } from './three-types';

// Helper function to clean up existing canvas if any
const cleanupCanvas = () => {
  const existingCanvas = document.querySelector('canvas');
  if (existingCanvas) {
    const parent = existingCanvas.parentElement;
    if (parent) {
      parent.removeChild(existingCanvas);
    }
  }
};

export const ThreeScene: React.FC<HydroTurbineOverhaulProps> = ({ speed = 0, status = '待机', rotationY = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const turbineMeshRef = useRef<THREE.Mesh | null>(null);
  const rotorMeshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  const propsRef = useRef({ speed, status, rotationY });

  useEffect(() => {
    propsRef.current = { speed, status, rotationY };
  }, [speed, status, rotationY]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Cleanup previous canvas and renderer ---
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (sceneRef.current) {
      // Dispose of all geometries and materials in the scene
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

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 5, 15); // Adjusted camera position

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
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.target.set(0, 1, 0); // Target the center of the turbine
    controlsRef.current = controls;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Turbine Model ---
    // Main casing (simplified cylinder)
    const casingGeometry = new THREE.CylinderGeometry(4, 4, 10, 32, 1, true);
    const casingMaterial = new THREE.MeshStandardMaterial({ color: 0x334455, side: THREE.DoubleSide, metalness: 0.8, roughness: 0.3 });
    const casingMesh = new THREE.Mesh(casingGeometry, casingMaterial);
    casingMesh.position.y = 0;
    scene.add(casingMesh);
    turbineMeshRef.current = casingMesh;

    // Rotor (simplified cylinder)
    const rotorGeometry = new THREE.CylinderGeometry(2, 2, 8, 32, 1, true);
    const rotorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide, metalness: 0.9, roughness: 0.1 });
    const rotorMesh = new THREE.Mesh(rotorGeometry, rotorMaterial);
    rotorMesh.position.y = 0;
    scene.add(rotorMesh);
    rotorMeshRef.current = rotorMesh;

    // Add some visual elements to represent water flow/energy
    const waterFlowGeometry = new THREE.TorusGeometry(3, 0.5, 16, 32);
    const waterFlowMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const waterFlowMesh = new THREE.Mesh(waterFlowGeometry, waterFlowMaterial);
    waterFlowMesh.rotation.x = Math.PI / 2;
    waterFlowMesh.position.y = -2;
    scene.add(waterFlowMesh);

    // --- Animation Loop ---
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;

      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Dynamic rotation based on speed and status
      let currentRotationSpeed = 0;
      if (currentProps.status === '运行中') {
        currentRotationSpeed = (currentProps.speed / 100) * 0.05; // Scale speed to rotation
      } else if (currentProps.status === '检修中') {
        currentRotationSpeed = 0.01; // Slow rotation during maintenance
      } else {
        currentRotationSpeed = 0; // No rotation when idle or faulted
      }

      if (rotorMeshRef.current) {
        rotorMeshRef.current.rotation.y += currentRotationSpeed;
      }
      if (waterFlowMesh) {
        waterFlowMesh.rotation.y += 0.02; // Constant flow animation
        waterFlowMesh.material.opacity = currentProps.status === '运行中' ? 0.7 : (currentProps.status === '检修中' ? 0.3 : 0.1);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // --- Resize Observer ---
    resizeObserverRef.current = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
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

    // --- Cleanup ---
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
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
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
