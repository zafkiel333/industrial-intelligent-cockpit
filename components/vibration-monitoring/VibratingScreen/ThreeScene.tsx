import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef({
    amplitude: 2.5,
    frequency: 16.5,
    load: 75,
    speed: 980,
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
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(60, 40, 60);
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

    const mainLight = new THREE.DirectionalLight(0x06b6d4, 1);
    mainLight.position.set(20, 50, 30);
    scene.add(mainLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 100);
    pointLight.position.set(-20, 20, -20);
    scene.add(pointLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
    scene.add(gridHelper);

    // --- Vibrating Screen Model ---
    const screenGroup = new THREE.Group();
    scene.add(screenGroup);

    // Base Frame
    const frameGeometry = new THREE.BoxGeometry(40, 2, 20);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const baseFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    baseFrame.position.y = -5;
    scene.add(baseFrame);

    // Screen Body (Inclined)
    const bodyGeometry = new THREE.BoxGeometry(36, 4, 18);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      emissive: 0x06b6d4, 
      emissiveIntensity: 0.1,
      metalness: 0.9, 
      roughness: 0.1 
    });
    const screenBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    screenBody.rotation.z = -Math.PI / 12; // 15 degree incline
    screenGroup.add(screenBody);

    // Screen Mesh (Visual representation)
    const meshGeometry = new THREE.PlaneGeometry(35, 17);
    const meshMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const screenMesh = new THREE.Mesh(meshGeometry, meshMaterial);
    screenMesh.rotation.x = -Math.PI / 2;
    screenMesh.position.y = 2.1;
    screenBody.add(screenMesh);

    // Exciter (Rotating parts)
    const exciterGeometry = new THREE.CylinderGeometry(2, 2, 16, 32);
    const exciterMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const exciter = new THREE.Mesh(exciterGeometry, exciterMaterial);
    exciter.rotation.x = Math.PI / 2;
    exciter.position.y = 4;
    screenBody.add(exciter);

    // Trajectory Lines (Elliptical)
    const curve = new THREE.EllipseCurve(0, 0, 2, 1, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(50);
    const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const trajectoryMaterial = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 });
    
    const trajectory1 = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    trajectory1.position.set(15, 6, 0);
    trajectory1.rotation.x = Math.PI / 2;
    screenBody.add(trajectory1);

    const trajectory2 = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    trajectory2.position.set(-15, 6, 0);
    trajectory2.rotation.x = Math.PI / 2;
    screenBody.add(trajectory2);

    // Particles (Material Load)
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 1] = 2.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      particleVelocities[i] = Math.random() * 0.2 + 0.1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ 
      color: 0xfacc15, 
      size: 0.4, 
      transparent: true, 
      opacity: 0.8 
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    screenBody.add(particles);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { amplitude, frequency } = dataRef.current;

      // Vibration Motion (High frequency oscillation)
      const vibX = Math.cos(time * frequency) * (amplitude / 10);
      const vibY = Math.sin(time * frequency) * (amplitude / 10);
      screenGroup.position.set(vibX, vibY, 0);

      // Exciter Rotation
      exciter.rotation.y += 0.2;

      // Particle Motion (Flowing down the screen)
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Move particles down the incline (X direction)
        positions[i * 3] -= particleVelocities[i];
        
        // Add some vibration bounce
        positions[i * 3 + 1] = 2.5 + Math.abs(Math.sin(time * frequency + i)) * 0.5;

        // Reset particles if they fall off
        if (positions[i * 3] < -18) {
          positions[i * 3] = 18;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
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
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array as requested

  return <div ref={containerRef} className="w-full h-full relative overflow-hidden rounded-lg" />;
};
