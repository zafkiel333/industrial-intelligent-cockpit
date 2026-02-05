
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CorrosionSceneProps } from './three-types';

export const GateCorrosionScene: React.FC<CorrosionSceneProps> = ({ 
  ageYears,
  stressLoad,
  showStress,
  showCracks,
  corrosionRate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const structureRef = useRef<THREE.Group | null>(null);
  const crackRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0500, 0.02); // Rust-colored deep fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const rustLight = new THREE.PointLight(0xd97706, 0, 20); // Orange light for corrosion
    rustLight.position.set(2, 2, 2);
    scene.add(rustLight);

    const stressLight = new THREE.PointLight(0x3b82f6, 0, 20); // Blue for stress
    stressLight.position.set(-2, 2, -2);
    scene.add(stressLight);

    // --- Materials ---
    // Dynamic material that changes with age
    const baseSteelMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.6,
        roughness: 0.4
    });

    const rustMat = new THREE.MeshStandardMaterial({
        color: 0x7c2d12, // Deep rust
        metalness: 0.1,
        roughness: 0.9,
    });

    // --- Geometry: Trunnion Hub & Arms ---
    const mainGroup = new THREE.Group();
    structureRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Trunnion Hub (Center)
    const hubGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, baseSteelMat.clone());
    mainGroup.add(hub);

    // 2. Radial Arms (Struts)
    const armGeo = new THREE.BoxGeometry(4, 0.8, 0.4);
    const armCount = 3;
    const arms: THREE.Mesh[] = [];

    for(let i=0; i<armCount; i++) {
        const angle = (i / armCount) * Math.PI * 0.8 - 0.4; // Fan out
        const arm = new THREE.Mesh(armGeo, baseSteelMat.clone());
        
        arm.position.set(-2.5 * Math.cos(angle), -2.5 * Math.sin(angle), 0);
        arm.rotation.z = angle;
        
        // Connect to hub visual
        const connectorGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        const connector = new THREE.Mesh(connectorGeo, baseSteelMat.clone());
        connector.rotation.z = Math.PI/2;
        connector.position.set(-0.5, 0, 0);
        arm.add(connector);

        mainGroup.add(arm);
        arms.push(arm);
        arms.push(connector);
    }

    // 3. Cracks (Visual Lines)
    const crackGroup = new THREE.Group();
    crackRef.current = crackGroup;
    mainGroup.add(crackGroup);
    
    // Create jagged lines near stress points (hub connection)
    for(let i=0; i<5; i++) {
        const points = [];
        let start = new THREE.Vector3(-1.2, (Math.random()-0.5)*1, (Math.random()-0.5)*0.5);
        points.push(start);
        for(let j=0; j<5; j++) {
            start = start.clone().add(new THREE.Vector3(-0.2, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.1));
            points.push(start);
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 0 });
        const line = new THREE.Line(geo, mat);
        crackGroup.add(line);
    }

    // --- Animation Loop ---
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // 1. Corrosion Visualization (Age Effect)
      // Interpolate material color and roughness based on age
      const rustFactor = Math.min(1, (ageYears / 50) * corrosionRate * 1.5);
      
      mainGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
              const m = child.material as THREE.MeshStandardMaterial;
              // Lerp color from Steel to Rust
              const steelColor = new THREE.Color(0x64748b);
              const rustColor = new THREE.Color(0x7c2d12);
              m.color.lerpColors(steelColor, rustColor, rustFactor);
              
              // Roughness increases
              m.roughness = 0.4 + rustFactor * 0.6;
              // Metalness decreases
              m.metalness = 0.6 - rustFactor * 0.5;

              // 2. Stress Visualization (Heatmap overlay)
              if (showStress) {
                  const stressBase = stressLoad / 100;
                  // Stress highest near hub (x=0)
                  // We simulate this by emissive color
                  m.emissive.setHex(0x3b82f6); // Blue stress lines
                  m.emissiveIntensity = stressBase * 0.5;
              } else {
                  m.emissive.setHex(0x000000);
                  m.emissiveIntensity = 0;
              }
          }
      });

      // 3. Crack Visibility
      if (showCracks && ageYears > 30) {
           const crackOpacity = Math.min(1, (ageYears - 30) / 10);
           crackGroup.children.forEach((line: any) => {
               line.material.opacity = crackOpacity;
               // Pulse effect
               if (stressLoad > 80) line.material.opacity = crackOpacity * (0.5 + Math.sin(Date.now() * 0.01)*0.5);
           });
      } else {
           crackGroup.children.forEach((line: any) => {
               line.material.opacity = 0;
           });
      }

      // Lights
      rustLight.intensity = rustFactor * 3;
      stressLight.intensity = showStress ? (stressLoad / 100) * 2 : 0;

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
  }, [ageYears, stressLoad, showStress, showCracks, corrosionRate]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
