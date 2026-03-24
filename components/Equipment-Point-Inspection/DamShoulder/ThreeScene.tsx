import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DamShoulderProps } from './three-types';

export const ThreeScene: React.FC<DamShoulderProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.FogExp2('#0f172a', 0.015);
    
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(40, 30, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 50, 20);
    scene.add(directionalLight);

    // Dam Structure
    const damGroup = new THREE.Group();
    
    // Main Dam Body (Curved)
    const damGeo = new THREE.CylinderGeometry(80, 80, 40, 32, 1, false, Math.PI * 0.25, Math.PI * 0.5);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7, metalness: 0.2 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(-50, 0, -50);
    damGroup.add(dam);

    // Dam Shoulder (Rock mass)
    const shoulderGeo = new THREE.BoxGeometry(30, 40, 40);
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, wireframe: true });
    const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulder.position.set(10, 0, 0);
    damGroup.add(shoulder);

    // Crack Visualization
    const crackGeo = new THREE.PlaneGeometry(2, 20);
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const crack = new THREE.Mesh(crackGeo, crackMat);
    crack.position.set(25.1, 5, 0);
    crack.rotation.y = Math.PI / 2;
    crack.rotation.z = Math.PI / 12;
    damGroup.add(crack);

    // Drone (Inspection Robot)
    const droneGroup = new THREE.Group();
    const droneBodyGeo = new THREE.BoxGeometry(2, 0.5, 2);
    const droneBodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    const droneBody = new THREE.Mesh(droneBodyGeo, droneBodyMat);
    droneGroup.add(droneBody);

    // Drone Rotors
    const rotorGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.5 });
    const rotors: THREE.Mesh[] = [];
    const rotorPositions = [[-1.2, 0.3, -1.2], [1.2, 0.3, -1.2], [-1.2, 0.3, 1.2], [1.2, 0.3, 1.2]];
    rotorPositions.forEach(pos => {
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.position.set(pos[0], pos[1], pos[2]);
      droneGroup.add(rotor);
      rotors.push(rotor);
    });

    // Scanner Cone
    const scannerGeo = new THREE.ConeGeometry(3, 10, 16);
    const scannerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.position.y = -5;
    scanner.rotation.x = Math.PI;
    droneGroup.add(scanner);

    scene.add(droneGroup);
    scene.add(damGroup);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { displacement, stress, crackWidth, isAlert } = propsRef.current;

      // Drone flight path (scanning the shoulder)
      droneGroup.position.x = 30;
      droneGroup.position.y = 15 + Math.sin(time * 0.5) * 10;
      droneGroup.position.z = Math.cos(time * 0.3) * 15;
      
      // Drone tilt
      droneGroup.rotation.z = Math.sin(time * 0.5) * 0.1;
      droneGroup.rotation.x = Math.cos(time * 0.3) * 0.1;

      // Spin rotors
      rotors.forEach(rotor => {
        rotor.rotation.y += 0.5;
      });

      // Crack visualization based on width
      crack.scale.x = crackWidth;
      crackMat.opacity = 0.4 + (crackWidth / 5) * 0.6;

      // Shoulder color based on stress
      const stressRatio = stress / 100;
      shoulderMat.color.setHSL(0.6 - (stressRatio * 0.6), 0.5, 0.4);

      // Alert state
      if (isAlert) {
        scannerMat.color.setHex(0xef4444);
        droneBodyMat.color.setHex(0xef4444);
        // Exaggerate displacement
        shoulder.position.x = 10 + Math.sin(time * 10) * (displacement / 50);
      } else {
        scannerMat.color.setHex(0x38bdf8);
        droneBodyMat.color.setHex(0x38bdf8);
        shoulder.position.x = 10;
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
