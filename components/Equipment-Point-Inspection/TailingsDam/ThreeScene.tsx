import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TailingsDamProps } from './three-types';

export const ThreeScene: React.FC<TailingsDamProps> = (props) => {
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
    camera.position.set(50, 40, 60);

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
    dirLight.position.set(20, 50, 30);
    scene.add(dirLight);

    // Terrain Base
    const baseGeo = new THREE.PlaneGeometry(100, 100);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.9 }); // stone-700
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    scene.add(base);

    // Tailings Dam Structure (Stepped Slope)
    const damGroup = new THREE.Group();
    scene.add(damGroup);

    const damMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 1 }); // stone-500
    
    // Create steps for the dam
    const steps = 5;
    const stepHeight = 5;
    const stepWidth = 8;
    for (let i = 0; i < steps; i++) {
      const w = 40 - i * stepWidth;
      const h = stepHeight;
      const d = 60;
      const stepGeo = new THREE.BoxGeometry(w, h, d);
      const stepMesh = new THREE.Mesh(stepGeo, damMat);
      // Position: stack them up and move them back to form a slope
      stepMesh.position.set(-20 + w / 2 + i * stepWidth, h / 2 + i * stepHeight, 0);
      damGroup.add(stepMesh);
    }

    // Tailings Pond (Water/Slurry behind the dam)
    const pondGeo = new THREE.BoxGeometry(30, 20, 58);
    const pondMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f766e, // teal-700 (toxic looking)
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      transmission: 0.5
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(-35, 10, 0); // Behind the dam
    scene.add(pond);

    // Displacement Visualization (Red overlay on the slope)
    const dispGeo = new THREE.PlaneGeometry(30, 60, 16, 16);
    const dispMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0,
      wireframe: true 
    });
    const dispMesh = new THREE.Mesh(dispGeo, dispMat);
    // Position on the slope face (approximate angle)
    dispMesh.rotation.y = Math.PI / 2;
    dispMesh.rotation.x = Math.atan2(steps * stepWidth, steps * stepHeight);
    dispMesh.position.set(5, 12.5, 0);
    scene.add(dispMesh);

    // Seepage Particles (Leaking from the bottom of the dam)
    const seepageCount = 300;
    const seepageGeo = new THREE.BufferGeometry();
    const seepagePos = new Float32Array(seepageCount * 3);
    for (let i = 0; i < seepageCount * 3; i += 3) {
      seepagePos[i] = 15 + Math.random() * 10; // x (front of dam)
      seepagePos[i + 1] = Math.random() * 2; // y (near ground)
      seepagePos[i + 2] = (Math.random() - 0.5) * 50; // z (along the dam)
    }
    seepageGeo.setAttribute('position', new THREE.BufferAttribute(seepagePos, 3));
    const seepageMat = new THREE.PointsMaterial({ color: 0x0d9488, size: 0.4, transparent: true, opacity: 0 }); // teal-600
    const seepageParticles = new THREE.Points(seepageGeo, seepageMat);
    scene.add(seepageParticles);

    // Sensor Nodes (GNSS on steps)
    const sensorGeo = new THREE.CylinderGeometry(0.5, 0.5, 2);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // blue-500
    for (let i = 1; i < steps; i++) {
      const sensor1 = new THREE.Mesh(sensorGeo, sensorMat);
      sensor1.position.set(-20 + (40 - i * stepWidth) + i * stepWidth - 2, i * stepHeight + 1, 15);
      scene.add(sensor1);
      
      const sensor2 = new THREE.Mesh(sensorGeo, sensorMat);
      sensor2.position.set(-20 + (40 - i * stepWidth) + i * stepWidth - 2, i * stepHeight + 1, -15);
      scene.add(sensor2);
    }

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { seepageRate, slopeDisplacement, waterLevel, isAlert } = propsRef.current;

      // 1. Update Pond Water Level
      // Map waterLevel (e.g., 50-100m) to local Y scale (0-25)
      const normalizedLevel = Math.max(0, Math.min(1, (waterLevel - 50) / 50));
      const visualHeight = normalizedLevel * 24 + 1;
      
      pond.scale.y = visualHeight / 20; // Original height was 20
      pond.position.y = visualHeight / 2;

      // 2. Update Displacement Visualization
      // Show wireframe and deform it based on displacement
      dispMat.opacity = Math.min(0.8, slopeDisplacement / 50);
      
      const positions = dispGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        // Bulge in the middle
        const bulge = Math.sin((x / 30) * Math.PI) * Math.cos((y / 60) * Math.PI);
        const z = bulge * (slopeDisplacement / 10);
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;

      // 3. Animate Seepage Particles
      const sPositions = seepageGeo.attributes.position.array as Float32Array;
      seepageMat.opacity = Math.min(0.8, seepageRate / 30); // Visible if seepage > 0
      
      for (let i = 0; i < seepageCount * 3; i += 3) {
        // Flow outward and spread
        sPositions[i] += seepageRate * 0.005; // Move X
        sPositions[i + 2] += (Math.random() - 0.5) * 0.1; // Spread Z
        
        // Reset if they go too far
        if (sPositions[i] > 35) {
          sPositions[i] = 15 + Math.random() * 5; // Reset X to dam toe
          sPositions[i + 1] = Math.random() * 2; // Reset Y
          sPositions[i + 2] = (Math.random() - 0.5) * 50; // Random Z
        }
      }
      seepageGeo.attributes.position.needsUpdate = true;

      // 4. Alert Colors
      if (isAlert) {
        dispMat.color.setHex(0xef4444); // Red wireframe
        pondMat.color.setHex(0xb91c1c); // Dark red water
      } else if (slopeDisplacement > 20 || seepageRate > 20) {
        dispMat.color.setHex(0xfacc15); // Yellow wireframe
        pondMat.color.setHex(0x854d0e); // Muddy water
      } else {
        dispMat.color.setHex(0x3b82f6); // Blue wireframe (normal)
        pondMat.color.setHex(0x0f766e); // Teal water
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
