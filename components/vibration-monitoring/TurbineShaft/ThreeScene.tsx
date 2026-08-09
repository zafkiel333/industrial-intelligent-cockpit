import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vibrationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null; // Transparent background for better integration

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 40, 40);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      logarithmicDepthBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Shaft Group
    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    // Main Shaft - High-end Material
    const mainShaftGeo = new THREE.CylinderGeometry(3.5, 3.5, 50, 64);
    const mainShaftMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    const mainShaft = new THREE.Mesh(mainShaftGeo, mainShaftMat);
    mainShaft.castShadow = true;
    mainShaft.receiveShadow = true;
    shaftGroup.add(mainShaft);

    // Add Detail Rings to Shaft
    for (let i = -20; i <= 20; i += 10) {
      const detailGeo = new THREE.TorusGeometry(3.6, 0.1, 16, 64);
      const detailMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
      const detail = new THREE.Mesh(detailGeo, detailMat);
      detail.rotation.x = Math.PI / 2;
      detail.position.y = i;
      shaftGroup.add(detail);
    }

    // Coupling - More complex
    const couplingGroup = new THREE.Group();
    couplingGroup.position.y = 12;
    shaftGroup.add(couplingGroup);

    const couplingBaseGeo = new THREE.CylinderGeometry(5.5, 5.5, 6, 32);
    const couplingBase = new THREE.Mesh(couplingBaseGeo, mainShaftMat);
    couplingGroup.add(couplingBase);

    // Bolts with glow
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const boltGroup = new THREE.Group();
      boltGroup.position.set(Math.cos(angle) * 4.5, 0, Math.sin(angle) * 4.5);
      
      const boltGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
      const bolt = new THREE.Mesh(boltGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1 }));
      boltGroup.add(bolt);

      const glowGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.y = 0.8;
      boltGroup.add(glow);

      couplingGroup.add(boltGroup);
    }

    // Turbine Blades - Realistic Shape
    const bladeGroup = new THREE.Group();
    bladeGroup.position.y = -18;
    shaftGroup.add(bladeGroup);

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0);
      bladeShape.lineTo(10, 2);
      bladeShape.lineTo(12, 8);
      bladeShape.lineTo(2, 6);
      bladeShape.lineTo(0, 0);

      const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2 };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      const bladeMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.7,
        metalness: 0.5,
        roughness: 0.2,
        transmission: 0.5,
        thickness: 1,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.2
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.x = Math.PI / 2;
      blade.rotation.z = angle;
      blade.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);
      bladeGroup.add(blade);
    }

    // Sensor Nodes (Glowing points)
    const sensors: THREE.Mesh[] = [];
    const sensorPositions = [
      { y: 15, r: 4 },
      { y: 0, r: 4 },
      { y: -15, r: 4 }
    ];

    sensorPositions.forEach((pos, idx) => {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const sensorGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const sensorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const sensor = new THREE.Mesh(sensorGeo, sensorMat);
        sensor.position.set(Math.cos(angle) * pos.r, pos.y, Math.sin(angle) * pos.r);
        scene.add(sensor);
        sensors.push(sensor);
      }
    });

    // Particle System - More dynamic
    const particlesCount = 500;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      posArray[i3] = Math.cos(angle) * radius;
      posArray[i3 + 1] = (Math.random() - 0.5) * 60;
      posArray[i3 + 2] = Math.sin(angle) * radius;
      velArray[i] = 0.05 + Math.random() * 0.1;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const particleMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x0ea5e9, 20, 100);
    light1.position.set(20, 20, 20);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x3b82f6, 15, 100);
    light2.position.set(-20, -20, 20);
    scene.add(light2);

    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 50, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;
    scene.add(spotLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Rotation
      shaftGroup.rotation.y += 0.01;
      
      // Vibration simulation
      const vibIntensity = 0.15;
      const vibX = Math.sin(time * 12) * vibIntensity;
      const vibZ = Math.cos(time * 12) * vibIntensity;
      shaftGroup.position.set(vibX, 0, vibZ);
      
      // Sensor pulsing
      sensors.forEach((sensor, i) => {
        const pulse = 0.5 + Math.sin(time * 5 + i) * 0.5;
        (sensor.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.7;
        sensor.scale.setScalar(0.8 + pulse * 0.4);
      });

      // Particle animation
      const positions = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= velArray[i];
        
        // Circular drift
        const x = positions[i3];
        const z = positions[i3 + 2];
        const angle = 0.01;
        positions[i3] = x * Math.cos(angle) - z * Math.sin(angle);
        positions[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);

        if (positions[i3 + 1] < -30) positions[i3 + 1] = 30;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []); // Empty dependency array as requested

  return <div ref={containerRef} className="w-full h-full" />;
};
