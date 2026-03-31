import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VibratingFeederState } from './three-types';

interface ThreeSceneProps {
  state?: VibratingFeederState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<VibratingFeederState>(state || {
    vibrationFrequency: 30,
    vibrationAmplitude: 4.5,
    motorTemp: 40,
    feedRate: 500,
    exciterForce: 85
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Vibrating Feeder Model
    const feederGroup = new THREE.Group();
    scene.add(feederGroup);

    // Trough (More detailed)
    const troughBaseGeom = new THREE.BoxGeometry(7, 0.4, 3.5);
    const troughMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const troughBase = new THREE.Mesh(troughBaseGeom, troughMat);
    feederGroup.add(troughBase);

    const sideWallGeom = new THREE.BoxGeometry(7, 1.2, 0.2);
    const wall1 = new THREE.Mesh(sideWallGeom, troughMat);
    wall1.position.set(0, 0.6, 1.75);
    feederGroup.add(wall1);

    const wall2 = new THREE.Mesh(sideWallGeom, troughMat);
    wall2.position.set(0, 0.6, -1.75);
    feederGroup.add(wall2);

    const backWallGeom = new THREE.BoxGeometry(0.2, 1.2, 3.5);
    const backWall = new THREE.Mesh(backWallGeom, troughMat);
    backWall.position.set(-3.5, 0.6, 0);
    feederGroup.add(backWall);

    // Springs (Coil style)
    const springGroup = new THREE.Group();
    scene.add(springGroup);
    const positions = [[-2.5, -1.2, -1.2], [2.5, -1.2, -1.2], [-2.5, -1.2, 1.2], [2.5, -1.2, 1.2]];
    const springRefs: THREE.Mesh[] = [];
    positions.forEach(pos => {
      const springGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
      const springMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });
      const spring = new THREE.Mesh(springGeom, springMat);
      spring.position.set(pos[0], pos[1], pos[2]);
      springGroup.add(spring);
      springRefs.push(spring);
    });

    // Exciter (Dual motors)
    const exciterGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 32);
    const exciterMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const motor1 = new THREE.Mesh(exciterGeom, exciterMat);
    motor1.rotation.z = Math.PI / 2;
    motor1.position.set(0, -0.8, 0.8);
    feederGroup.add(motor1);

    const motor2 = new THREE.Mesh(exciterGeom, exciterMat);
    motor2.rotation.z = Math.PI / 2;
    motor2.position.set(0, -0.8, -0.8);
    feederGroup.add(motor2);

    // Material (Particles)
    const particleCount = 50;
    const particles: THREE.Mesh[] = [];
    const partGeom = new THREE.DodecahedronGeometry(0.15);
    const partMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.3 });
    
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(partGeom, partMat);
      p.position.set(Math.random() * 6 - 3, 0.4, Math.random() * 3 - 1.5);
      feederGroup.add(p);
      particles.push(p);
    }

    const grid = new THREE.GridHelper(30, 15, 0x00ffff, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const { vibrationFrequency, vibrationAmplitude } = stateRef.current;
      const time = Date.now() * 0.001;

      // Vibration effect (Simulating high frequency vibration)
      const vibFreq = vibrationFrequency * 0.5;
      const vibAmp = vibrationAmplitude * 0.02;
      const vibX = Math.sin(time * vibFreq) * vibAmp;
      const vibY = Math.cos(time * vibFreq) * vibAmp;
      
      feederGroup.position.x = vibX;
      feederGroup.position.y = vibY;
      feederGroup.rotation.z = vibX * 0.05;

      // Particle Movement (Jumping effect)
      particles.forEach((p, i) => {
        p.position.x += 0.02;
        if (p.position.x > 3.5) p.position.x = -3.5;
        p.position.y = 0.4 + Math.abs(Math.sin(time * 10 + i)) * 0.2;
      });

      // Motor Rotation
      motor1.rotation.y += vibrationFrequency * 0.1;
      motor2.rotation.y -= vibrationFrequency * 0.1;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

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
