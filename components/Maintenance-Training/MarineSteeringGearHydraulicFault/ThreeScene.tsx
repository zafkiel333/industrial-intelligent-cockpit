import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SteeringGearState } from './three-types';

interface ThreeSceneProps {
  state: SteeringGearState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SteeringGearState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Rudder Stock (Center)
    const stockGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
    const stockMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    const stock = new THREE.Mesh(stockGeo, stockMat);
    scene.add(stock);

    // Tiller Arm
    const tillerGroup = new THREE.Group();
    scene.add(tillerGroup);
    
    const armGeo = new THREE.BoxGeometry(6, 0.5, 1);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const arm = new THREE.Mesh(armGeo, armMat);
    tillerGroup.add(arm);

    // Hydraulic Rams (Cylinders)
    const createRam = (xPos: number) => {
      const group = new THREE.Group();
      group.position.set(xPos, 0, 3);

      // Cylinder body
      const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 16);
      const cylMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.rotation.x = Math.PI / 2;
      group.add(cyl);

      // Piston rod
      const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
      const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 1 });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.rotation.x = Math.PI / 2;
      rod.position.z = -1.5; // Extends towards tiller
      group.add(rod);

      return { group, rod };
    };

    const ramLeft = createRam(-3);
    const ramRight = createRam(3);
    scene.add(ramLeft.group);
    scene.add(ramRight.group);

    // Hydraulic Pumps
    const createPump = (xPos: number, color: number) => {
      const pumpGeo = new THREE.BoxGeometry(1.5, 1.5, 2);
      const pumpMat = new THREE.MeshStandardMaterial({ color, metalness: 0.5 });
      const pump = new THREE.Mesh(pumpGeo, pumpMat);
      pump.position.set(xPos, -2, 5);
      return pump;
    };

    const pump1 = createPump(-2, 0x059669); // Greenish
    const pump2 = createPump(2, 0x059669);
    scene.add(pump1);
    scene.add(pump2);

    // Piping (Simplified lines)
    const pipeMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    const createPipe = (points: THREE.Vector3[]) => {
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geo, pipeMat);
    };
    scene.add(createPipe([new THREE.Vector3(-2, -2, 4), new THREE.Vector3(-3, 0, 3)]));
    scene.add(createPipe([new THREE.Vector3(2, -2, 4), new THREE.Vector3(3, 0, 3)]));

    // Filter (Visual indicator)
    const filterGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
    const filterMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const filter = new THREE.Mesh(filterGeo, filterMat);
    filter.position.set(0, -2, 4);
    scene.add(filter);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate tiller based on rudder angle
      const angleRad = (currentState.rudderAngle * Math.PI) / 180;
      tillerGroup.rotation.y = -angleRad; // Negative so right rudder turns tiller right

      // Animate piston rods based on tiller movement
      // Simplified kinematics: rod extension depends on tiller angle
      const extension = Math.sin(angleRad) * 3; 
      ramLeft.rod.position.z = -1.5 - extension;
      ramRight.rod.position.z = -1.5 + extension;

      // Pump visual feedback (pulsing if active)
      if (currentState.pump1Active) {
        (pump1.material as THREE.MeshStandardMaterial).emissive.setHex(0x059669);
        (pump1.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      } else {
        (pump1.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }

      if (currentState.pump2Active) {
        (pump2.material as THREE.MeshStandardMaterial).emissive.setHex(0x059669);
        (pump2.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      } else {
        (pump2.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }

      // Filter visual feedback
      if (currentState.filterClogged) {
        filterMat.color.setHex(0xef4444); // Red if clogged
      } else {
        filterMat.color.setHex(0x94a3b8);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
