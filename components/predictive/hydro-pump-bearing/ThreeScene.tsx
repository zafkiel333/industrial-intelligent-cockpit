
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpBearingSceneProps } from './three-types';

export const PumpBearingScene: React.FC<PumpBearingSceneProps> = ({ 
  rpm,
  bearingTempUpper,
  bearingTempLower,
  impellerWear,
  vibrationAmp,
  showHousing = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shaftGroupRef = useRef<THREE.Group | null>(null);
  const upperBearingRef = useRef<THREE.Mesh | null>(null);
  const lowerBearingRef = useRef<THREE.Mesh | null>(null);
  const impellerRef = useRef<THREE.Mesh | null>(null);
  const housingRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(10, 20, 5);
    spotLight.angle = 0.5;
    scene.add(spotLight);

    const redLight = new THREE.PointLight(0xff0000, 0, 20); // Alarm light
    redLight.position.set(0, 5, 0);
    scene.add(redLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, metalness: 0.8, roughness: 0.3 
    });
    
    const bronzeMat = new THREE.MeshStandardMaterial({
        color: 0xcd7f32, metalness: 0.6, roughness: 0.4
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.8,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });

    const wornBronzeMat = new THREE.MeshStandardMaterial({
        color: 0x8b4513, metalness: 0.2, roughness: 0.9 // Pitted look
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Shaft (Rotating)
    const shaftGroup = new THREE.Group();
    shaftGroupRef.current = shaftGroup;
    mainGroup.add(shaftGroup);

    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
    const shaft = new THREE.Mesh(shaftGeo, steelMat);
    shaftGroup.add(shaft);

    // 2. Impeller (Bottom of Shaft)
    const impellerGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 16);
    // Add blades visual
    const bladeGeo = new THREE.BoxGeometry(0.2, 0.8, 2.8);
    for(let i=0; i<6; i++) {
        const blade = new THREE.Mesh(bladeGeo, bronzeMat);
        blade.position.set(Math.cos(i*Math.PI/3)*1.5, 0, Math.sin(i*Math.PI/3)*1.5);
        blade.rotation.y = -i*Math.PI/3 + 0.5;
        // Merge into impeller visually
        // For simplicity, just add to a group if we wanted complex geometry
    }
    // We will use a group for impeller to switch materials easier
    const impellerMesh = new THREE.Mesh(impellerGeo, bronzeMat);
    impellerMesh.position.y = -5;
    impellerRef.current = impellerMesh;
    shaftGroup.add(impellerMesh);
    
    // Blades attached to impeller mesh
    for(let i=0; i<6; i++) {
        const blade = new THREE.Mesh(bladeGeo, bronzeMat);
        blade.position.set(Math.cos(i*Math.PI/3)*1.5, 0, Math.sin(i*Math.PI/3)*1.5);
        blade.rotation.y = -i*Math.PI/3 + 0.5;
        impellerMesh.add(blade);
    }

    // 3. Bearings (Stationary)
    const bearingGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 32);
    const bearingUpper = new THREE.Mesh(bearingGeo, steelMat.clone());
    bearingUpper.position.y = 3;
    upperBearingRef.current = bearingUpper;
    mainGroup.add(bearingUpper);

    const bearingLower = new THREE.Mesh(bearingGeo, steelMat.clone());
    bearingLower.position.y = -2;
    lowerBearingRef.current = bearingLower;
    mainGroup.add(bearingLower);

    // 4. Housing (Transparent)
    const housingG = new THREE.Group();
    housingRef.current = housingG;
    mainGroup.add(housingG);

    // Motor Housing (Top)
    const motorGeo = new THREE.CylinderGeometry(2, 2, 3, 32);
    const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    motor.position.y = 6.5;
    housingG.add(motor);

    // Shaft Guard / Support
    const guardGeo = new THREE.CylinderGeometry(1.2, 1.2, 8, 32, 1, true);
    const guard = new THREE.Mesh(guardGeo, housingMat);
    guard.position.y = 1;
    housingG.add(guard);

    // Volute (Bottom)
    const voluteGeo = new THREE.TorusGeometry(3.5, 1.5, 16, 32);
    const volute = new THREE.Mesh(voluteGeo, housingMat);
    volute.rotation.x = Math.PI/2;
    volute.position.y = -5;
    housingG.add(volute);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Rotation
      if (shaftGroupRef.current) {
          shaftGroupRef.current.rotation.y -= (rpm / 60) * 0.1;
          
          // Vibration Shake
          const shake = vibrationAmp * 0.05;
          shaftGroupRef.current.position.x = Math.sin(time * 50) * shake;
          shaftGroupRef.current.position.z = Math.cos(time * 50) * shake;
      }

      // 2. Bearing Heat Visualization
      const updateHeat = (mesh: THREE.Mesh | null, temp: number) => {
          if (!mesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          // Map 40C -> 100C to color
          const tNorm = Math.min(1, Math.max(0, (temp - 40) / 80));
          const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5); // Blue to Red
          mat.color.lerp(color, 0.1);
          mat.emissive.copy(color);
          mat.emissiveIntensity = tNorm * 0.8;
      };
      updateHeat(upperBearingRef.current, bearingTempUpper);
      updateHeat(lowerBearingRef.current, bearingTempLower);

      // 3. Impeller Wear Visualization
      if (impellerRef.current) {
          const mat = impellerRef.current.material as THREE.MeshStandardMaterial;
          // Blend between new bronze and worn dark rusty look
          if (impellerWear > 50) {
             mat.color.lerp(new THREE.Color(0x5D4037), 0.1);
             mat.roughness = 0.9;
          } else {
             mat.color.lerp(new THREE.Color(0xcd7f32), 0.1);
             mat.roughness = 0.4;
          }
          // Also update children (blades)
          impellerRef.current.children.forEach((child) => {
              if (child instanceof THREE.Mesh) {
                  const cMat = child.material as THREE.MeshStandardMaterial;
                  cMat.copy(mat);
              }
          });
      }

      // 4. Housing Visibility
      if (housingRef.current) {
          housingRef.current.visible = showHousing;
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
  }, [rpm, bearingTempUpper, bearingTempLower, impellerWear, vibrationAmp, showHousing]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
