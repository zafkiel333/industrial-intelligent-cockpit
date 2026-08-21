import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FanCoilState } from './three-types';

interface ThreeSceneProps {
  state: FanCoilState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<FanCoilState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Fan Coil Unit Model (Abstract)
    const unitGroup = new THREE.Group();
    scene.add(unitGroup);

    // Casing
    const casingGeom = new THREE.BoxGeometry(6, 4, 3);
    const casingMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      transparent: true, 
      opacity: 0.4,
      wireframe: true 
    });
    const casing = new THREE.Mesh(casingGeom, casingMat);
    unitGroup.add(casing);

    // Internal Fan
    const fanGroup = new THREE.Group();
    unitGroup.add(fanGroup);

    const hubGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.x = Math.PI / 2;
    fanGroup.add(hub);

    const bladeGeom = new THREE.BoxGeometry(0.1, 3, 0.8);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.rotation.z = (i * Math.PI) / 2;
      fanGroup.add(blade);
    }

    // Vibration Sensors (Glow dots)
    const sensorGeom = new THREE.SphereGeometry(0.1, 8, 8);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const sensorPositions = [
      [2.8, 1.8, 1.3], [-2.8, 1.8, 1.3], [2.8, -1.8, 1.3], [-2.8, -1.8, 1.3]
    ];
    sensorPositions.forEach(pos => {
      const sensor = new THREE.Mesh(sensorGeom, sensorMat);
      sensor.position.set(pos[0], pos[1], pos[2]);
      unitGroup.add(sensor);
    });

    // Animation
    let rotationAngle = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const { fanSpeed, vibrationIntensity, isAbnormal } = stateRef.current;
      
      // Rotate Fan
      const rotSpeed = (fanSpeed / 60) * (Math.PI * 2) * 0.016;
      rotationAngle += rotSpeed;
      fanGroup.rotation.z = rotationAngle;

      // Vibration Effect
      if (vibrationIntensity > 0) {
        const shake = Math.sin(Date.now() * 0.1) * vibrationIntensity * 0.05;
        unitGroup.position.set(shake, shake * 0.5, shake * 0.2);
        
        if (isAbnormal) {
          sensorMat.color.setHex(0xff0000);
        } else {
          sensorMat.color.setHex(0x00ffff);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }

      // Cleanup scene
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" id="fancoil-3d-container" />;
};
