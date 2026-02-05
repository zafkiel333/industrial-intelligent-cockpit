
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformerSceneProps } from './three-types';

export const TransformerScene: React.FC<TransformerSceneProps> = ({ 
  oilTemp, 
  windingTempHV, 
  windingTempLV, 
  oilLevel,
  isFansRunning,
  coreVibration,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const tankRef = useRef<THREE.Mesh | null>(null);
  const windingsRef = useRef<THREE.Group | null>(null);
  const fansRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050308, 0.03); // Deep purple fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 2, 0);

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    violetLight.position.set(5, 10, 5);
    scene.add(violetLight);

    const warmLight = new THREE.PointLight(0xf59e0b, 1, 20); // Represents heat
    warmLight.position.set(-5, 5, -5);
    scene.add(warmLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.6, roughness: 0.4 
    });
    
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, metalness: 0.1, roughness: 0.1 // Brown bushings
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, metalness: 0.7, roughness: 0.3
    });

    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      transmission: 0.1
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Main Tank
    const tankGeo = new THREE.BoxGeometry(6, 5, 4);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 2.5;
    tankRef.current = tank;
    mainGroup.add(tank);

    // 2. Bushings (HV & LV)
    const bushingGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5, 16);
    // HV Bushings (3 Tall)
    [-1.5, 0, 1.5].forEach(x => {
        const bush = new THREE.Mesh(bushingGeo, porcelainMat);
        bush.position.set(x, 6.25, 1);
        
        // Rings
        for(let i=0; i<5; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 16), porcelainMat);
            ring.rotation.x = Math.PI/2;
            ring.position.y = -1 + i*0.5;
            bush.add(ring);
        }
        mainGroup.add(bush);
    });
    // LV Bushings (4 Short)
    [-1.5, -0.5, 0.5, 1.5].forEach(x => {
        const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 16), porcelainMat);
        bush.position.set(x, 5.75, -1);
        mainGroup.add(bush);
    });

    // 3. Conservator (Oil Pillow)
    const conservatorGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 32);
    conservatorGeo.rotateZ(Math.PI/2);
    const conservator = new THREE.Mesh(conservatorGeo, steelMat);
    conservator.position.set(0, 6.5, -2.5);
    mainGroup.add(conservator);
    
    // Connection Pipe
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2), steelMat);
    pipe.position.set(2, 5.5, -2);
    mainGroup.add(pipe);

    // 4. Radiators / Cooling Fins
    fansRef.current = [];
    [-2.2, 0, 2.2].forEach(zOffset => {
        // Left Side
        const radGroup = new THREE.Group();
        radGroup.position.set(-3.2, 2.5, zOffset);
        mainGroup.add(radGroup);
        
        // Fins
        const fins = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 1.5), steelMat);
        radGroup.add(fins);
        
        // Fan
        const fanGroup = new THREE.Group();
        fanGroup.position.set(-0.3, -1, 0);
        fanGroup.rotation.z = Math.PI / 2;
        radGroup.add(fanGroup);
        
        const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.2), new THREE.MeshBasicMaterial({color: 0x000000}));
        const fanBlade2 = fanBlade.clone();
        fanBlade2.rotation.x = Math.PI / 2;
        fanGroup.add(fanBlade);
        fanGroup.add(fanBlade2);
        fansRef.current.push(fanGroup);
    });

    // 5. Internal Windings (Core)
    const windingsGroup = new THREE.Group();
    windingsRef.current = windingsGroup;
    windingsGroup.position.set(0, 2.5, 0);
    mainGroup.add(windingsGroup);

    [-1.5, 0, 1.5].forEach(x => {
        const coreLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4, 32), new THREE.MeshStandardMaterial({color: 0x333333}));
        coreLeg.position.x = x;
        windingsGroup.add(coreLeg);

        const winding = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.5, 32), copperMat);
        winding.position.x = x;
        windingsGroup.add(winding);
    });

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // Fan Rotation
      if (isFansRunning) {
          fansRef.current.forEach(fan => {
              fan.rotation.x += 0.2;
          });
      }

      // Vibration Effect
      if (coreVibration > 0) {
          mainGroup.position.x = (Math.random() - 0.5) * 0.01 * coreVibration;
      }

      // View Mode Logic
      if (tankRef.current && windingsRef.current) {
          const tMat = tankRef.current.material as THREE.MeshPhysicalMaterial;
          
          if (viewMode === 'internal') {
              tMat.opacity = 0.1;
              tMat.wireframe = true;
              windingsRef.current.visible = true;
          } else if (viewMode === 'thermal') {
              tMat.opacity = 0.9;
              tMat.wireframe = false;
              windingsRef.current.visible = false;
              // Heat map effect on tank color
              const heatColor = new THREE.Color().setHSL(0.0 + (100 - oilTemp)/200, 1.0, 0.5); // Red to Greenish
              tMat.color.lerp(heatColor, 0.1);
              tMat.emissive.lerp(heatColor, 0.1);
              tMat.emissiveIntensity = 0.5;
          } else {
              // Standard
              tMat.opacity = 0.9;
              tMat.wireframe = false;
              tMat.color.setHex(0x334155);
              tMat.emissive.setHex(0x000000);
              windingsRef.current.visible = false;
          }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [oilTemp, windingTempHV, windingTempLV, oilLevel, isFansRunning, coreVibration, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
