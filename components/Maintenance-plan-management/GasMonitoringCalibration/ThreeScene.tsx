import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GasMonitoringCalibrationProps } from './three-types';

export const ThreeScene: React.FC<GasMonitoringCalibrationProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 5, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const sensorGroup = new THREE.Group();

    // Sensor Body
    const bodyGeo = new THREE.BoxGeometry(2, 3, 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    sensorGroup.add(body);

    // Display Screen
    const screenGeo = new THREE.PlaneGeometry(1.5, 1);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.5, 1.01);
    sensorGroup.add(screen);

    // Sensor Head (Probe)
    const probeGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.9, roughness: 0.1 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.y = -2;
    sensorGroup.add(probe);

    // Gas Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const particlePos = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount; i++) {
      particlePos[i*3] = (Math.random() - 0.5) * 10;
      particlePos[i*3+1] = -5 + Math.random() * 5;
      particlePos[i*3+2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Calibration Hood
    const hoodGeo = new THREE.CylinderGeometry(1, 1, 2, 32, 1, true);
    const hoodMat = new THREE.MeshStandardMaterial({ 
      color: 0xffaa00, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.y = -2;
    hood.visible = false;
    sensorGroup.add(hood);

    scene.add(sensorGroup);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { gasLevel, isCalibrating, accuracy } = propsRef.current;

      if (isCalibrating) {
        // Calibration mode: hood is on, particles are orange (standard gas)
        hood.visible = true;
        particleMat.color.setHex(0xffaa00);
        
        // Screen flashes green when accurate
        if (accuracy > 98) {
          screenMat.color.setHex(0x00ff00);
        } else {
          screenMat.color.setHex(0xffaa00);
        }
        
        // Particles move inside hood
        const positions = particleGeo.attributes.position.array as Float32Array;
        for(let i = 0; i < particleCount; i++) {
          positions[i*3] = (Math.random() - 0.5) * 1.5;
          positions[i*3+1] = -3 + Math.random() * 2;
          positions[i*3+2] = (Math.random() - 0.5) * 1.5;
        }
        particleGeo.attributes.position.needsUpdate = true;

      } else {
        // Normal mode: hood off, particles are cyan/red based on gas level
        hood.visible = false;
        
        const gasColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), gasLevel / 2); // Assuming 2% is high
        particleMat.color.copy(gasColor);
        
        if (gasLevel > 1.0) {
          screenMat.color.setHex(0xff0000); // Alarm
        } else {
          screenMat.color.setHex(0x000000); // Normal
        }

        // Particles float around
        const positions = particleGeo.attributes.position.array as Float32Array;
        for(let i = 0; i < particleCount; i++) {
          positions[i*3+1] += delta * 0.5; // Float up
          if (positions[i*3+1] > 2) {
            positions[i*3+1] = -5;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // Sensor bobbing
      sensorGroup.position.y = Math.sin(time) * 0.2;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      probeGeo.dispose();
      probeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      hoodGeo.dispose();
      hoodMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
