import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WaterLevelDamProps } from './three-types';

export const ThreeScene: React.FC<WaterLevelDamProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(40, 30, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Terrain
    const terrainGeo = new THREE.PlaneGeometry(100, 100);
    const terrainMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.9 }); // stone-700
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Dam Structure (Trapezoidal prism)
    const damShape = new THREE.Shape();
    damShape.moveTo(-10, 0); // Bottom left (upstream)
    damShape.lineTo(15, 0);  // Bottom right (downstream)
    damShape.lineTo(5, 25);  // Top right
    damShape.lineTo(-5, 25); // Top left
    damShape.lineTo(-10, 0);

    const extrudeSettings = { depth: 40, bevelEnabled: false };
    const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
    // Center the dam
    damGeo.translate(0, 0, -20);
    
    const damMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }); // slate-400
    const dam = new THREE.Mesh(damGeo, damMat);
    scene.add(dam);

    // Stress Visualization (Overlay on dam face)
    const stressGeo = new THREE.PlaneGeometry(10, 25);
    const stressMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const stressOverlay = new THREE.Mesh(stressGeo, stressMat);
    // Position on the downstream face
    stressOverlay.position.set(10, 12.5, 0);
    // Calculate angle of the downstream face
    const angle = Math.atan2(15 - 5, 25);
    stressOverlay.rotation.y = Math.PI / 2;
    stressOverlay.rotation.x = angle;
    scene.add(stressOverlay);

    // Reservoir Water
    const waterGeo = new THREE.BoxGeometry(40, 25, 40);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      transmission: 0.9
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    // Position upstream
    water.position.set(-30, 12.5, 0);
    scene.add(water);

    // Seepage Visualization (Particles on downstream face)
    const seepageCount = 500;
    const seepageGeo = new THREE.BufferGeometry();
    const seepagePos = new Float32Array(seepageCount * 3);
    for (let i = 0; i < seepageCount * 3; i += 3) {
      // Start near the bottom of the downstream face
      seepagePos[i] = 10 + Math.random() * 5; // x
      seepagePos[i + 1] = Math.random() * 5; // y
      seepagePos[i + 2] = (Math.random() - 0.5) * 40; // z
    }
    seepageGeo.setAttribute('position', new THREE.BufferAttribute(seepagePos, 3));
    const seepageMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.3, transparent: true, opacity: 0 });
    const seepageParticles = new THREE.Points(seepageGeo, seepageMat);
    scene.add(seepageParticles);

    // Water Level Sensor
    const sensorGeo = new THREE.CylinderGeometry(0.5, 0.5, 30);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // amber-500
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(-12, 15, 0);
    scene.add(sensor);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { waterLevel, damStress, seepageRate, isAlert } = propsRef.current;

      // 1. Update Water Level
      // Map waterLevel (e.g., 100-150m) to local Y scale (0-25)
      // Assuming max level is 150m, min is 100m for this visual
      const normalizedLevel = Math.max(0, Math.min(1, (waterLevel - 100) / 50));
      const visualHeight = normalizedLevel * 24 + 1; // 1 to 25
      
      water.scale.y = visualHeight / 25;
      water.position.y = visualHeight / 2;

      // 2. Update Stress Visualization
      stressMat.opacity = (damStress / 100) * 0.8;
      // Pulse effect if stress is high
      if (damStress > 80) {
        stressMat.opacity += Math.sin(time * 10) * 0.2;
      }

      // 3. Animate Seepage Particles
      const sPositions = seepageGeo.attributes.position.array as Float32Array;
      seepageMat.opacity = Math.min(0.8, seepageRate / 50); // Visible if seepage > 0
      
      for (let i = 0; i < seepageCount * 3; i += 3) {
        // Move down and slightly out
        sPositions[i + 1] -= seepageRate * 0.01; // Fall speed
        sPositions[i] += seepageRate * 0.005; // Flow outward
        
        // Reset if they hit the ground
        if (sPositions[i + 1] < 0) {
          sPositions[i] = 10 + Math.random() * 5; // Reset X to downstream face
          sPositions[i + 1] = Math.random() * 5; // Reset Y
          sPositions[i + 2] = (Math.random() - 0.5) * 40; // Random Z
        }
      }
      seepageGeo.attributes.position.needsUpdate = true;

      // 4. Alert Colors
      if (isAlert) {
        damMat.color.setHex(0xef4444); // Tint dam red
        sensorMat.color.setHex(0xef4444);
      } else if (waterLevel > 140 || damStress > 70) {
        damMat.color.setHex(0xfacc15); // Tint dam yellow
        sensorMat.color.setHex(0xfacc15);
      } else {
        damMat.color.setHex(0x94a3b8); // Normal slate
        sensorMat.color.setHex(0x10b981); // Emerald sensor
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
