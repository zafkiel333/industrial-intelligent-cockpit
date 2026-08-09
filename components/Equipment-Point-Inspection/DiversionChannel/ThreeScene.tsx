import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DiversionChannelProps } from './three-types';

export const ThreeScene: React.FC<DiversionChannelProps> = (props) => {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 30, 20);
    scene.add(dirLight);

    // Channel Geometry (U-shape)
    const channelShape = new THREE.Shape();
    channelShape.moveTo(-15, 10);
    channelShape.lineTo(-10, 0);
    channelShape.lineTo(10, 0);
    channelShape.lineTo(15, 10);

    const extrudeSettings = { depth: 60, bevelEnabled: false };
    const channelGeo = new THREE.ExtrudeGeometry(channelShape, extrudeSettings);
    channelGeo.translate(0, 0, -30); // Center along Z
    
    const channelMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 }); // stone-500
    const channel = new THREE.Mesh(channelGeo, channelMat);
    scene.add(channel);

    // Water
    const waterGeo = new THREE.PlaneGeometry(20, 60, 32, 32); // Width matches bottom of channel
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9, // sky-500
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      transmission: 0.9,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 5; // Initial level
    scene.add(water);

    // Sediment Layer (Bottom of channel)
    const sedimentGeo = new THREE.PlaneGeometry(20, 60);
    const sedimentMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 1 }); // yellow-800
    const sediment = new THREE.Mesh(sedimentGeo, sedimentMat);
    sediment.rotation.x = -Math.PI / 2;
    sediment.position.y = 0.1; // Just above channel bottom
    scene.add(sediment);

    // Control Gate
    const gateGeo = new THREE.BoxGeometry(22, 12, 1);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 }); // slate-600
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(0, 6, 0); // Middle of channel
    scene.add(gate);

    // Flow Particles
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 18; // x (width)
      particlePos[i + 1] = Math.random() * 5; // y (height)
      particlePos[i + 2] = (Math.random() - 0.5) * 60; // z (length)
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { flowRate, sedimentLevel, gateStatus, isAlert } = propsRef.current;

      // 1. Update Gate Position
      let targetGateY = 6; // Closed
      if (gateStatus === 'open') targetGateY = 15;
      else if (gateStatus === 'partial') targetGateY = 10;
      
      gate.position.y += (targetGateY - gate.position.y) * 0.05;

      // 2. Update Water Level & Waves based on Flow Rate
      // Base level + flow contribution
      const targetWaterLevel = 2 + (flowRate / 500) * 6; // Max ~8
      water.position.y += (targetWaterLevel - water.position.y) * 0.05;

      // Animate water vertices for waves
      const positions = waterGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        // Wave amplitude depends on flow rate
        const amplitude = (flowRate / 500) * 0.5;
        const z = Math.sin(x * 2 + time * 3) * amplitude + Math.cos(y * 2 + time * 2) * amplitude;
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;

      // 3. Update Sediment Visuals
      // Scale sediment height based on percentage
      sediment.position.y = 0.1 + (sedimentLevel / 100) * 2;
      sedimentMat.color.setHex(sedimentLevel > 70 ? 0x713f12 : 0x854d0e); // Darker if high

      // 4. Animate Flow Particles
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      // Speed depends on flow rate and gate status
      let speed = (flowRate / 500) * 0.5;
      if (gateStatus === 'closed') speed = 0.01; // Minimal movement

      for (let i = 0; i < particleCount * 3; i += 3) {
        // Only move particles if they are "upstream" or gate is open
        if (pPositions[i + 2] < gate.position.z || gate.position.y > 8) {
           pPositions[i + 2] += speed; // Move along Z
        }

        // Reset if they reach the end
        if (pPositions[i + 2] > 30) {
          pPositions[i + 2] = -30;
          pPositions[i] = (Math.random() - 0.5) * 18;
          pPositions[i + 1] = Math.random() * water.position.y;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 5. Alert Colors
      if (isAlert) {
        waterMat.color.setHex(0xef4444); // Reddish water
      } else if (sedimentLevel > 70) {
        waterMat.color.setHex(0xfacc15); // Yellowish (muddy)
      } else {
        waterMat.color.setHex(0x0ea5e9); // Normal sky blue
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
