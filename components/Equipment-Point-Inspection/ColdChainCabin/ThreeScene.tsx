import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ColdChainCabinProps } from './three-types';

export const ThreeScene: React.FC<ColdChainCabinProps> = (props) => {
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
    camera.position.set(0, 5, 25);

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
    
    // Cold blue light inside the cabin
    const cabinLight = new THREE.PointLight(0x38bdf8, 1.5, 30); // sky-400
    cabinLight.position.set(0, 5, 0);
    scene.add(cabinLight);

    // Cabin Structure (Wireframe/Glass look)
    const cabinGeo = new THREE.BoxGeometry(20, 10, 15);
    const cabinMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, // sky-500
      transparent: true, 
      opacity: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    scene.add(cabin);

    const edges = new THREE.EdgesGeometry(cabinGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const cabinEdges = new THREE.LineSegments(edges, lineMat);
    scene.add(cabinEdges);

    // Cargo Boxes (Pallets)
    const cargoGroup = new THREE.Group();
    scene.add(cargoGroup);

    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }); // slate-400

    for (let x = -7; x <= 7; x += 3) {
      for (let z = -5; z <= 5; z += 3) {
        // Stack 2 high
        for (let y = -4; y <= -2; y += 2.1) {
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(x, y, z);
          cargoGroup.add(box);
        }
      }
    }

    // Cooling Units (Evaporators) on ceiling
    const coolerGeo = new THREE.BoxGeometry(4, 1, 3);
    const coolerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }); // slate-500
    
    const cooler1 = new THREE.Mesh(coolerGeo, coolerMat);
    cooler1.position.set(-5, 4.5, 0);
    scene.add(cooler1);
    
    const cooler2 = new THREE.Mesh(coolerGeo, coolerMat);
    cooler2.position.set(5, 4.5, 0);
    scene.add(cooler2);

    // Cold Air Particles
    const particleCount = 1500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 18; // x
      particlePos[i + 1] = Math.random() * 10 - 5; // y
      particlePos[i + 2] = (Math.random() - 0.5) * 13; // z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    // Create a circular texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.arc(8, 8, 8, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({ 
      color: 0x7dd3fc, // sky-300
      size: 0.15, 
      transparent: true, 
      opacity: 0.6,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Temperature Sensor Indicator
    const sensorGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // emerald-500
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0, 0, 7.5); // Front wall
    scene.add(sensor);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { temperature, humidity, compressorStatus, isAlert } = propsRef.current;

      // Rotate scene slowly
      scene.rotation.y = Math.sin(time * 0.1) * 0.2;

      // Update particles (Cold air falling)
      const positions = particleGeo.attributes.position.array as Float32Array;
      // Speed depends on compressor status (0: normal, 1: slow, 2: stopped)
      const fallSpeed = compressorStatus === 0 ? 0.05 : compressorStatus === 1 ? 0.02 : 0;
      
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= fallSpeed;
        // Add slight horizontal drift based on humidity
        positions[i-1] += Math.sin(time + i) * 0.01 * (humidity / 50);
        
        if (positions[i] < -5) {
          positions[i] = 5; // Reset to top
          positions[i-1] = (Math.random() - 0.5) * 18; // Randomize X
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Visual feedback based on temperature
      // Normal: -20 to -18. Warning: > -18. Error: > -15
      if (temperature > -15 || isAlert) {
        cabinLight.color.setHex(0xef4444); // Red
        lineMat.color.setHex(0xef4444);
        particleMat.color.setHex(0xfca5a5); // red-300
        sensorMat.color.setHex(0xef4444);
      } else if (temperature > -18 || compressorStatus === 1) {
        cabinLight.color.setHex(0xfacc15); // Yellow
        lineMat.color.setHex(0xfacc15);
        particleMat.color.setHex(0xfde047); // yellow-300
        sensorMat.color.setHex(0xfacc15);
      } else {
        cabinLight.color.setHex(0x38bdf8); // Sky blue
        lineMat.color.setHex(0x38bdf8);
        particleMat.color.setHex(0x7dd3fc);
        sensorMat.color.setHex(0x10b981); // Emerald sensor
      }

      // Pulse sensor
      sensor.scale.setScalar(1 + Math.sin(time * 5) * 0.2);

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
