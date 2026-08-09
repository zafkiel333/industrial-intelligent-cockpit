import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortCarbonSimulationProps } from './three-types';

export const ThreeScene: React.FC<PortCarbonSimulationProps> = ({ windSpeed, emissionLevel }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ windSpeed, emissionLevel });

  useEffect(() => {
    propsRef.current = { windSpeed, emissionLevel };
  }, [windSpeed, emissionLevel]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x10b981, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Ocean
    const oceanGeo = new THREE.PlaneGeometry(50, 50, 10, 10);
    const oceanMat = new THREE.MeshPhongMaterial({ color: '#0369a1', wireframe: true });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    // Wind Turbines
    const turbines: THREE.Group[] = [];
    for(let i=0; i<3; i++) {
      const turbine = new THREE.Group();
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 10), new THREE.MeshPhongMaterial({ color: '#e2e8f0' }));
      mast.position.y = 5;
      turbine.add(mast);
      
      const rotor = new THREE.Group();
      rotor.position.y = 10;
      rotor.position.z = 0.5;
      for(let j=0; j<3; j++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.1), new THREE.MeshPhongMaterial({ color: '#e2e8f0' }));
        blade.position.y = 2;
        const pivot = new THREE.Group();
        pivot.rotation.z = (j * Math.PI * 2) / 3;
        pivot.add(blade);
        rotor.add(pivot);
      }
      turbine.add(rotor);
      turbine.position.set(-10 + i*10, 0, -10);
      scene.add(turbine);
      turbines.push(rotor);
    }

    // Ship
    const ship = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 10), new THREE.MeshPhongMaterial({ color: '#475569' }));
    hull.position.y = 1;
    ship.add(hull);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2), new THREE.MeshPhongMaterial({ color: '#334155' }));
    stack.position.set(0, 3, -2);
    ship.add(stack);
    scene.add(ship);

    // Particles (Emissions)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 2;
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.2, color: '#94a3b8', transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;

      const currentProps = propsRef.current;

      // Rotate turbines based on wind speed
      turbines.forEach(rotor => {
        rotor.rotation.z -= currentProps.windSpeed * 0.01;
      });

      // Ship bobbing
      ship.position.y = Math.sin(time * 2) * 0.2;
      ship.rotation.z = Math.sin(time * 1.5) * 0.05;

      // Update particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
        // Move up and back
        positions[i*3 + 1] += 0.05; // y
        positions[i*3 + 2] += 0.02; // z
        
        // Reset if too high or based on emission level
        if (positions[i*3 + 1] > 5 || Math.random() > currentProps.emissionLevel) {
          positions[i*3] = ship.position.x + (Math.random() - 0.5);
          positions[i*3 + 1] = ship.position.y + 4;
          positions[i*3 + 2] = ship.position.z - 2 + (Math.random() - 0.5);
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particleMat.opacity = currentProps.emissionLevel * 0.8;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
