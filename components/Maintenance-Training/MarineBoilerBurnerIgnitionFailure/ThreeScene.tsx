import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BoilerState } from './three-types';

interface ThreeSceneProps {
  state: BoilerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BoilerState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1b4b'); // Deep indigo background

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Boiler Shell (Cutaway)
    const shellGeo = new THREE.CylinderGeometry(4, 4, 8, 32, 1, true, 0, Math.PI);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = Math.PI / 2;
    scene.add(shell);

    // Furnace Tube
    const furnaceGeo = new THREE.CylinderGeometry(1.5, 1.5, 7, 32, 1, true, 0, Math.PI);
    const furnaceMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, side: THREE.DoubleSide });
    const furnace = new THREE.Mesh(furnaceGeo, furnaceMat);
    furnace.rotation.z = Math.PI / 2;
    furnace.position.y = -1;
    scene.add(furnace);

    // Burner Assembly
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(-3.5, -1, 0);

    const burnerBodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
    const burnerBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const burnerBody = new THREE.Mesh(burnerBodyGeo, burnerBodyMat);
    burnerBody.rotation.z = Math.PI / 2;
    burnerGroup.add(burnerBody);

    // Ignition Electrodes
    const electrodeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const electrodeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 1 });
    const electrode1 = new THREE.Mesh(electrodeGeo, electrodeMat);
    electrode1.position.set(0.6, 0.2, 0.2);
    electrode1.rotation.z = Math.PI / 2;
    burnerGroup.add(electrode1);
    const electrode2 = new THREE.Mesh(electrodeGeo, electrodeMat);
    electrode2.position.set(0.6, -0.2, 0.2);
    electrode2.rotation.z = Math.PI / 2;
    burnerGroup.add(electrode2);

    // Spark Effect
    const sparkLight = new THREE.PointLight(0x3b82f6, 0, 2);
    sparkLight.position.set(0.8, 0, 0.2);
    burnerGroup.add(sparkLight);

    // Flame Effect (Particles)
    const flameGeo = new THREE.BufferGeometry();
    const flameCount = 200;
    const flamePos = new Float32Array(flameCount * 3);
    for (let i = 0; i < flameCount * 3; i++) {
      flamePos[i] = 0;
      flamePos[i + 1] = (Math.random() - 0.5) * 0.5;
      flamePos[i + 2] = (Math.random() - 0.5) * 0.5;
    }
    flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePos, 3));
    const flameMat = new THREE.PointsMaterial({ color: 0xf97316, size: 0.3, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const flameParticles = new THREE.Points(flameGeo, flameMat);
    flameParticles.position.set(1, 0, 0);
    burnerGroup.add(flameParticles);

    // Flame Sensor (Photocell)
    const sensorGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0.5, 0.5, 0);
    sensor.rotation.z = Math.PI / 2;
    burnerGroup.add(sensor);

    scene.add(burnerGroup);

    // Water Level
    const waterGeo = new THREE.BoxGeometry(7.8, 4, 3.8);
    const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transmission: 0.6, opacity: 0.8, transparent: true, roughness: 0.1 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Water level animation
      const targetWaterY = -2 + (currentState.waterLevel / 100) * 4;
      water.position.y = THREE.MathUtils.lerp(water.position.y, targetWaterY, 0.05);
      // Scale water height slightly for visual effect
      water.scale.y = Math.max(0.1, currentState.waterLevel / 50);

      // Burner Status Animations
      if (currentState.burnerStatus === 'purge') {
        // Air fan running, no flame
        flameParticles.visible = false;
        sparkLight.intensity = 0;
      } else if (currentState.burnerStatus === 'ignition') {
        // Sparking
        flameParticles.visible = false;
        sparkLight.intensity = Math.random() > 0.5 ? 2 : 0; // Flicker
      } else if (currentState.burnerStatus === 'firing') {
        // Flame on
        flameParticles.visible = true;
        sparkLight.intensity = 0;
        
        // Animate flame particles
        const positions = flameGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < flameCount; i++) {
          positions[i * 3] += 0.1; // Move right (into furnace)
          positions[i * 3 + 1] += (Math.random() - 0.5) * 0.05; // Spread Y
          positions[i * 3 + 2] += (Math.random() - 0.5) * 0.05; // Spread Z
          
          if (positions[i * 3] > 5) { // Reset
            positions[i * 3] = 0;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          }
        }
        flameGeo.attributes.position.needsUpdate = true;
        
        // Color change based on flame sensor
        flameMat.color.setHex(currentState.flameSensor ? 0xf97316 : 0xef4444); // Orange if good, Red if failing
      } else {
        // Off or Lockout
        flameParticles.visible = false;
        sparkLight.intensity = 0;
      }

      // Sensor glow if detecting flame
      if (currentState.flameSensor && currentState.burnerStatus === 'firing') {
        sensorMat.emissive.setHex(0xf97316);
        sensorMat.emissiveIntensity = 0.5;
      } else {
        sensorMat.emissiveIntensity = 0;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
