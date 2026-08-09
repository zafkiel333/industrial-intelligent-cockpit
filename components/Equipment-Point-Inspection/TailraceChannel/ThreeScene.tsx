import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TailraceChannelProps } from './three-types';

export const ThreeScene: React.FC<TailraceChannelProps> = (props) => {
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
    scene.fog = new THREE.FogExp2('#0f172a', 0.015);

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(30, 20, 40);

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
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Channel Structure (Concrete walls and bed)
    const channelGroup = new THREE.Group();
    scene.add(channelGroup);

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 }); // slate-500

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(2, 15, 60);
    const leftWall = new THREE.Mesh(leftWallGeo, concreteMat);
    leftWall.position.set(-15, 7.5, 0);
    channelGroup.add(leftWall);

    // Right Wall
    const rightWallGeo = new THREE.BoxGeometry(2, 15, 60);
    const rightWall = new THREE.Mesh(rightWallGeo, concreteMat);
    rightWall.position.set(15, 7.5, 0);
    channelGroup.add(rightWall);

    // Bed
    const bedGeo = new THREE.BoxGeometry(28, 2, 60);
    const bed = new THREE.Mesh(bedGeo, concreteMat);
    bed.position.set(0, 1, 0);
    channelGroup.add(bed);

    // Powerhouse Outlet (Back wall)
    const outletWallGeo = new THREE.BoxGeometry(32, 20, 2);
    const outletWall = new THREE.Mesh(outletWallGeo, concreteMat);
    outletWall.position.set(0, 10, -31);
    channelGroup.add(outletWall);

    // Draft Tube Exits (Holes in back wall)
    const tubeGeo = new THREE.CylinderGeometry(4, 4, 3, 32);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x020617 }); // Very dark
    
    const tube1 = new THREE.Mesh(tubeGeo, tubeMat);
    tube1.rotation.x = Math.PI / 2;
    tube1.position.set(-7, 6, -30);
    channelGroup.add(tube1);
    
    const tube2 = new THREE.Mesh(tubeGeo, tubeMat);
    tube2.rotation.x = Math.PI / 2;
    tube2.position.set(7, 6, -30);
    channelGroup.add(tube2);

    // Water Surface (Dynamic Plane)
    const waterWidth = 28;
    const waterLength = 60;
    const waterSegments = 64;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, waterLength, waterSegments, waterSegments);
    
    // Store original vertices for wave animation
    const waterPositions = waterGeo.attributes.position.array as Float32Array;
    const originalWaterZ = new Float32Array(waterPositions.length / 3);
    for (let i = 0; i < waterPositions.length; i += 3) {
      originalWaterZ[i / 3] = waterPositions[i + 2]; // Plane is created on XY, rotated later
    }

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    // Initial height set in animate loop
    scene.add(water);

    // Foam/Turbulence Particles near outlets
    const foamCount = 1000;
    const foamGeo = new THREE.BufferGeometry();
    const foamPos = new Float32Array(foamCount * 3);
    for (let i = 0; i < foamCount * 3; i += 3) {
      foamPos[i] = (Math.random() - 0.5) * 20; // x
      foamPos[i + 1] = 0; // y (relative to water surface)
      foamPos[i + 2] = -25 + Math.random() * 15; // z (near outlets)
    }
    foamGeo.setAttribute('position', new THREE.BufferAttribute(foamPos, 3));
    const foamMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const foamParticles = new THREE.Points(foamGeo, foamMat);
    scene.add(foamParticles);

    // Sensor Node
    const sensorGeo = new THREE.BoxGeometry(1, 2, 1);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // emerald
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(14, 16, 0); // Mounted on right wall
    scene.add(sensor);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { waterLevel, flowVelocity, turbulence, isAlert } = propsRef.current;

      // 1. Update Water Level
      // Map waterLevel (e.g., 5-12m) to Y position
      water.position.y = waterLevel;

      // 2. Animate Water Surface Waves (Turbulence)
      const positions = waterGeo.attributes.position.array as Float32Array;
      const waveSpeed = flowVelocity * 2;
      const waveHeight = (turbulence / 100) * 1.5; // Max 1.5m waves
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1]; // This is Z in world space before rotation
        
        // Complex wave function based on time, position, and turbulence
        // Higher turbulence near the outlet (y is negative)
        const distFromOutlet = Math.max(0, y + 30); // 0 at outlet, 60 at end
        const localTurbulence = waveHeight * Math.max(0.2, 1 - (distFromOutlet / 40));

        const z = originalWaterZ[i/3] + 
                  Math.sin(x * 0.5 + time * waveSpeed) * localTurbulence +
                  Math.cos(y * 0.3 - time * waveSpeed * 1.5) * localTurbulence * 0.5;
        
        positions[i + 2] = z;
      }
      waterGeo.computeVertexNormals();
      waterGeo.attributes.position.needsUpdate = true;

      // 3. Animate Foam Particles
      const fPositions = foamGeo.attributes.position.array as Float32Array;
      foamMat.opacity = (turbulence / 100) * 0.8; // More turbulence = more visible foam
      
      for (let i = 0; i < foamCount * 3; i += 3) {
        // Move foam downstream
        fPositions[i + 2] += flowVelocity * 0.2;
        
        // Bob up and down with water level
        fPositions[i + 1] = waterLevel + Math.sin(time * 5 + i) * 0.5;

        // Reset foam near outlets
        if (fPositions[i + 2] > -10 || Math.random() > 0.98) {
          fPositions[i + 2] = -28 + Math.random() * 2;
          // Spawn near one of the two tubes
          fPositions[i] = (Math.random() > 0.5 ? -7 : 7) + (Math.random() - 0.5) * 6;
        }
      }
      foamGeo.attributes.position.needsUpdate = true;

      // 4. Sensor Status Color
      if (isAlert || waterLevel > 11.5) {
        sensorMat.color.setHex(0xef4444); // Red
        waterMat.color.setHex(0x0369a1); // Darker, murkier water
      } else if (waterLevel > 10.0 || turbulence > 70) {
        sensorMat.color.setHex(0xfacc15); // Yellow
        waterMat.color.setHex(0x0284c7);
      } else {
        sensorMat.color.setHex(0x10b981); // Emerald
        waterMat.color.setHex(0x0ea5e9); // Clearer water
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
