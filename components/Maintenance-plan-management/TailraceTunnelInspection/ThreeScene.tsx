import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TailraceTunnelInspectionProps } from './three-types';

export const ThreeScene: React.FC<TailraceTunnelInspectionProps> = ({ waterLevel = 5, status = '正常', maintenanceProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const workerRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const propsRef = useRef({ waterLevel, status, maintenanceProgress });

  useEffect(() => {
    propsRef.current = { waterLevel, status, maintenanceProgress };
  }, [waterLevel, status, maintenanceProgress]);

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
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    // Position camera inside the tunnel
    camera.position.set(0, 0, 20);

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
    // Restrict controls to stay somewhat inside the tunnel
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // Tunnel lights
    for (let i = -50; i <= 50; i += 20) {
      const pointLight = new THREE.PointLight(0xfef08a, 0.8, 30);
      pointLight.position.set(0, 8, i);
      scene.add(pointLight);
      
      // Light fixture
      const fixtureGeo = new THREE.BoxGeometry(1, 0.2, 1);
      const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(0, 9.5, i);
      scene.add(fixture);
    }

    // Tunnel Structure (Long Cylinder)
    const tunnelRadius = 10;
    const tunnelLength = 120;
    const tunnelGeo = new THREE.CylinderGeometry(tunnelRadius, tunnelRadius, tunnelLength, 32, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      roughness: 0.8,
      side: THREE.BackSide // Render inside
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);

    // Tunnel Grid/Ribs for visual detail
    const ribsGeo = new THREE.CylinderGeometry(tunnelRadius - 0.1, tunnelRadius - 0.1, tunnelLength, 32, 20, true);
    const ribsMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
    const ribs = new THREE.Mesh(ribsGeo, ribsMat);
    ribs.rotation.x = Math.PI / 2;
    scene.add(ribs);

    // Water
    const waterGeo = new THREE.PlaneGeometry(tunnelRadius * 2, tunnelLength);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, 
      transparent: true, 
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    // Initial water level
    water.position.y = -tunnelRadius + waterLevel;
    scene.add(water);
    waterMeshRef.current = water;

    // Maintenance Worker/Vehicle (Simplified representation)
    const workerGroup = new THREE.Group();
    
    // Vehicle body
    const vehicleGeo = new THREE.BoxGeometry(3, 2, 4);
    const vehicleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
    vehicle.position.y = 1;
    workerGroup.add(vehicle);
    
    // Headlight
    const headlight = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 6, 0.5, 1);
    headlight.position.set(0, 1.5, -2);
    headlight.target.position.set(0, 0, -10);
    workerGroup.add(headlight);
    workerGroup.add(headlight.target);

    // Start worker at end of tunnel
    workerGroup.position.set(0, -tunnelRadius + 0.5, 50);
    workerGroup.visible = false;
    scene.add(workerGroup);
    workerRef.current = workerGroup;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.02;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Animate water level
      if (waterMeshRef.current) {
        let targetLevel = currentProps.waterLevel;
        if (currentProps.status === '排空中') {
           // Simulate draining
           targetLevel = Math.max(0, waterMeshRef.current.position.y + tunnelRadius - 0.05);
        } else if (currentProps.status === '充水中') {
           // Simulate filling
           targetLevel = Math.min(10, waterMeshRef.current.position.y + tunnelRadius + 0.05);
        }
        
        const targetY = -tunnelRadius + targetLevel;
        waterMeshRef.current.position.y += (targetY - waterMeshRef.current.position.y) * 0.1;
        
        // Water flow effect (moving texture coordinates would be better, but this is a simple approximation)
        if (currentProps.status === '正常' || currentProps.status === '排空中' || currentProps.status === '充水中') {
           waterMeshRef.current.position.z = (time * 2) % 10;
        }

        // Hide water if level is very low
        waterMeshRef.current.visible = waterMeshRef.current.position.y > -tunnelRadius + 0.1;
      }

      // Animate worker during maintenance
      if (workerRef.current) {
        if (currentProps.status === '检修中') {
          workerRef.current.visible = true;
          // Move worker along tunnel based on progress
          const startZ = 50;
          const endZ = -50;
          const targetZ = startZ - ((startZ - endZ) * (currentProps.maintenanceProgress / 100));
          workerRef.current.position.z += (targetZ - workerRef.current.position.z) * 0.05;
          
          // Slight bobbing motion
          workerRef.current.position.y = -tunnelRadius + 0.5 + Math.sin(time * 5) * 0.1;
        } else {
          workerRef.current.visible = false;
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
