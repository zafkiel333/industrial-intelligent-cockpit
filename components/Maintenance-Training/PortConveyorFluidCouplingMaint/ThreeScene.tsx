import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FluidCouplingState } from './three-types';

interface ThreeSceneProps {
  state: FluidCouplingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<FluidCouplingState>(state);

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

    // Motor (Left)
    const motorGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.5 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-3.5, 0, 0);
    scene.add(motor);

    // Gearbox (Right)
    const gearboxGeo = new THREE.BoxGeometry(3, 3, 3);
    const gearboxMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    const gearbox = new THREE.Mesh(gearboxGeo, gearboxMat);
    gearbox.position.set(3.5, 0, 0);
    scene.add(gearbox);

    // Fluid Coupling (Center)
    const couplingGroup = new THREE.Group();
    
    // Outer Casing (Transparent)
    const casingGeo = new THREE.SphereGeometry(2, 32, 32);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3, metalness: 0.8 });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    couplingGroup.add(casing);

    // Pump Impeller (Connected to Motor)
    const pumpGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.5, 32);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.rotation.z = Math.PI / 2;
    pump.position.set(-0.5, 0, 0);
    couplingGroup.add(pump);

    // Turbine Runner (Connected to Gearbox)
    const turbineGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.5, 32);
    const turbineMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.7 });
    const turbine = new THREE.Mesh(turbineGeo, turbineMat);
    turbine.rotation.z = Math.PI / 2;
    turbine.position.set(0.5, 0, 0);
    couplingGroup.add(turbine);

    // Fusible Plug
    const plugGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
    const plugMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
    const plug = new THREE.Mesh(plugGeo, plugMat);
    plug.position.set(0, 1.9, 0);
    couplingGroup.add(plug);

    scene.add(couplingGroup);

    // Oil Particles
    const oilGeo = new THREE.BufferGeometry();
    const oilCount = 500;
    const oilPos = new Float32Array(oilCount * 3);
    for (let i = 0; i < oilCount * 3; i++) {
      oilPos[i] = (Math.random() - 0.5) * 1; // x
      oilPos[i + 1] = (Math.random() - 0.5) * 3.5; // y
      oilPos[i + 2] = (Math.random() - 0.5) * 3.5; // z
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    const oilMat = new THREE.PointsMaterial({ color: 0xeab308, size: 0.1, transparent: true, opacity: 0.8 });
    const oilParticles = new THREE.Points(oilGeo, oilMat);
    couplingGroup.add(oilParticles);

    // Steam/Smoke Particles for blown plug
    const smokeGeo = new THREE.BufferGeometry();
    const smokeCount = 100;
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount * 3; i++) {
      smokePos[i] = 0;
      smokePos[i + 1] = 2;
      smokePos[i + 2] = 0;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.5 });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokeParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotation logic
      if (currentState.isRunning) {
        const motorRps = currentState.motorSpeed / 60;
        pump.rotation.x += motorRps * 0.1;

        // Slip calculation based on oil level
        // If oil is 100%, slip is ~3%. If oil is 50%, slip is huge.
        const slip = 1 - (currentState.oilLevel / 100);
        const turbineRps = motorRps * (1 - slip * 0.8); // Simplified slip model
        turbine.rotation.x += turbineRps * 0.1;

        // Oil particles rotation
        oilParticles.rotation.x += motorRps * 0.05;
      }

      // Oil level visualization (hide particles if low oil)
      const visibleOilCount = Math.floor((currentState.oilLevel / 100) * oilCount);
      oilGeo.setDrawRange(0, visibleOilCount);

      // Temperature color effect on casing
      if (currentState.temperature > 90) {
        casingMat.color.setHex(0xef4444); // Reddish
        casingMat.opacity = 0.5;
      } else {
        casingMat.color.setHex(0x94a3b8);
        casingMat.opacity = 0.3;
      }

      // Fusible plug blown animation
      if (currentState.fusiblePlugBlown) {
        plug.visible = false;
        smokeParticles.visible = true;
        const positions = smokeGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          positions[i * 3 + 1] += 0.05; // Move up
          positions[i * 3] += (Math.random() - 0.5) * 0.1;
          positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
          if (positions[i * 3 + 1] > 6) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 2;
            positions[i * 3 + 2] = 0;
          }
        }
        smokeGeo.attributes.position.needsUpdate = true;
      } else {
        plug.visible = true;
        smokeParticles.visible = false;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.2;

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
