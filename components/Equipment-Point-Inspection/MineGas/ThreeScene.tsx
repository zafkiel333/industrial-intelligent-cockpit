import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MineGasProps } from './three-types';

export const ThreeScene: React.FC<MineGasProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    scene.fog = new THREE.FogExp2('#050505', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffaa00, 2, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Mine Tunnel Structure
    const tunnelGroup = new THREE.Group();
    
    // Tunnel walls (cylinder)
    const tunnelGeo = new THREE.CylinderGeometry(10, 10, 60, 16, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x222222, 
      roughness: 0.9, 
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = Math.PI / 2;
    tunnelGroup.add(tunnel);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    tunnelGroup.add(floor);

    // Sensor Nodes
    const sensorGeo = new THREE.BoxGeometry(1, 1, 1);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x444444, emissive: 0x000000 });
    
    const sensor1 = new THREE.Mesh(sensorGeo, sensorMat);
    sensor1.position.set(-8, 0, -10);
    tunnelGroup.add(sensor1);

    const sensor2 = new THREE.Mesh(sensorGeo, sensorMat);
    sensor2.position.set(8, 0, 10);
    tunnelGroup.add(sensor2);

    scene.add(tunnelGroup);

    // Gas Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 18; // x
      posArray[i+1] = (Math.random() - 0.5) * 10; // y
      posArray[i+2] = (Math.random() - 0.5) * 60; // z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x00ff00, // Default green for safe
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const { methaneLevel, coLevel, ventilationSpeed, isAlert } = propsRef.current;

      // Gas flow animation (affected by ventilation)
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for(let i = 2; i < particleCount * 3; i += 3) {
        pPositions[i] += (ventilationSpeed / 100) * 0.5;
        if (pPositions[i] > 30) {
          pPositions[i] = -30;
          pPositions[i-2] = (Math.random() - 0.5) * 18; // reset x
          pPositions[i-1] = (Math.random() - 0.5) * 10; // reset y
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Gas visualization
      const totalGas = methaneLevel + coLevel;
      particleMat.opacity = Math.min((totalGas / 100) * 0.8 + 0.1, 0.9);
      
      if (isAlert) {
        particleMat.color.setHex(0xff0000); // Danger red
        pointLight.color.setHex(0xff0000);
        sensorMat.emissive.setHex(0xff0000);
      } else if (totalGas > 40) {
        particleMat.color.setHex(0xffff00); // Warning yellow
        pointLight.color.setHex(0xffff00);
        sensorMat.emissive.setHex(0xffff00);
      } else {
        particleMat.color.setHex(0x00ff00); // Normal green
        pointLight.color.setHex(0x00ff00);
        sensorMat.emissive.setHex(0x00ff00);
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
