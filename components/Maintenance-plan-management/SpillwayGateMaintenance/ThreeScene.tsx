import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SpillwayGateMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<SpillwayGateMaintenanceProps> = ({ openingLevel = 0, status = '关闭' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gateMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const propsRef = useRef({ openingLevel, status });

  useEffect(() => {
    propsRef.current = { openingLevel, status };
  }, [openingLevel, status]);

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
    camera.position.set(15, 10, 20);

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
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Dam Structure
    const damGeo = new THREE.BoxGeometry(20, 10, 5);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(0, 0, -2.5);
    scene.add(dam);

    // Spillway Channel
    const channelGeo = new THREE.BoxGeometry(6, 10, 5);
    const channelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const channel = new THREE.Mesh(channelGeo, channelMat);
    channel.position.set(0, 0, -2.5);
    scene.add(channel);

    // Gate
    const gateGeo = new THREE.BoxGeometry(5.8, 8, 0.5);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(0, 1, 0);
    scene.add(gate);
    gateMeshRef.current = gate;

    // Water
    const waterGeo = new THREE.BoxGeometry(5.8, 1, 15);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6, roughness: 0.1 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, -4.5, 7.5);
    scene.add(water);
    waterMeshRef.current = water;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.05;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Animate gate position based on openingLevel
      if (gateMeshRef.current) {
        const targetY = 1 + (currentProps.openingLevel / 100) * 8; // Max lift is 8 units
        gateMeshRef.current.position.y += (targetY - gateMeshRef.current.position.y) * 0.1;
      }

      // Animate water flow
      if (waterMeshRef.current) {
        if (currentProps.openingLevel > 0) {
           waterMeshRef.current.scale.y = 1 + (currentProps.openingLevel / 100) * 2;
           waterMeshRef.current.position.z = 7.5 + Math.sin(time) * 0.1;
           const material = waterMeshRef.current.material as THREE.MeshStandardMaterial;
           material.opacity = 0.6 + Math.sin(time * 2) * 0.1;
        } else {
           waterMeshRef.current.scale.y = 1;
           const material = waterMeshRef.current.material as THREE.MeshStandardMaterial;
           material.opacity = 0.3;
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
