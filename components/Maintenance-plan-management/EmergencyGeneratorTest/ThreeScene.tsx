import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmergencyGeneratorTestProps } from './three-types';

export const ThreeScene: React.FC<EmergencyGeneratorTestProps> = (props) => {
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
    scene.background = new THREE.Color(0x1a1505); // Dark amber

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Generator Body
    const genGroup = new THREE.Group();
    scene.add(genGroup);

    const bodyGeo = new THREE.BoxGeometry(12, 6, 5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334433, metalness: 0.7, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 3;
    genGroup.add(body);

    // Alternator
    const altGeo = new THREE.CylinderGeometry(2.5, 2.5, 4, 32);
    altGeo.rotateZ(Math.PI / 2);
    const altMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const alternator = new THREE.Mesh(altGeo, altMat);
    alternator.position.set(-8, 3, 0);
    genGroup.add(alternator);

    // Cooling Fan
    const fanGroup = new THREE.Group();
    fanGroup.position.set(6.1, 3, 0);
    genGroup.add(fanGroup);

    const fanCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    fanCenter.rotateZ(Math.PI / 2);
    fanGroup.add(fanCenter);

    for (let i = 0; i < 6; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.1, 4, 0.5);
      const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
      blade.position.y = 2;
      
      const pivot = new THREE.Group();
      pivot.rotation.x = (i * Math.PI * 2) / 6;
      pivot.add(blade);
      fanGroup.add(pivot);
    }

    // Exhaust Pipe
    const pipeGeo = new THREE.CylinderGeometry(0.4, 0.4, 4, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(4, 8, 0);
    genGroup.add(pipe);

    // Heat Glow Light
    const heatLight = new THREE.PointLight(0xff3300, 0, 15);
    heatLight.position.set(0, 4, 3);
    genGroup.add(heatLight);

    // Exhaust Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = 4 + (Math.random() - 0.5) * 0.5; // X
      particlePos[i * 3 + 1] = 10 + Math.random() * 5; // Y
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x444444, size: 0.5, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { loadPercentage, rpm, isTesting } = propsRef.current;

      if (isTesting || rpm > 0) {
        // Rotate fan
        fanGroup.rotation.x += (rpm / 60) * Math.PI * 2 * delta;

        // Engine vibration
        const vib = (loadPercentage / 100) * 0.05;
        genGroup.position.x = (Math.random() - 0.5) * vib;
        genGroup.position.y = (Math.random() - 0.5) * vib;
        genGroup.position.z = (Math.random() - 0.5) * vib;

        // Heat glow based on load
        heatLight.intensity = (loadPercentage / 100) * 5;

        // Exhaust particles
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += (loadPercentage / 20) * delta; // Rise speed
          positions[i * 3] += (Math.random() - 0.5) * 0.1; // Spread X
          positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1; // Spread Z

          if (positions[i * 3 + 1] > 15) {
            positions[i * 3] = 4 + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
        
        // Particle opacity based on load
        particleMat.opacity = 0.2 + (loadPercentage / 100) * 0.6;
        particles.visible = true;
      } else {
        genGroup.position.set(0, 0, 0);
        heatLight.intensity = 0;
        particles.visible = false;
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
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      altGeo.dispose();
      altMat.dispose();
      pipeGeo.dispose();
      pipeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
