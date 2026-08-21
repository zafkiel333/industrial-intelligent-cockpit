import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InverterState } from './three-types';

interface ThreeSceneProps {
  state: InverterState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<InverterState>(state);

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
    camera.position.set(0, 2, 12);
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

    // Inverter Enclosure (Explosion-proof)
    const enclosureGeo = new THREE.BoxGeometry(6, 8, 4);
    const enclosureMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.2 });
    const enclosure = new THREE.Mesh(enclosureGeo, enclosureMat);
    scene.add(enclosure);

    // Heavy Door
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-3, 0, 2); // Hinge on the left
    
    const doorGeo = new THREE.BoxGeometry(6, 8, 0.5);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(3, 0, 0.25); // Offset from hinge
    doorGroup.add(door);

    // Warning Label on Door
    const labelGeo = new THREE.PlaneGeometry(2, 1);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red warning
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(3, 2, 0.51);
    doorGroup.add(label);

    scene.add(doorGroup);

    // Internal Components (Visible when door is open)
    const internalsGroup = new THREE.Group();
    internalsGroup.position.set(0, 0, 1.5);
    scene.add(internalsGroup);

    // Heat Sink
    const heatSinkGeo = new THREE.BoxGeometry(4, 3, 0.5);
    const heatSinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const heatSink = new THREE.Mesh(heatSinkGeo, heatSinkMat);
    heatSink.position.set(0, 0, 0);
    internalsGroup.add(heatSink);

    // Old IGBT Module (Burnt/Damaged)
    const oldIgbtGeo = new THREE.BoxGeometry(2, 1.5, 0.3);
    const oldIgbtMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }); // Dark, burnt
    const oldIgbt = new THREE.Mesh(oldIgbtGeo, oldIgbtMat);
    oldIgbt.position.set(0, 0, 0.4);
    internalsGroup.add(oldIgbt);

    // New IGBT Module (Clean)
    const newIgbtGeo = new THREE.BoxGeometry(2, 1.5, 0.3);
    const newIgbtMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.5 }); // Blueish, new
    const newIgbt = new THREE.Mesh(newIgbtGeo, newIgbtMat);
    newIgbt.position.set(5, 0, 5); // Initially off-screen
    scene.add(newIgbt);

    // Testing Indicator Light
    const lightGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x334155 }); // Off
    const indicatorLight = new THREE.Mesh(lightGeo, lightMat);
    indicatorLight.position.set(2, 3, 0.3);
    internalsGroup.add(indicatorLight);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Door Animation
      const targetDoorAngle = currentState.doorOpen ? -Math.PI / 1.5 : 0;
      doorGroup.rotation.y = THREE.MathUtils.lerp(doorGroup.rotation.y, targetDoorAngle, 0.1);

      // IGBT Removal/Installation
      if (currentState.igbtRemoved) {
        oldIgbt.position.x = THREE.MathUtils.lerp(oldIgbt.position.x, -5, 0.05);
        oldIgbt.position.z = THREE.MathUtils.lerp(oldIgbt.position.z, 5, 0.05);
      } else {
        oldIgbt.position.set(0, 0, 0.4);
      }

      if (currentState.newIgbtInstalled) {
        newIgbt.position.x = THREE.MathUtils.lerp(newIgbt.position.x, 0, 0.1);
        newIgbt.position.y = THREE.MathUtils.lerp(newIgbt.position.y, 0, 0.1);
        newIgbt.position.z = THREE.MathUtils.lerp(newIgbt.position.z, 1.9, 0.1); // 1.5 (internals) + 0.4
      } else {
        newIgbt.position.set(5, 0, 5);
      }

      // Testing Animation
      if (currentState.testing) {
        // Blink yellow
        lightMat.color.setHex(Date.now() % 500 < 250 ? 0xeab308 : 0x334155);
      } else if (currentState.testResult === 'pass') {
        lightMat.color.setHex(0x22c55e); // Green
      } else if (currentState.testResult === 'fail') {
        lightMat.color.setHex(0xef4444); // Red
      } else {
        lightMat.color.setHex(0x334155); // Off
      }

      // Slowly rotate scene
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;

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
