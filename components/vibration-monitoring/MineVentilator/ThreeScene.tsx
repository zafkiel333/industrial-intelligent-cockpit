import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef({
    speed: 740, // RPM
    vibration: 1.2, // mm/s
    flow: 12000, // m3/min
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(50, 30, 50);
    camera.lookAt(0, 0, 0);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x06b6d4, 1);
    directionalLight.position.set(20, 40, 30);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 100);
    pointLight.position.set(-20, 20, -20);
    scene.add(pointLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
    scene.add(gridHelper);

    // --- Mine Ventilator Model ---
    const fanGroup = new THREE.Group();
    scene.add(fanGroup);

    // Fan Housing (Cylindrical)
    const housingGeometry = new THREE.CylinderGeometry(15, 15, 20, 64, 1, true);
    const housingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.4
    });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.rotation.x = Math.PI / 2;
    scene.add(housing);

    // Fan Hub
    const hubGeometry = new THREE.CylinderGeometry(3, 3, 4, 32);
    const hubMaterial = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.rotation.x = Math.PI / 2;
    fanGroup.add(hub);

    // Fan Blades
    const bladeGeometry = new THREE.BoxGeometry(12, 0.5, 4);
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.1 });
    
    const bladeCount = 6;
    for (let i = 0; i < bladeCount; i++) {
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const angle = (i / bladeCount) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 7, Math.sin(angle) * 7, 0);
      blade.rotation.z = angle;
      blade.rotation.x = Math.PI / 6; // Blade pitch
      fanGroup.add(blade);
    }

    // Motor (Cylindrical)
    const motorGeometry = new THREE.CylinderGeometry(6, 6, 15, 32);
    const motorMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const motor = new THREE.Mesh(motorGeometry, motorMaterial);
    motor.rotation.x = Math.PI / 2;
    motor.position.z = -18;
    scene.add(motor);

    // Drive Shaft
    const shaftGeometry = new THREE.CylinderGeometry(1, 1, 10, 16);
    const shaftMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -9;
    scene.add(shaft);

    // Airflow Streamlines (Simulated with particles)
    const particleCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 25;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      particlePositions[i * 3 + 2] = Math.random() * 60 - 30;
      particleVelocities[i] = Math.random() * 0.5 + 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ 
      color: 0x06b6d4, 
      size: 0.3, 
      transparent: true, 
      opacity: 0.6 
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation Loop
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Fan Rotation
      fanGroup.rotation.z += (speed / 60) * 0.1;

      // Vibration Effect (Subtle shaking of motor)
      const shake = Math.sin(time * 60) * (vibration / 30);
      motor.position.x = shake;
      motor.position.y = shake;

      // Airflow Motion
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Move particles in Z direction (airflow)
        positions[i * 3 + 2] += particleVelocities[i];
        
        // Add some swirl based on fan rotation
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const dist = Math.sqrt(x*x + y*y);
        if (dist < 15) {
          const angle = Math.atan2(y, x) + 0.02;
          positions[i * 3] = Math.cos(angle) * dist;
          positions[i * 3 + 1] = Math.sin(angle) * dist;
        }

        // Reset particles if they go too far
        if (positions[i * 3 + 2] > 30) {
          positions[i * 3 + 2] = -30;
          positions[i * 3] = (Math.random() - 0.5) * 25;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative" />;
};
