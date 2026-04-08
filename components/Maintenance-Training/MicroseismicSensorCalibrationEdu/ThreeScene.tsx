import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SensorState } from './three-types';

interface ThreeSceneProps {
  state: SensorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SensorState>(state);

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

    // Calibration Shaker Table Base
    const baseGeo = new THREE.CylinderGeometry(3, 3.5, 2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1;
    scene.add(base);

    // Vibrating Platform
    const platformGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.25;
    scene.add(platform);

    // Microseismic Sensor
    const sensorGroup = new THREE.Group();
    
    const sensorBodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
    const sensorBodyMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6 }); // Cyan sensor
    const sensorBody = new THREE.Mesh(sensorBodyGeo, sensorBodyMat);
    sensorBody.position.y = 0.75;
    sensorGroup.add(sensorBody);

    const sensorCapGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.5, 16);
    const sensorCapMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const sensorCap = new THREE.Mesh(sensorCapGeo, sensorCapMat);
    sensorCap.position.y = 1.75;
    sensorGroup.add(sensorCap);

    // Cable
    const cableGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(1, 2.5, 0),
        new THREE.Vector3(2, 0, 0),
        new THREE.Vector3(4, -1, 0)
      ]),
      20, 0.05, 8, false
    );
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x1c1917 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    sensorGroup.add(cable);

    platform.add(sensorGroup);

    // Seismic Waves (Visual effect)
    const waveGeo = new THREE.RingGeometry(0.5, 0.6, 32);
    const waveMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const waves: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.rotation.x = Math.PI / 2;
      scene.add(wave);
      waves.push(wave);
    }

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Vibration logic
      if (currentState.isCalibrating) {
        // Frequency affects speed of sine wave, amplitude affects height
        const time = Date.now() * 0.001;
        // Map 10-500Hz to a visual speed (scaled down for visibility)
        const visualFreq = currentState.frequency * 0.1; 
        const visualAmp = (currentState.amplitude / 10) * 0.2; // Max 0.2 units displacement
        
        const displacement = Math.sin(time * visualFreq * Math.PI * 2) * visualAmp;
        platform.position.y = 0.25 + displacement;

        // Wave effects
        waves.forEach((wave, index) => {
          const waveTime = (time * 2 + index * 0.33) % 1;
          wave.scale.setScalar(1 + waveTime * 5);
          wave.material.opacity = (1 - waveTime) * 0.5 * (currentState.amplitude / 10);
          wave.position.y = platform.position.y + 0.5;
        });
      } else {
        platform.position.y = 0.25;
        waves.forEach(wave => wave.material.opacity = 0);
      }

      // Slowly rotate scene
      scene.rotation.y += 0.002;

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
