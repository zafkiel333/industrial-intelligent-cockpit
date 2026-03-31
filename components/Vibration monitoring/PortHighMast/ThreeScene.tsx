import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortHighMastState } from './three-types';

interface ThreeSceneProps {
  state: PortHighMastState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvases = containerRef.current.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => canvas.remove());

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02050a);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // High Mast Model
    const mastGroup = new THREE.Group();
    scene.add(mastGroup);

    // Mast Pole
    const poleGeom = new THREE.CylinderGeometry(0.5, 1.5, 30, 32);
    const poleMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.y = 15;
    mastGroup.add(pole);

    // Light Fixtures
    const fixtureGroup = new THREE.Group();
    fixtureGroup.position.y = 30;
    mastGroup.add(fixtureGroup);

    const fixtureGeom = new THREE.TorusGeometry(3, 0.2, 16, 32);
    const fixtureMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const fixtureRing = new THREE.Mesh(fixtureGeom, fixtureMat);
    fixtureRing.rotation.x = Math.PI / 2;
    fixtureGroup.add(fixtureRing);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lightGeom = new THREE.BoxGeometry(1, 0.5, 1);
      const lightMat = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 });
      const light = new THREE.Mesh(lightGeom, lightMat);
      light.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);
      fixtureGroup.add(light);
    }

    // Wind Streamlines (Particles)
    const particleCount = 200;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      velocities[i * 3] = 0.5 + Math.random() * 0.5;
    }

    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.2, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // Grid
    const grid = new THREE.GridHelper(100, 50, 0x00ffff, 0x002222);
    scene.add(grid);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      const { windSpeed, tipDeflection, vortexFrequency } = stateRef.current;

      // Mast Swaying (Vortex Induced)
      const sway = Math.sin(frame * vortexFrequency * 2) * tipDeflection * 0.1;
      mastGroup.rotation.z = sway;
      mastGroup.rotation.x = Math.cos(frame * vortexFrequency * 1.8) * tipDeflection * 0.05;

      // Wind Particles
      const posAttr = particlesGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.array[i * 3] += velocities[i * 3] * windSpeed * 0.1;
        if (posAttr.array[i * 3] > 30) {
          posAttr.array[i * 3] = -30;
          posAttr.array[i * 3 + 1] = Math.random() * 40;
          posAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
      }
      posAttr.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      poleMat.dispose();
      fixtureMat.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
