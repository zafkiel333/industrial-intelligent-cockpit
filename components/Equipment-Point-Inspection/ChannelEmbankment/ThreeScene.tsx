import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ChannelEmbankmentProps } from './three-types';

export const ThreeScene: React.FC<ChannelEmbankmentProps> = ({ mode, waterLevel }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ mode, waterLevel });
  useEffect(() => {
    propsRef.current = { mode, waterLevel };
  }, [mode, waterLevel]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const waterRef = useRef<THREE.Mesh | null>(null);
  const droneRef = useRef<THREE.Group | null>(null);
  const scannerRef = useRef<THREE.Mesh | null>(null);
  const sensorGroupRef = useRef<THREE.Group | null>(null);
  const embankmentMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#020617');

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // 2. Controls
    const OrbitControlsImpl = (OrbitControls as any).OrbitControls || OrbitControls;
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 10;
    controls.maxDistance = 50;

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1.5);
    pointLight1.position.set(-15, 15, -15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1);
    pointLight2.position.set(15, 5, 15);
    scene.add(pointLight2);

    // 4. Grid Helper
    const gridHelper = new THREE.GridHelper(100, 100, 0x00ffff, 0x004488);
    gridHelper.position.y = -0.9;
    // @ts-ignore
    gridHelper.material.transparent = true;
    // @ts-ignore
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // 5. Build Embankment
    const embankmentGroup = new THREE.Group();
    scene.add(embankmentGroup);

    // Embankment Structure (Digital Twin Style)
    const shape = new THREE.Shape();
    shape.moveTo(-6, -6); // Bottom left
    shape.lineTo(6, -6);  // Bottom right
    shape.lineTo(3, 6);   // Top right
    shape.lineTo(-3, 6);  // Top left
    shape.lineTo(-6, -6); // Close

    const extrudeSettings = {
      steps: 1,
      depth: 40,
      bevelEnabled: false
    };
    const embankmentGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    embankmentGeo.center();
    embankmentGeo.rotateY(Math.PI / 2);

    const embankmentMat = new THREE.MeshStandardMaterial({ 
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    embankmentMaterialRef.current = embankmentMat;
    const embankmentMesh = new THREE.Mesh(embankmentGeo, embankmentMat);
    embankmentMesh.position.set(0, 2, -4);
    embankmentGroup.add(embankmentMesh);

    // Inner Core (Solid but translucent)
    const coreGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    coreGeo.center();
    coreGeo.rotateY(Math.PI / 2);
    coreGeo.scale(0.95, 0.95, 0.95);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.6,
      roughness: 0.8
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 2, -4);
    embankmentGroup.add(coreMesh);

    // Base
    const baseGeo = new THREE.PlaneGeometry(50, 20);
    const baseMat = new THREE.MeshStandardMaterial({ 
      color: 0x06b6d4, 
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -1, -6);
    baseMesh.rotation.set(-Math.PI / 2, 0, 0);
    embankmentGroup.add(baseMesh);

    // Water
    const waterGeo = new THREE.PlaneGeometry(50, 15);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.4, 
      roughness: 0.1, 
      metalness: 0.8 
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, waterLevel, 4);
    waterMesh.rotation.set(-Math.PI / 2, 0, 0);
    waterRef.current = waterMesh;
    scene.add(waterMesh);

    // Drone
    const droneGroup = new THREE.Group();
    droneRef.current = droneGroup;
    scene.add(droneGroup);

    const droneGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const droneMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#00ffff', emissiveIntensity: 0.8 });
    const droneMesh = new THREE.Mesh(droneGeo, droneMat);
    droneGroup.add(droneMesh);

    const scannerGeo = new THREE.ConeGeometry(2.5, 6, 32);
    const scannerMat = new THREE.MeshBasicMaterial({ 
      color: '#00ffff', 
      transparent: true, 
      opacity: 0.3, 
      depthWrite: false, 
      blending: THREE.AdditiveBlending 
    });
    const scannerMesh = new THREE.Mesh(scannerGeo, scannerMat);
    scannerMesh.position.set(0, -3, 0);
    scannerMesh.rotation.set(Math.PI, 0, 0);
    scannerRef.current = scannerMesh;
    droneGroup.add(scannerMesh);

    // Sensors
    const sensorGroup = new THREE.Group();
    sensorGroupRef.current = sensorGroup;
    scene.add(sensorGroup);

    const sensorPositions = [
      [-15, 3, -3], [-5, 4, -3.5], [5, 2.5, -2.5], [15, 3.5, -3]
    ];
    const sensorGeo = new THREE.SphereGeometry(0.4, 16, 16);
    sensorPositions.forEach(pos => {
      const sensorMat = new THREE.MeshStandardMaterial({ 
        color: '#ff00ff', 
        emissive: '#ff00ff', 
        emissiveIntensity: 2 
      });
      const sensorMesh = new THREE.Mesh(sensorGeo, sensorMat);
      sensorMesh.position.set(pos[0], pos[1], pos[2]);
      sensorGroup.add(sensorMesh);
    });

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const currentMode = propsRef.current.mode;
      const currentWaterLevel = propsRef.current.waterLevel;

      if (waterRef.current) {
        waterRef.current.position.y = currentWaterLevel + Math.sin(t * 0.5) * 0.2;
        (waterRef.current.material as THREE.MeshStandardMaterial).opacity = 0.6 + Math.sin(t) * 0.1;
      }
      if (droneRef.current) {
        droneRef.current.position.x = Math.sin(t * 0.3) * 15;
        droneRef.current.position.y = 8 + Math.cos(t * 0.8) * 0.5;
        droneRef.current.position.z = Math.cos(t * 0.3) * 3 - 2;
      }
      if (scannerRef.current) {
        scannerRef.current.rotation.y += 0.05;
        (scannerRef.current.material as THREE.MeshBasicMaterial).opacity = (Math.sin(t * 8) + 1) / 2 * 0.4 + 0.1;
      }
      if (sensorGroupRef.current) {
        sensorGroupRef.current.children.forEach((child, index) => {
          const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 1 + Math.sin(t * 3 + index) * 0.8;
          
          if (currentMode === 'seepage') {
            material.color.set('#00ffff');
            material.emissive.set('#00ffff');
          } else {
            material.color.set('#ff00ff');
            material.emissive.set('#ff00ff');
          }
        });
      }

      if (embankmentMaterialRef.current) {
        const mat = embankmentMaterialRef.current;
        if (currentMode === 'stress') {
          mat.color.set('#ff3300');
          mat.wireframe = true;
          mat.emissive.set('#aa2200');
          mat.emissiveIntensity = 0.5;
          mat.transparent = false;
          mat.opacity = 1;
        } else if (currentMode === 'seepage') {
          mat.color.set('#0088ff');
          mat.wireframe = false;
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
          mat.transparent = true;
          mat.opacity = 0.7;
        } else {
          mat.color.set('#06b6d4');
          mat.wireframe = true;
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
          mat.transparent = true;
          mat.opacity = 0.15;
        }
        mat.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
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
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
