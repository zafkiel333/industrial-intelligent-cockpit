import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef({
    speed: 15.2, // RPM
    vibration: 1.8, // mm/s
    load: 65, // %
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
    scene.background = null;

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(80, 50, 80);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x06b6d4, 1);
    directionalLight.position.set(30, 60, 40);
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(0x06b6d4, 2);
    spotLight.position.set(-40, 40, -40);
    spotLight.angle = Math.PI / 6;
    scene.add(spotLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(120, 24, 0x1e293b, 0x0f172a);
    scene.add(gridHelper);

    // --- Ball Mill Model ---
    const millGroup = new THREE.Group();
    scene.add(millGroup);

    // Main Shell (Cylinder)
    const shellGeometry = new THREE.CylinderGeometry(15, 15, 50, 64);
    const shellMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.1,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.05
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.rotation.z = Math.PI / 2;
    millGroup.add(shell);

    // Girth Gear (Large ring gear)
    const gearGeometry = new THREE.TorusGeometry(16, 1.5, 16, 100);
    const gearMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 1, roughness: 0.3 });
    const gear = new THREE.Mesh(gearGeometry, gearMaterial);
    gear.rotation.y = Math.PI / 2;
    gear.position.x = 10;
    shell.add(gear); // Attach to shell so it rotates together

    // Bearing Pedestals (Ends)
    const pedestalGeometry = new THREE.BoxGeometry(10, 15, 20);
    const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
    
    const leftPedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    leftPedestal.position.set(-30, -7.5, 0);
    scene.add(leftPedestal);

    const rightPedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    rightPedestal.position.set(30, -7.5, 0);
    scene.add(rightPedestal);

    // Bearing Housings (Cylindrical)
    const housingGeometry = new THREE.CylinderGeometry(8, 8, 12, 32);
    const housingMaterial = new THREE.MeshStandardMaterial({ color: 0x475569 });
    
    const leftHousing = new THREE.Mesh(housingGeometry, housingMaterial);
    leftHousing.rotation.z = Math.PI / 2;
    leftHousing.position.set(-30, 0, 0);
    scene.add(leftHousing);

    const rightHousing = new THREE.Mesh(housingGeometry, housingMaterial);
    rightHousing.rotation.z = Math.PI / 2;
    rightHousing.position.set(30, 0, 0);
    scene.add(rightHousing);

    // Vibration Sensors (Small boxes on housings)
    const sensorGeometry = new THREE.BoxGeometry(2, 2, 2);
    const sensorMaterial = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    
    const sensorL = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensorL.position.set(-30, 8, 0);
    scene.add(sensorL);

    const sensorR = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensorR.position.set(30, 8, 0);
    scene.add(sensorR);

    // Internal Particles (Balls & Material)
    const ballCount = 100;
    const ballsGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const ballsMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const ballsGroup = new THREE.Group();
    shell.add(ballsGroup);

    for (let i = 0; i < ballCount; i++) {
      const ball = new THREE.Mesh(ballsGeometry, ballsMaterial);
      const angle = Math.random() * Math.PI; // Bottom half
      const radius = Math.random() * 12 + 2;
      ball.position.set(
        (Math.random() - 0.5) * 45,
        Math.sin(angle) * radius - 10,
        Math.cos(angle) * radius
      );
      ballsGroup.add(ball);
    }

    // Animation Loop
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Shell Rotation
      shell.rotation.x += (speed / 60) * 0.1;

      // Vibration Effect (Subtle shaking of pedestals and sensors)
      const shake = Math.sin(time * 50) * (vibration / 20);
      leftPedestal.position.y = -7.5 + shake;
      rightPedestal.position.y = -7.5 + shake;
      sensorL.position.y = 8 + shake;
      sensorR.position.y = 8 + shake;

      // Internal Balls Cascade (Simulated)
      ballsGroup.children.forEach((ball, idx) => {
        // Simple oscillation to simulate tumbling
        ball.position.y += Math.sin(time * 2 + idx) * 0.05;
        ball.position.z += Math.cos(time * 2 + idx) * 0.05;
      });

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
