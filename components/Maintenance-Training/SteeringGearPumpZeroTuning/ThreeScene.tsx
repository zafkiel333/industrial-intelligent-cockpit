import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SteeringPumpState } from './three-types';

interface ThreeSceneProps {
  state: SteeringPumpState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SteeringPumpState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
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

    // Pump Body
    const pumpGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.rotation.z = Math.PI / 2;
    scene.add(pump);

    // Variable Mechanism (Swashplate/Control rod)
    const controlRodGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
    const controlRodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const controlRod = new THREE.Mesh(controlRodGeo, controlRodMat);
    controlRod.position.set(0, 2, 0);
    scene.add(controlRod);

    // Tuning Screw
    const screwGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }); // Yellow screw
    const screw = new THREE.Mesh(screwGeo, screwMat);
    screw.position.set(1, 2.5, 0);
    screw.rotation.z = Math.PI / 2;
    scene.add(screw);

    // Rudder Indicator (Visual representation)
    const indicatorGroup = new THREE.Group();
    indicatorGroup.position.set(0, -3, 0);

    const dialGeo = new THREE.CircleGeometry(1.5, 32, Math.PI / 4, Math.PI / 2);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    indicatorGroup.add(dial);

    const pointerGeo = new THREE.BoxGeometry(0.1, 1.4, 0.1);
    const pointerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const pointer = new THREE.Mesh(pointerGeo, pointerMat);
    pointer.position.y = 0.7;
    
    const pointerPivot = new THREE.Group();
    pointerPivot.add(pointer);
    indicatorGroup.add(pointerPivot);

    scene.add(indicatorGroup);

    // Hydraulic Fluid Flow (Particles)
    const flowGeo = new THREE.BufferGeometry();
    const flowCount = 50;
    const flowPos = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount * 3; i++) {
      flowPos[i] = (Math.random() - 0.5) * 4;
      flowPos[i + 1] = (Math.random() - 0.5) * 1.5;
      flowPos[i + 2] = (Math.random() - 0.5) * 1.5;
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
    const flowMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.1, transparent: true, opacity: 0.6 });
    const flowParticles = new THREE.Points(flowGeo, flowMat);
    scene.add(flowParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Animate Tuning Screw
      screw.position.x = 1 + (currentState.tuningScrew * 0.05);
      screw.rotation.x = currentState.tuningScrew * Math.PI;

      // Animate Control Rod based on zero offset
      controlRod.position.x = currentState.zeroOffset * 0.1;

      // Animate Rudder Pointer
      // Rudder angle is -35 to 35. Map to -Math.PI/4 to Math.PI/4
      const targetRotation = -(currentState.rudderAngle / 35) * (Math.PI / 4);
      pointerPivot.rotation.z = THREE.MathUtils.lerp(pointerPivot.rotation.z, targetRotation, 0.1);

      // Animate Hydraulic Flow
      if (currentState.pumpRunning) {
        flowParticles.visible = true;
        const positions = flowGeo.attributes.position.array as Float32Array;
        // Flow direction depends on zero offset if no command is given (which is what zero tuning is about)
        const flowSpeed = currentState.zeroOffset * 0.05;
        
        for (let i = 0; i < flowCount; i++) {
          positions[i * 3] += flowSpeed;
          if (positions[i * 3] > 2) positions[i * 3] = -2;
          if (positions[i * 3] < -2) positions[i * 3] = 2;
        }
        flowGeo.attributes.position.needsUpdate = true;
      } else {
        flowParticles.visible = false;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.1;

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
