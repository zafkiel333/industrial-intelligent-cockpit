
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GovernorThreeProps } from './three-types';

export const GovernorThreeScene: React.FC<GovernorThreeProps> = ({ 
  parts, 
  activeId, 
  onPartSelect,
  systemPressure,
  servoPosition,
  isAutoMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f18, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false; // We will handle manual interaction

    // --- Scene Geometry ---
    const group = new THREE.Group();
    scene.add(group);

    const interactives: THREE.Mesh[] = [];

    // Materials
    const tankMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155, metalness: 0.8, roughness: 0.2, transmission: 0.2, transparent: true, opacity: 0.8 
    });
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 });
    const accumMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, metalness: 0.7, roughness: 0.3 }); // Orange/Red
    const activeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
    const warningMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
    
    // 1. Oil Tank (Base)
    const tankGeo = new THREE.BoxGeometry(10, 2, 6);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = -1;
    tank.userData = { id: 'GOV-TANK' };
    group.add(tank);
    interactives.push(tank);

    // Oil inside
    const oilGeo = new THREE.BoxGeometry(9.8, 1.5, 5.8);
    const oilMat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.4 });
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.position.y = -1.2;
    group.add(oil);

    // 2. Accumulators (Pressure Tanks)
    const accGeo = new THREE.CapsuleGeometry(0.8, 4, 4, 16);
    const acc1 = new THREE.Mesh(accGeo, accumMat);
    acc1.position.set(-3, 3, -2);
    acc1.userData = { id: 'GOV-ACC-01' };
    group.add(acc1);
    interactives.push(acc1);

    const acc2 = acc1.clone();
    acc2.position.set(-1, 3, -2);
    acc2.userData = { id: 'GOV-ACC-02' };
    group.add(acc2);
    interactives.push(acc2);

    // 3. Motor Pump Group
    const motorGeo = new THREE.CylinderGeometry(0.6, 0.6, 2, 16);
    motorGeo.rotateZ(Math.PI/2);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const motor1 = new THREE.Mesh(motorGeo, pumpMat);
    motor1.position.set(3, 1.5, -2);
    motor1.userData = { id: 'GOV-PUMP-01' };
    group.add(motor1);
    interactives.push(motor1);

    const motor2 = motor1.clone();
    motor2.position.set(3, 1.5, 0);
    motor2.userData = { id: 'GOV-PUMP-02' };
    group.add(motor2);
    interactives.push(motor2);

    // 4. Distributing Valve Block
    const valveGeo = new THREE.BoxGeometry(2, 2, 2);
    const valveBlock = new THREE.Mesh(valveGeo, pumpMat);
    valveBlock.position.set(0, 1.5, 2);
    valveBlock.userData = { id: 'GOV-VALVE-MAIN' };
    group.add(valveBlock);
    interactives.push(valveBlock);

    // E/H Converter on top of valve
    const ehGeo = new THREE.BoxGeometry(0.8, 1, 0.8);
    const ehMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
    const ehConverter = new THREE.Mesh(ehGeo, ehMat);
    ehConverter.position.set(0, 3, 2);
    ehConverter.userData = { id: 'GOV-EH-CONV' };
    group.add(ehConverter);
    interactives.push(ehConverter);

    // 5. Servomotor (Visual Representation)
    const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 16);
    cylGeo.rotateZ(Math.PI/2);
    const servoCyl = new THREE.Mesh(cylGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
    servoCyl.position.set(0, 5, 0);
    servoCyl.userData = { id: 'GOV-SERVO-01' };
    group.add(servoCyl);
    interactives.push(servoCyl);

    // Piston Rod (Dynamic)
    const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 16);
    rodGeo.rotateZ(Math.PI/2);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const servoRod = new THREE.Mesh(rodGeo, rodMat);
    servoRod.position.set(0, 5, 0); // Start center
    group.add(servoRod);

    // 6. Pipes (Connecting lines)
    const pipePoints = [
        new THREE.Vector3(-2, 1, -2), new THREE.Vector3(0, 1, 2), // Acc -> Valve
        new THREE.Vector3(3, 1, -2), new THREE.Vector3(0, 1, 2),  // Pump -> Valve
        new THREE.Vector3(0, 2.5, 2), new THREE.Vector3(0, 5, 0)  // Valve -> Servo
    ];
    // Simplified piping
    const pipeGeo = new THREE.BufferGeometry().setFromPoints(pipePoints);
    const pipeLines = new THREE.LineSegments(pipeGeo, new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.5 }));
    group.add(pipeLines);

    // Flow Particles
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random()-0.5)*5;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0x0ea5e9 });
    const particles = new THREE.Points(pGeo, pMat);
    particles.position.set(0, 2, 0);
    group.add(particles);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0x0ea5e9, 5);
    spot.position.set(5, 10, 5);
    scene.add(spot);
    const warmLight = new THREE.PointLight(0xf59e0b, 2, 10);
    warmLight.position.set(-5, 2, -5);
    scene.add(warmLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactives);
        if (intersects.length > 0) {
            onPartSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Servo Movement Animation
      const targetX = (servoPosition - 50) / 10; // Map 0-100 to approx -5 to 5
      servoRod.position.x += (targetX - servoRod.position.x) * 0.1;

      // Particle Flow
      if (isAutoMode) {
          particles.rotation.y += 0.02;
          particles.rotation.z += 0.01;
          const positions = particles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              const i3 = i*3;
              positions[i3+1] += Math.sin(time + positions[i3]) * 0.05;
          }
          particles.geometry.attributes.position.needsUpdate = true;
      }

      // Highlight active part
      interactives.forEach(mesh => {
          if (mesh.userData.id === activeId) {
             (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x0ea5e9);
             (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.2;
          } else {
             (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
             (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
          
          // Warning state blink
          const partData = parts.find(p => p.id === mesh.userData.id);
          if (partData?.status === 'warning' || partData?.status === 'critical') {
              (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.abs(Math.sin(time * 2));
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [parts, activeId, systemPressure, servoPosition, isAutoMode, onPartSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
