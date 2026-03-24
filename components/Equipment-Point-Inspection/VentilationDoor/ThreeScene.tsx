import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VentilationDoorProps } from './three-types';

export const ThreeScene: React.FC<VentilationDoorProps> = (props) => {
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
    
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(0, 20, 10);
    scene.add(pointLight);

    // Tunnel
    const tunnelGeo = new THREE.CylinderGeometry(15, 15, 60, 32, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, side: THREE.BackSide });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = Math.PI / 2;
    tunnel.position.y = 0;
    scene.add(tunnel);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(60, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    scene.add(floor);

    // Ventilation Door Frame
    const frameGeo = new THREE.BoxGeometry(2, 20, 20);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0, 0);
    scene.add(frame);
    
    // Hole in frame
    const holeGeo = new THREE.BoxGeometry(3, 18, 18);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000, colorWrite: false });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    frame.add(hole);

    // Door panels (Double doors)
    const doorGroup = new THREE.Group();
    scene.add(doorGroup);

    const panelGeo = new THREE.BoxGeometry(1, 18, 9);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.3, roughness: 0.4 }); // sky-500
    
    // Left Door Pivot
    const leftPivot = new THREE.Group();
    leftPivot.position.set(0, 0, -9);
    doorGroup.add(leftPivot);
    const leftDoor = new THREE.Mesh(panelGeo, panelMat);
    leftDoor.position.set(0, 0, 4.5);
    leftPivot.add(leftDoor);

    // Right Door Pivot
    const rightPivot = new THREE.Group();
    rightPivot.position.set(0, 0, 9);
    doorGroup.add(rightPivot);
    const rightDoor = new THREE.Mesh(panelGeo, panelMat);
    rightDoor.position.set(0, 0, -4.5);
    rightPivot.add(rightDoor);

    // Airflow Particles
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 60; // X
      particlePos[i + 1] = (Math.random() - 0.5) * 18; // Y
      particlePos[i + 2] = (Math.random() - 0.5) * 18; // Z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.3, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Gas Sensor
    const sensorGeo = new THREE.BoxGeometry(1, 2, 1);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // yellow-400
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(2, 8, 8);
    scene.add(sensor);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const { airPressureDiff, doorStatus, gasConcentration, isAlert } = propsRef.current;

      // Door opening animation (doorStatus is 0-100)
      const openAngle = (doorStatus / 100) * (Math.PI / 2);
      leftPivot.rotation.y = -openAngle;
      rightPivot.rotation.y = openAngle;

      // Airflow animation based on pressure diff and door status
      const positions = particleGeo.attributes.position.array as Float32Array;
      const flowSpeed = (airPressureDiff / 100) * (doorStatus > 0 ? 1 : 0.1); // Slow leak if closed
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        // If door is closed, particles pile up or move very slowly
        if (doorStatus === 0 && positions[i] > 0 && positions[i] < 2) {
           // Blocked by door
        } else {
           positions[i] -= flowSpeed;
        }

        if (positions[i] < -30) {
          positions[i] = 30;
          positions[i+1] = (Math.random() - 0.5) * 18;
          positions[i+2] = (Math.random() - 0.5) * 18;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Gas concentration color change for particles
      if (gasConcentration > 1) {
        particleMat.color.setHex(0xf59e0b); // amber
      } else {
        particleMat.color.setHex(0x38bdf8); // sky blue
      }

      // Alert state
      if (isAlert) {
        panelMat.color.setHex(0xef4444); // red
        sensorMat.color.setHex(0xef4444);
      } else {
        panelMat.color.setHex(0x0ea5e9); // sky
        sensorMat.color.setHex(0xfacc15); // yellow
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
