
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WheelHubSceneProps } from './three-types';

export const WheelHubThreeScene: React.FC<WheelHubSceneProps> = ({
  rpm,
  torque,
  vibration,
  oilLevel,
  debrisLevel,
  viewMode,
  components,
  activeFaultId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const planetCarrierRef = useRef<THREE.Group | null>(null);
  const sunGearRef = useRef<THREE.Mesh | null>(null);
  const planetsRef = useRef<THREE.Mesh[]>([]);
  const debrisSystemRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050302, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
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
    controls.autoRotateSpeed = 0.5;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0xf97316, 2, 50); // Orange Industrial Light
    keyLight.position.set(10, 10, 10);
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0x0ea5e9, 5); // Cyan Rim
    rimLight.position.set(-10, 5, -5);
    rimLight.lookAt(0,0,0);
    scene.add(rimLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x475569, metalness: 0.9, roughness: 0.3
    });
    
    const gearMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 0.8, roughness: 0.4
    });

    const stressMat = new THREE.MeshStandardMaterial({
        color: 0xff0000, emissive: 0x880000, emissiveIntensity: 0.5, metalness: 0.5
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b, metalness: 0.2, roughness: 0.1,
        transmission: 0.8, transparent: true, opacity: 0.2, side: THREE.DoubleSide
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Housing (Wheel Hub Shell)
    const housingGeo = new THREE.CylinderGeometry(5.5, 5.5, 4, 32, 1, true);
    housingGeo.rotateZ(Math.PI/2);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    mainGroup.add(housing);

    // 2. Ring Gear (Fixed to housing usually, or housing itself)
    const ringGeo = new THREE.TorusGeometry(5, 0.5, 16, 64);
    const ringGear = new THREE.Mesh(ringGeo, steelMat);
    ringGear.rotation.y = Math.PI/2;
    mainGroup.add(ringGear);

    // 3. Sun Gear (Input)
    const sunGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.5, 24);
    sunGeo.rotateZ(Math.PI/2);
    // Add teeth detail texture or simple geometry
    const sunGear = new THREE.Mesh(sunGeo, gearMat.clone());
    sunGear.userData = { id: 'sun-gear' };
    sunGearRef.current = sunGear;
    mainGroup.add(sunGear);

    // 4. Planet Carrier & Planets
    const carrierGroup = new THREE.Group();
    planetCarrierRef.current = carrierGroup;
    mainGroup.add(carrierGroup);

    const planets: THREE.Mesh[] = [];
    const planetCount = 3;
    const planetRadius = 1.5;
    const orbitRadius = 3.25; // (Sun 1.5 + Planet 1.5 + spacing)

    for(let i=0; i<planetCount; i++) {
        const angle = (i / planetCount) * Math.PI * 2;
        const pGroup = new THREE.Group();
        pGroup.position.set(0, Math.cos(angle)*orbitRadius, Math.sin(angle)*orbitRadius);
        
        const pGeo = new THREE.CylinderGeometry(planetRadius, planetRadius, 1.5, 20);
        pGeo.rotateZ(Math.PI/2);
        const planet = new THREE.Mesh(pGeo, gearMat.clone());
        planet.userData = { id: `planet-${i+1}` };
        
        pGroup.add(planet);
        
        // Bearing inside planet
        const bearingGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.6, 16);
        bearingGeo.rotateZ(Math.PI/2);
        const bearing = new THREE.Mesh(bearingGeo, steelMat);
        pGroup.add(bearing);

        carrierGroup.add(pGroup);
        planets.push(planet);
    }
    planetsRef.current = planets;

    // Carrier Plate
    const plateGeo = new THREE.CylinderGeometry(4, 4, 0.2, 6);
    plateGeo.rotateZ(Math.PI/2);
    const plate = new THREE.Mesh(plateGeo, steelMat);
    plate.position.x = 1;
    carrierGroup.add(plate);

    // 5. Debris / Oil Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = (Math.random()) * 5;
        const theta = Math.random() * Math.PI * 2;
        pPos[i*3] = (Math.random()-0.5) * 3; // X width
        pPos[i*3+1] = r * Math.cos(theta);
        pPos[i*3+2] = r * Math.sin(theta);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xd97706, // Oil/Rust color
        size: 0.08,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const debrisSystem = new THREE.Points(pGeo, pMat);
    debrisSystemRef.current = debrisSystem;
    mainGroup.add(debrisSystem);


    // --- Animation Loop ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // Kinematics
      // Sun rotates fast
      const sunSpeed = rpm * 0.005;
      if (sunGearRef.current) sunGearRef.current.rotation.x -= sunSpeed;
      
      // Carrier rotates slower (Output)
      // Gear ratio approx (R+S)/S or similar. Let's say 4:1 reduction
      const carrierSpeed = sunSpeed / 4;
      if (planetCarrierRef.current) planetCarrierRef.current.rotation.x -= carrierSpeed;

      // Planets rotate on own axis (inverse to sun relative to carrier)
      // visual approx
      planetsRef.current.forEach(p => {
          p.rotation.x += sunSpeed * 0.8;
      });

      // Vibration
      if (mainGroupRef.current && vibration > 0) {
          const shake = vibration * 0.02;
          mainGroupRef.current.position.y = Math.sin(time * 50) * shake;
          mainGroupRef.current.position.z = Math.cos(time * 50) * shake;
      }

      // Exploded View
      if (viewMode === 'exploded') {
          // Move carrier out
          if (planetCarrierRef.current) planetCarrierRef.current.position.x = THREE.MathUtils.lerp(planetCarrierRef.current.position.x, 8, 0.1);
          // Move sun out opposite
          if (sunGearRef.current) sunGearRef.current.position.x = THREE.MathUtils.lerp(sunGearRef.current.position.x, -6, 0.1);
      } else {
          if (planetCarrierRef.current) planetCarrierRef.current.position.x = THREE.MathUtils.lerp(planetCarrierRef.current.position.x, 0, 0.1);
          if (sunGearRef.current) sunGearRef.current.position.x = THREE.MathUtils.lerp(sunGearRef.current.position.x, 0, 0.1);
      }

      // Stress Heatmap Update
      const updateMat = (mesh: THREE.Mesh, id: string) => {
          const comp = components.find(c => c.id === id);
          const isSelected = activeFaultId === id;
          const mat = mesh.material as THREE.MeshStandardMaterial;

          if (viewMode === 'stress' || isSelected) {
             const stressVal = comp ? comp.stress : 0;
             const targetColor = new THREE.Color().lerpColors(new THREE.Color(0x475569), new THREE.Color(0xff0000), stressVal);
             mat.color.lerp(targetColor, 0.1);
             mat.emissive.copy(targetColor);
             mat.emissiveIntensity = stressVal * 0.8 + (isSelected ? Math.sin(time*10)*0.5+0.5 : 0);
          } else {
             mat.color.setHex(0x94a3b8);
             mat.emissive.setHex(0x000000);
             mat.emissiveIntensity = 0;
          }
      };

      if (sunGearRef.current) updateMat(sunGearRef.current, 'sun-gear');
      planetsRef.current.forEach((p, i) => updateMat(p, `planet-${i+1}`));

      // Debris Particles
      if (debrisSystemRef.current) {
          (debrisSystemRef.current.material as THREE.PointsMaterial).opacity = debrisLevel;
          const pos = debrisSystemRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              // Rotate particles with oil flow
              const y = pos[i*3+1];
              const z = pos[i*3+2];
              const rot = 0.01;
              pos[i*3+1] = y * Math.cos(rot) - z * Math.sin(rot);
              pos[i*3+2] = y * Math.sin(rot) + z * Math.cos(rot);
          }
          debrisSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
  }, [rpm, torque, vibration, oilLevel, debrisLevel, viewMode, activeFaultId, components]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
