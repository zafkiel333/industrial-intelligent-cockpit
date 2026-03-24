import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FillingOperationAreaProps } from './three-types';

export const ThreeScene: React.FC<FillingOperationAreaProps> = (props) => {
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
    scene.fog = new THREE.FogExp2('#0f172a', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Environment (Stope / Mined-out area)
    const stopeGeo = new THREE.BoxGeometry(40, 20, 40);
    const stopeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, side: THREE.BackSide });
    const stope = new THREE.Mesh(stopeGeo, stopeMat);
    stope.position.y = 10;
    scene.add(stope);

    // Filling Pipeline
    const pipeGroup = new THREE.Group();
    
    // Vertical pipe
    const vPipeGeo = new THREE.CylinderGeometry(1, 1, 15, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.2 });
    const vPipe = new THREE.Mesh(vPipeGeo, pipeMat);
    vPipe.position.set(0, 12.5, 0);
    pipeGroup.add(vPipe);

    // Horizontal pipe
    const hPipeGeo = new THREE.CylinderGeometry(1, 1, 20, 16);
    const hPipe = new THREE.Mesh(hPipeGeo, pipeMat);
    hPipe.rotation.z = Math.PI / 2;
    hPipe.position.set(-10, 20, 0);
    pipeGroup.add(hPipe);

    // Elbow joint
    const elbowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const elbow = new THREE.Mesh(elbowGeo, pipeMat);
    elbow.position.set(0, 20, 0);
    pipeGroup.add(elbow);

    scene.add(pipeGroup);

    // Slurry (Filling material)
    const slurryGeo = new THREE.BoxGeometry(38, 1, 38);
    // Use a custom shader material for slurry flow effect
    const slurryMat = new THREE.MeshStandardMaterial({ 
      color: 0x78716c, // stone-500
      roughness: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const slurry = new THREE.Mesh(slurryGeo, slurryMat);
    slurry.position.y = 0.5;
    scene.add(slurry);

    // Flowing particles from pipe
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 1.5;
      particlePos[i + 1] = Math.random() * 5 + 5;
      particlePos[i + 2] = (Math.random() - 0.5) * 1.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.4, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Pressure Sensor on pipe
    const sensorGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0, 15, 0);
    pipeGroup.add(sensor);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { slurryConcentration, pipelinePressure, flowRate, isAlert } = propsRef.current;

      // Slurry rising animation
      // Assuming max height is 15
      const targetHeight = (slurryConcentration / 100) * 10; // Just a visual representation
      slurry.scale.y = targetHeight || 0.1;
      slurry.position.y = (targetHeight / 2) || 0.05;

      // Particle flow animation
      const positions = particleGeo.attributes.position.array as Float32Array;
      const speed = (flowRate / 100) * 0.5; // Flow rate affects speed
      
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= speed;
        if (positions[i] < slurry.position.y + targetHeight / 2) {
          positions[i] = 5; // Reset to bottom of pipe
          positions[i-1] = (Math.random() - 0.5) * 1.5; // Random X
          positions[i+1] = (Math.random() - 0.5) * 1.5; // Random Z
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Slurry color based on concentration (thicker = darker)
      const concRatio = slurryConcentration / 80;
      slurryMat.color.setHSL(0.1, 0.1, 0.6 - (concRatio * 0.3));
      particleMat.color.copy(slurryMat.color);

      // Sensor color based on pressure
      if (isAlert) {
        sensorMat.color.setHex(0xef4444);
        sensorMat.emissive.setHex(0xb91c1c);
        // Pipe vibration
        pipeGroup.position.x = Math.sin(time * 20) * 0.1;
      } else {
        sensorMat.color.setHex(0x3b82f6);
        sensorMat.emissive.setHex(0x1d4ed8);
        pipeGroup.position.x = 0;
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
