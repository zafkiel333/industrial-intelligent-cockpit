import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ChannelScourAreaProps } from './three-types';

export const ThreeScene: React.FC<ChannelScourAreaProps> = (props) => {
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
    scene.fog = new THREE.FogExp2('#0f172a', 0.02); // Underwater fog

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Sunlight filtering through water
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2); // sky-400
    dirLight.position.set(10, 30, 10);
    scene.add(dirLight);

    // Riverbed (Terrain)
    const bedWidth = 40;
    const bedLength = 40;
    const segments = 32;
    const bedGeo = new THREE.PlaneGeometry(bedWidth, bedLength, segments, segments);
    
    // Create initial uneven terrain
    const positions = bedGeo.attributes.position.array as Float32Array;
    const originalY = new Float32Array(positions.length / 3);
    for (let i = 0; i < positions.length; i += 3) {
      // Base terrain noise
      const x = positions[i];
      const z = positions[i + 2];
      const y = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 1.5 + (Math.random() - 0.5) * 0.5;
      positions[i + 1] = y;
      originalY[i / 3] = y;
    }
    bedGeo.computeVertexNormals();

    const bedMat = new THREE.MeshStandardMaterial({ 
      color: 0x78716c, // stone-500
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false
    });
    const riverbed = new THREE.Mesh(bedGeo, bedMat);
    riverbed.rotation.x = -Math.PI / 2;
    scene.add(riverbed);

    // Water Volume (Semi-transparent block)
    const waterGeo = new THREE.BoxGeometry(bedWidth, 15, bedLength);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 2
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 7.5;
    scene.add(water);

    // Sediment Particles
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * bedWidth;
      particlePos[i + 1] = Math.random() * 10; // Near bottom
      particlePos[i + 2] = (Math.random() - 0.5) * bedLength;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({ 
      color: 0xa8a29e, // stone-400
      size: 0.2, 
      transparent: true, 
      opacity: 0.6 
    });
    const sedimentParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(sedimentParticles);

    // Monitoring Sensor Node
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0, 0); // Center of scour area
    scene.add(sensorGroup);

    const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 6;
    sensorGroup.add(pole);

    const sensorHeadGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const sensorHeadMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5 }); // emerald
    const sensorHead = new THREE.Mesh(sensorHeadGeo, sensorHeadMat);
    sensorHead.position.y = 1;
    sensorGroup.add(sensorHead);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { waterFlowSpeed, scourDepth, sedimentConcentration, isAlert } = propsRef.current;

      // 1. Deform Riverbed based on scourDepth
      // Create a "hole" in the center based on scour depth
      const bedPositions = bedGeo.attributes.position.array as Float32Array;
      const maxScourRadius = 10;
      
      for (let i = 0; i < bedPositions.length; i += 3) {
        const x = bedPositions[i];
        const z = bedPositions[i + 2];
        const distToCenter = Math.sqrt(x*x + z*z);
        
        let targetY = originalY[i/3];
        
        if (distToCenter < maxScourRadius) {
          // Calculate depth based on distance from center (deeper in middle)
          const scourFactor = 1 - (distToCenter / maxScourRadius);
          // Apply scour depth, smooth transition
          targetY -= scourDepth * scourFactor * 1.5; 
        }
        
        // Smoothly interpolate current Y to target Y
        bedPositions[i + 1] += (targetY - bedPositions[i + 1]) * 0.1;
      }
      bedGeo.computeVertexNormals(); // Update lighting
      bedGeo.attributes.position.needsUpdate = true;

      // 2. Animate Sediment Particles based on flow speed and concentration
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      // Adjust opacity based on concentration
      particleMat.opacity = Math.min(0.8, sedimentConcentration / 1000);
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        // Move along Z axis (flow direction)
        pPositions[i + 2] += waterFlowSpeed * 0.1;
        
        // Add turbulence (X and Y movement)
        pPositions[i] += Math.sin(time * 2 + i) * 0.05 * waterFlowSpeed;
        pPositions[i + 1] += Math.cos(time * 3 + i) * 0.02 * waterFlowSpeed;

        // Reset particles that flow out of bounds
        if (pPositions[i + 2] > bedLength / 2) {
          pPositions[i + 2] = -bedLength / 2;
          pPositions[i] = (Math.random() - 0.5) * bedWidth;
          // Spawn height depends on concentration (more concentration = higher in water column)
          pPositions[i + 1] = Math.random() * (sedimentConcentration / 100); 
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 3. Sensor Status Color
      if (isAlert || scourDepth > 3.0) {
        sensorHeadMat.color.setHex(0xef4444); // Red
        sensorHeadMat.emissive.setHex(0xef4444);
        bedMat.color.setHex(0x7f1d1d); // Dark red tint for danger area
      } else if (scourDepth > 2.0 || waterFlowSpeed > 4.0) {
        sensorHeadMat.color.setHex(0xfacc15); // Yellow
        sensorHeadMat.emissive.setHex(0xfacc15);
        bedMat.color.setHex(0x78716c); // Normal
      } else {
        sensorHeadMat.color.setHex(0x10b981); // Emerald
        sensorHeadMat.emissive.setHex(0x10b981);
        bedMat.color.setHex(0x78716c); // Normal
      }

      // Pulse sensor light
      sensorHeadMat.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.3;

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
