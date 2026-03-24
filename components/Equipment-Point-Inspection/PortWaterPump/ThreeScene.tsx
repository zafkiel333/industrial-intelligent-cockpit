import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortWaterPumpProps } from './three-types';

export const ThreeScene: React.FC<PortWaterPumpProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }); // slate-800
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Pump Group
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Motor (Cylinder)
    const motorGeo = new THREE.CylinderGeometry(2, 2, 6, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.4 }); // blue-500
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-3, 2, 0);
    motor.castShadow = true;
    pumpGroup.add(motor);

    // Pump Body (Volute)
    const voluteGeo = new THREE.TorusGeometry(2.5, 1, 16, 32);
    const voluteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 }); // slate-500
    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    volute.rotation.y = Math.PI / 2;
    volute.position.set(2, 2, 0);
    volute.castShadow = true;
    pumpGroup.add(volute);

    // Connecting Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, 2, 0);
    pumpGroup.add(shaft);

    // Inlet Pipe
    const inletGeo = new THREE.CylinderGeometry(1, 1, 8, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 }); // slate-600
    const inlet = new THREE.Mesh(inletGeo, pipeMat);
    inlet.position.set(2, -2, 0);
    inlet.castShadow = true;
    pumpGroup.add(inlet);

    // Outlet Pipe
    const outletGeo = new THREE.CylinderGeometry(1, 1, 8, 16);
    const outlet = new THREE.Mesh(outletGeo, pipeMat);
    outlet.rotation.x = Math.PI / 2;
    outlet.position.set(2, 4.5, -4);
    outlet.castShadow = true;
    pumpGroup.add(outlet);

    // Base Plate
    const baseGeo = new THREE.BoxGeometry(12, 0.5, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 }); // slate-700
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(-0.5, 0.25, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    pumpGroup.add(base);

    // Water Flow Visualization (Particles inside outlet pipe)
    const flowCount = 200;
    const flowGeo = new THREE.BufferGeometry();
    const flowPos = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount * 3; i += 3) {
      flowPos[i] = 2 + (Math.random() - 0.5) * 1.5; // x (inside pipe)
      flowPos[i + 1] = 4.5 + (Math.random() - 0.5) * 1.5; // y
      flowPos[i + 2] = -Math.random() * 8; // z (moving along pipe)
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
    const flowMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.2, transparent: true, opacity: 0.6 }); // sky-400
    const flowParticles = new THREE.Points(flowGeo, flowMat);
    scene.add(flowParticles);

    // Vibration Sensor (Mounted on motor)
    const sensorGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // emerald-500
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(-3, 4.2, 0);
    pumpGroup.add(sensor);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { pumpStatus, flowRate, vibration, isAlert } = propsRef.current;

      // Rotate shaft if pump is running
      if (pumpStatus !== 2) {
        shaft.rotation.x += flowRate * 0.01;
      }

      // Vibration effect (shake the whole pump group)
      if (pumpStatus !== 2 && vibration > 0) {
        // Intensity based on vibration value (normal ~2, warning ~6, error >10)
        const shakeIntensity = vibration * 0.005;
        pumpGroup.position.x = Math.sin(time * 50) * shakeIntensity;
        pumpGroup.position.y = Math.cos(time * 60) * shakeIntensity;
        pumpGroup.position.z = Math.sin(time * 70) * shakeIntensity;
      } else {
        pumpGroup.position.set(0, 0, 0);
      }

      // Water flow animation
      const positions = flowGeo.attributes.position.array as Float32Array;
      const speed = pumpStatus === 2 ? 0 : flowRate * 0.005; // Speed based on flow rate
      
      for (let i = 2; i < flowCount * 3; i += 3) {
        positions[i] -= speed; // Move along -Z
        if (positions[i] < -8) {
          positions[i] = 0; // Reset to start of outlet pipe
          positions[i - 2] = 2 + (Math.random() - 0.5) * 1.5; // Randomize X
          positions[i - 1] = 4.5 + (Math.random() - 0.5) * 1.5; // Randomize Y
        }
      }
      flowGeo.attributes.position.needsUpdate = true;
      flowMat.opacity = pumpStatus === 2 ? 0 : 0.6; // Hide flow if stopped

      // Status Colors
      if (pumpStatus === 2 || isAlert) {
        motorMat.color.setHex(0xef4444); // Red
        sensorMat.color.setHex(0xef4444);
      } else if (pumpStatus === 1 || vibration > 5) {
        motorMat.color.setHex(0xfacc15); // Yellow
        sensorMat.color.setHex(0xfacc15);
      } else {
        motorMat.color.setHex(0x3b82f6); // Blue
        sensorMat.color.setHex(0x10b981); // Emerald
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
