import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(50, 50, 50);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      logarithmicDepthBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Stator Core Group
    const statorGroup = new THREE.Group();
    scene.add(statorGroup);

    const segmentCount = 48;
    const innerRadius = 18;
    const outerRadius = 26;
    const statorHeight = 20;

    // Materials
    const coreMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    const coilMat = new THREE.MeshStandardMaterial({ 
      color: 0x06b6d4, 
      emissive: 0x06b6d4,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2;
      const nextAngle = ((i + 0.9) / segmentCount) * Math.PI * 2;
      
      const shape = new THREE.Shape();
      shape.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
      shape.lineTo(Math.cos(nextAngle) * innerRadius, Math.sin(nextAngle) * innerRadius);
      shape.lineTo(Math.cos(nextAngle) * outerRadius, Math.sin(nextAngle) * outerRadius);
      shape.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
      shape.closePath();

      const extrudeSettings = { depth: statorHeight, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5 };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const segment = new THREE.Mesh(geometry, coreMat);
      segment.position.z = -statorHeight / 2;
      statorGroup.add(segment);

      // Add Coils with detail
      const coilGeo = new THREE.BoxGeometry(1.5, 5, statorHeight - 4);
      const coil = new THREE.Mesh(coilGeo, coilMat);
      const midAngle = (angle + nextAngle) / 2;
      coil.position.set(Math.cos(midAngle) * (innerRadius + 1.5), Math.sin(midAngle) * (innerRadius + 1.5), 0);
      coil.rotation.z = midAngle;
      statorGroup.add(coil);
    }
    statorGroup.rotation.x = Math.PI / 2;

    // Central Rotor - More detailed
    const rotorGroup = new THREE.Group();
    scene.add(rotorGroup);

    const rotorGeo = new THREE.CylinderGeometry(14, 14, 22, 64);
    const rotorMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155, 
      metalness: 1, 
      roughness: 0.1,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.05
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotorGroup.add(rotor);

    // Add Poles to Rotor
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const poleGeo = new THREE.BoxGeometry(4, 20, 2);
      const pole = new THREE.Mesh(poleGeo, rotorMat);
      pole.position.set(Math.cos(angle) * 12, 0, Math.sin(angle) * 12);
      pole.rotation.y = -angle;
      rotorGroup.add(pole);
    }

    // Electromagnetic Field Lines (Torus rings)
    const fieldLines: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const fieldGeo = new THREE.TorusGeometry(16, 0.05, 16, 100);
      const fieldMat = new THREE.MeshBasicMaterial({ 
        color: 0x06b6d4, 
        transparent: true, 
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      const field = new THREE.Mesh(fieldGeo, fieldMat);
      field.rotation.x = Math.PI / 2;
      field.position.y = (i - 2) * 4;
      scene.add(field);
      fieldLines.push(field);
    }

    // Magnetic Field Particles
    const particleCount = 3000;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 14 + Math.random() * 4;
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 25;
      posArray[i * 3 + 2] = Math.sin(angle) * radius;
      velArray[i] = 0.02 + Math.random() * 0.05;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x06b6d4, 15, 100);
    light1.position.set(30, 30, 30);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x3b82f6, 10, 100);
    light2.position.set(-30, -30, 30);
    scene.add(light2);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      rotorGroup.rotation.y += 0.005;
      
      // Field lines animation
      fieldLines.forEach((field, i) => {
        const scale = 1 + Math.sin(time * 2 + i) * 0.05;
        field.scale.set(scale, scale, 1);
        (field.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 3 + i) * 0.1;
      });

      // Particle animation - swirling and pulsing
      const positions = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3 + 2];
        const angle = Math.atan2(z, x) + velArray[i];
        const radius = Math.sqrt(x * x + z * z);
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 2] = Math.sin(angle) * radius;
        positions[i3 + 1] += Math.sin(time + i) * 0.02;
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
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
