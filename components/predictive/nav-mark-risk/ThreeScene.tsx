
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NavMarkAnimatables, NavMarkViewMode } from './three-types';

interface ThreeSceneProps {
  waveHeight?: number; // 0-5m
  lightStatus?: boolean;
  driftDistance?: number;
  viewMode?: NavMarkViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  waveHeight = 1.5,
  lightStatus = true,
  driftDistance = 0,
  viewMode = 'standard'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===nav-mark-risk useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020610); // Deep ocean night
    scene.fog = new THREE.FogExp2(0x020610, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 6, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
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
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below water
    controls.minDistance = 5;
    controls.maxDistance = 40;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xa5bcff, 0.5);
    moonLight.position.set(-10, 20, -10);
    scene.add(moonLight);

    const warningLight = new THREE.PointLight(0xff0000, 0, 20); // For critical status
    warningLight.position.set(0, 5, 0);
    scene.add(warningLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: NavMarkAnimatables = {};
    const disposables: any[] = [];

    // --- 1. Water Surface (Wireframe Grid for Tech feel) ---
    const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({ 
        color: 0x004466, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.2 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);
    animatables.waterPlane = water;
    disposables.push(waterGeo, waterMat);

    // --- 2. The Buoy (Floating Object) ---
    const buoyGroup = new THREE.Group();
    group.add(buoyGroup);
    animatables.buoyGroup = buoyGroup;

    // Hull (Float)
    const hullGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    const hullMat = new THREE.MeshStandardMaterial({ 
        color: 0xfacc15, // Safety Yellow
        metalness: 0.6, 
        roughness: 0.2 
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0;
    buoyGroup.add(hull);

    // Tower Structure
    const towerGeo = new THREE.CylinderGeometry(0.2, 1.2, 3, 4); // Truss-like shape
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.4 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 2.5;
    buoyGroup.add(tower);

    // Lantern (Top Light)
    const lanternGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 4.2;
    buoyGroup.add(lantern);
    animatables.lightMesh = lantern;

    // The Actual Light Source
    const signalLight = new THREE.PointLight(0xffaa00, 0, 50);
    signalLight.position.set(0, 4.5, 0);
    buoyGroup.add(signalLight);
    animatables.lightSource = signalLight;

    // Solar Panels
    const solarGeo = new THREE.BoxGeometry(0.8, 0.05, 1.2);
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    for(let i=0; i<4; i++) {
        const panel = new THREE.Mesh(solarGeo, solarMat);
        panel.position.y = 1.2;
        panel.position.x = Math.sin(i * Math.PI/2) * 1.0;
        panel.position.z = Math.cos(i * Math.PI/2) * 1.0;
        panel.lookAt(0, 3, 0); // Angle upwards
        buoyGroup.add(panel);
    }
    
    disposables.push(hullGeo, hullMat, towerGeo, towerMat, lanternGeo, lanternMat, solarGeo, solarMat);

    // --- 3. Mooring Chain (Line) ---
    const chainPoints = [];
    for(let i=0; i<=10; i++) {
        chainPoints.push(new THREE.Vector3(0, -1 - i, 0)); // Initial straight down
    }
    const chainGeo = new THREE.BufferGeometry().setFromPoints(chainPoints);
    const chainMat = new THREE.LineBasicMaterial({ color: 0x555555, linewidth: 2 });
    const chain = new THREE.Line(chainGeo, chainMat);
    // Chain is attached to buoy but anchored at bottom (simulated visually)
    scene.add(chain); // Add to scene, not buoy group, to simulate slack
    animatables.chainLine = chain;
    disposables.push(chainGeo, chainMat);

    // --- 4. Scanning Radar (If looking for drift) ---
    const scanGeo = new THREE.RingGeometry(5, 5.1, 64);
    scanGeo.rotateX(-Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanner);
    animatables.radarScanner = scanner;
    disposables.push(scanGeo, scanMat);

    // Animation Loop
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // 1. Wave Motion (Buoy Bobbing)
      if (animatables.buoyGroup) {
          const waveY = Math.sin(time * 2) * (waveHeight * 0.2);
          const roll = Math.sin(time * 1.5) * (waveHeight * 0.05);
          const pitch = Math.cos(time * 1.3) * (waveHeight * 0.05);

          animatables.buoyGroup.position.y = waveY;
          // Apply drift visual
          animatables.buoyGroup.position.x = Math.sin(time * 0.5) * (driftDistance * 0.1); 
          animatables.buoyGroup.rotation.x = pitch;
          animatables.buoyGroup.rotation.z = roll;

          // 2. Chain Dynamics (Simple IK-like visual)
          if (animatables.chainLine) {
             const positions = animatables.chainLine.geometry.attributes.position.array as Float32Array;
             const startPos = animatables.buoyGroup.position.clone().add(new THREE.Vector3(0, -1.5, 0)); // Bottom of hull
             // Anchor point (fixed)
             const endPos = new THREE.Vector3(0, -12, 0); 
             
             // Update chain points
             for(let i=0; i<=10; i++) {
                 const t = i / 10;
                 // Catenary-ish curve interpolation
                 const x = THREE.MathUtils.lerp(startPos.x, endPos.x, t);
                 const y = THREE.MathUtils.lerp(startPos.y, endPos.y, t) - Math.sin(t * Math.PI) * 2; // Slack
                 const z = THREE.MathUtils.lerp(startPos.z, endPos.z, t);
                 
                 positions[i*3] = x;
                 positions[i*3+1] = y;
                 positions[i*3+2] = z;
             }
             animatables.chainLine.geometry.attributes.position.needsUpdate = true;
          }
      }

      // 3. Water Animation
      if (animatables.waterPlane) {
          // Simple UV scroll simulation by moving position slightly
          animatables.waterPlane.position.y = Math.sin(time * 2 - 1) * (waveHeight * 0.1) - 1;
      }

      // 4. Light Flashing (ISO Standard pattern simulation)
      if (animatables.lightSource && animatables.lightMesh) {
          if (lightStatus) {
              // Flash every 4 seconds (FL 4s)
              const flash = Math.floor(time * 2) % 8 === 0; 
              animatables.lightSource.intensity = flash ? 50 : 0;
              (animatables.lightMesh.material as THREE.MeshBasicMaterial).color.setHex(flash ? 0xffaa00 : 0x333333);
          } else {
              animatables.lightSource.intensity = 0;
          }
      }

      // 5. Radar/Drift Warning
      if (animatables.radarScanner) {
          if (viewMode === 'mooring-strain' || driftDistance > 20) {
              const s = 1 + (Math.sin(time * 5) + 1) * 0.5;
              animatables.radarScanner.scale.setScalar(s);
              (animatables.radarScanner.material as THREE.MeshBasicMaterial).opacity = 0.5 - s * 0.2;
              animatables.radarScanner.visible = true;
          } else {
              animatables.radarScanner.visible = false;
          }
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
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [waveHeight, lightStatus, driftDistance, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
