import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(100, 150, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Surge Tank Structure
    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    // Main Tank Body (Outer Shell)
    const tankGeom = new THREE.CylinderGeometry(40, 40, 200, 32, 1, true);
    const tankMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.8
    });
    const tank = new THREE.Mesh(tankGeom, tankMat);
    tankGroup.add(tank);

    // Tank Wireframe
    const tankWire = new THREE.WireframeGeometry(tankGeom);
    const tankWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const tankWireMesh = new THREE.LineSegments(tankWire, tankWireMat);
    tankGroup.add(tankWireMesh);

    // Internal Support Structure
    const supportGeom = new THREE.CylinderGeometry(2, 2, 200, 8);
    const supportMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const support = new THREE.Mesh(supportGeom, supportMat);
      const angle = (i / 4) * Math.PI * 2;
      support.position.set(Math.cos(angle) * 35, 0, Math.sin(angle) * 35);
      tankGroup.add(support);
    }

    // Water Volume (Dynamic)
    const waterGroup = new THREE.Group();
    tankGroup.add(waterGroup);

    const waterGeom = new THREE.CylinderGeometry(39, 39, 1, 32);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.5,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.1
    });
    const waterBody = new THREE.Mesh(waterGeom, waterMat);
    waterGroup.add(waterBody);

    // Water Surface (Glowing disk)
    const surfaceGeom = new THREE.CircleGeometry(39, 32);
    surfaceGeom.rotateX(-Math.PI / 2);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5
    });
    const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
    waterGroup.add(surface);

    // Pressure Waves (Particles)
    const pCount = 300;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount);
    
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 38;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
      pVel[i] = 0.5 + Math.random();
    }
    
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pPointsMat = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 1,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const waterParticles = new THREE.Points(pGeom, pPointsMat);
    tankGroup.add(waterParticles);

    // Vibration Sensors
    const sensorGeom = new THREE.BoxGeometry(4, 4, 4);
    const sensorMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444, 
      emissive: 0xef4444, 
      emissiveIntensity: 1 
    });
    const sensors: THREE.Mesh[] = [];
    [50, -50].forEach(y => {
      const s = new THREE.Mesh(sensorGeom, sensorMat);
      s.position.set(40, y, 0);
      tankGroup.add(s);
      sensors.push(s);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 5, 400, Math.PI / 4, 0.5);
    spotLight.position.set(100, 150, 100);
    scene.add(spotLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Water Level Oscillation (Slow surge)
      const surge = Math.sin(time * 0.4) * 40;
      const waterHeight = 100 + surge;
      waterGroup.position.y = (waterHeight / 2) - 100;
      waterBody.scale.y = waterHeight;
      surface.position.y = waterHeight / 2;

      // High-frequency vibration (Jitter)
      const vibIntensity = 0.15 + Math.sin(time * 3) * 0.1;
      tankGroup.position.x = Math.sin(time * 70) * vibIntensity;
      tankGroup.position.z = Math.cos(time * 65) * vibIntensity;

      // Pulse sensors
      sensors.forEach(s => {
        (s.material as any).emissiveIntensity = 1 + Math.sin(time * 12) * 0.6;
      });

      // Particle animation
      const positions = waterParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3 + 1] += pVel[i];
        if (positions[i * 3 + 1] > 100) {
          positions[i * 3 + 1] = -100;
        }
      }
      waterParticles.geometry.attributes.position.needsUpdate = true;

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
