import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SluiceGateProps } from './three-types';

export const ThreeScene: React.FC<SluiceGateProps> = (props) => {
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
    camera.position.set(20, 15, 30);

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
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Structure (Pillars)
    const pillarGeo = new THREE.BoxGeometry(4, 30, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }); // slate-400
    
    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-10, 15, 0);
    scene.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(10, 15, 0);
    scene.add(rightPillar);

    // Top Bridge
    const bridgeGeo = new THREE.BoxGeometry(24, 2, 8);
    const bridge = new THREE.Mesh(bridgeGeo, pillarMat);
    bridge.position.set(0, 31, 0);
    scene.add(bridge);

    // Hoist Mechanism (Motor & Gears)
    const motorGroup = new THREE.Group();
    motorGroup.position.set(0, 33, 0);
    scene.add(motorGroup);

    const motorGeo = new THREE.CylinderGeometry(1.5, 1.5, 4);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5 }); // blue-500
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motorGroup.add(motor);

    const gearGeo = new THREE.CylinderGeometry(2, 2, 0.5, 16);
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }); // slate-500
    const gear1 = new THREE.Mesh(gearGeo, gearMat);
    gear1.position.set(-3, 0, 0);
    gear1.rotation.z = Math.PI / 2;
    motorGroup.add(gear1);
    
    const gear2 = new THREE.Mesh(gearGeo, gearMat);
    gear2.position.set(3, 0, 0);
    gear2.rotation.z = Math.PI / 2;
    motorGroup.add(gear2);

    // Sluice Gate
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    const gateGeo = new THREE.BoxGeometry(16, 20, 1);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 }); // slate-600
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.y = 10; // Center of gate
    gateGroup.add(gate);

    // Cables connecting hoist to gate
    const cableGeo = new THREE.CylinderGeometry(0.1, 0.1, 30);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x1e293b }); // slate-800
    
    const leftCable = new THREE.Mesh(cableGeo, cableMat);
    leftCable.position.set(-6, 15, 0);
    gateGroup.add(leftCable); // Add to gate group so it moves with it, but scale it later

    const rightCable = new THREE.Mesh(cableGeo, cableMat);
    rightCable.position.set(6, 15, 0);
    gateGroup.add(rightCable);

    // Water
    const waterGeo = new THREE.PlaneGeometry(30, 40);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      transmission: 0.9,
      side: THREE.DoubleSide
    });
    
    // Upstream Water
    const waterUp = new THREE.Mesh(waterGeo, waterMat);
    waterUp.rotation.x = -Math.PI / 2;
    waterUp.position.set(0, 15, -20);
    scene.add(waterUp);

    // Downstream Water (Level depends on gate opening)
    const waterDown = new THREE.Mesh(waterGeo, waterMat);
    waterDown.rotation.x = -Math.PI / 2;
    waterDown.position.set(0, 5, 20);
    scene.add(waterDown);

    // Flow Particles (under the gate)
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 16; // width of gate
      particlePos[i + 1] = Math.random() * 5; // height
      particlePos[i + 2] = Math.random() * 10; // depth downstream
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;
    let prevOpening = props.gateOpening;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { gateOpening, motorCurrent, vibration, isAlert } = propsRef.current;

      // 1. Animate Gate Position
      // 0% = y:0 (closed), 100% = y:20 (fully open)
      const targetY = (gateOpening / 100) * 20;
      gateGroup.position.y += (targetY - gateGroup.position.y) * 0.1;

      // Adjust cables to stretch between hoist and gate
      // Hoist is at y=33. Gate top is at gateGroup.position.y + 20
      const cableLength = 33 - (gateGroup.position.y + 20);
      leftCable.scale.y = cableLength / 30; // Original length was 30
      leftCable.position.y = 20 + cableLength / 2; // Position relative to gateGroup
      rightCable.scale.y = cableLength / 30;
      rightCable.position.y = 20 + cableLength / 2;

      // 2. Animate Motor & Gears (only when moving)
      if (Math.abs(gateOpening - prevOpening) > 0.1) {
        const speed = (gateOpening > prevOpening) ? 0.1 : -0.1;
        motor.rotation.x += speed;
        gear1.rotation.x -= speed;
        gear2.rotation.x -= speed;
        prevOpening += (gateOpening - prevOpening) * 0.1;
      }

      // 3. Apply Vibration to Motor Group
      if (vibration > 0) {
        const vibIntensity = vibration * 0.05;
        motorGroup.position.x = Math.sin(time * 50) * vibIntensity;
        motorGroup.position.z = Math.cos(time * 40) * vibIntensity;
      } else {
        motorGroup.position.x = 0;
        motorGroup.position.z = 0;
      }

      // 4. Animate Downstream Water Level & Flow
      const targetDownLevel = 2 + (gateOpening / 100) * 8; // Max level 10
      waterDown.position.y += (targetDownLevel - waterDown.position.y) * 0.05;

      const pPositions = particleGeo.attributes.position.array as Float32Array;
      const flowSpeed = (gateOpening / 100) * 0.5;
      
      particleMat.opacity = gateOpening > 0 ? 0.6 : 0; // Hide if closed

      for (let i = 0; i < particleCount * 3; i += 3) {
        pPositions[i + 2] += flowSpeed; // Move downstream
        
        // Reset particles
        if (pPositions[i + 2] > 15) {
          pPositions[i + 2] = 0; // Start at gate
          pPositions[i] = (Math.random() - 0.5) * 16;
          pPositions[i + 1] = Math.random() * (gateGroup.position.y + 2); // Emerge from under gate
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 5. Alert Colors
      if (isAlert) {
        motorMat.color.setHex(0xef4444); // Red motor
        gateMat.color.setHex(0xfca5a5); // Tint gate red
      } else if (motorCurrent > 80 || vibration > 5) {
        motorMat.color.setHex(0xfacc15); // Yellow motor
        gateMat.color.setHex(0xfef08a);
      } else {
        motorMat.color.setHex(0x3b82f6); // Normal blue
        gateMat.color.setHex(0x475569); // Normal slate
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
