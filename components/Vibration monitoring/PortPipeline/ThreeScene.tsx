import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortPipelineState } from './three-types';

interface ThreeSceneProps {
  state: PortPipelineState;
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(30, 20, 30);

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

    // Pipeline Network
    const pipeGroup = new THREE.Group();
    scene.add(pipeGroup);

    const pipeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
    });

    // Main Pipe
    const mainPipeGeom = new THREE.CylinderGeometry(2, 2, 40, 32);
    const mainPipe = new THREE.Mesh(mainPipeGeom, pipeMaterial);
    mainPipe.rotation.z = Math.PI / 2;
    pipeGroup.add(mainPipe);

    // Branch Pipes
    const branchGeom = new THREE.CylinderGeometry(1.5, 1.5, 15, 32);
    for (let i = -15; i <= 15; i += 15) {
      const branch = new THREE.Mesh(branchGeom, pipeMaterial);
      branch.position.set(i, 7.5, 0);
      pipeGroup.add(branch);
      
      // Elbows (Simplified)
      const elbowGeom = new THREE.TorusGeometry(2, 1.5, 16, 32, Math.PI / 2);
      const elbow = new THREE.Mesh(elbowGeom, pipeMaterial);
      elbow.position.set(i, 0, 0);
      elbow.rotation.z = -Math.PI / 2;
      pipeGroup.add(elbow);
    }

    // Valves
    const valveGeom = new THREE.BoxGeometry(4, 4, 4);
    const valveMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
    const valve = new THREE.Mesh(valveGeom, valveMaterial);
    valve.position.set(0, 0, 0);
    pipeGroup.add(valve);

    // Particles (Fluid Flow)
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      particleVelocities[i] = 0.1 + Math.random() * 0.2;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Grid
    const grid = new THREE.GridHelper(100, 20, 0x00ffff, 0x002222);
    grid.position.y = -10;
    scene.add(grid);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      const { flowVelocity, pressurePulsation, valveStatus } = stateRef.current;

      // Particle Movement
      const positions = particles.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        if (valveStatus === 'OPEN') {
          positions[i * 3] += flowVelocity * 0.1;
          if (positions[i * 3] > 20) positions[i * 3] = -20;
        }
        
        // Add some jitter based on pressure pulsation
        positions[i * 3 + 1] += (Math.random() - 0.5) * pressurePulsation * 0.05;
        positions[i * 3 + 2] += (Math.random() - 0.5) * pressurePulsation * 0.05;
      }
      particles.attributes.position.needsUpdate = true;

      // Pipe Vibration
      pipeGroup.position.y = Math.sin(frame * 20) * pressurePulsation * 0.1;
      pipeGroup.rotation.x = Math.cos(frame * 15) * pressurePulsation * 0.01;

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
      pipeMaterial.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
