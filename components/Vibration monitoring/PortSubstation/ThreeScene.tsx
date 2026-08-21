import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortSubstationState } from './three-types';

interface ThreeSceneProps {
  state: PortSubstationState;
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
    camera.position.set(20, 15, 20);

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

    // Transformer Model
    const transformerGroup = new THREE.Group();
    scene.add(transformerGroup);

    // Main Tank
    const tankGeom = new THREE.BoxGeometry(10, 8, 6);
    const tankMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50, shininess: 50 });
    const tank = new THREE.Mesh(tankGeom, tankMat);
    transformerGroup.add(tank);

    // Radiators
    const radiatorGeom = new THREE.BoxGeometry(1, 6, 4);
    const radiatorMat = new THREE.MeshPhongMaterial({ color: 0x34495e });
    for (let i = -6; i <= 6; i += 12) {
      const radiator = new THREE.Mesh(radiatorGeom, radiatorMat);
      radiator.position.set(i, 0, 0);
      transformerGroup.add(radiator);
    }

    // Bushings
    const bushingGeom = new THREE.CylinderGeometry(0.3, 0.5, 3, 16);
    const bushingMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    for (let i = -3; i <= 3; i += 3) {
      const bushing = new THREE.Mesh(bushingGeom, bushingMat);
      bushing.position.set(i, 5.5, 0);
      transformerGroup.add(bushing);
    }

    // Magnetic Field Visualization (Glowing Rings)
    const fieldGroup = new THREE.Group();
    scene.add(fieldGroup);

    const ringGeom = new THREE.TorusGeometry(8, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = (i - 2) * 2;
      fieldGroup.add(ring);
    }

    // Grid
    const grid = new THREE.GridHelper(60, 20, 0x00ffff, 0x002222);
    grid.position.y = -5;
    scene.add(grid);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      const { loadCurrent, coreVibration, magneticFlux } = stateRef.current;

      // Humming Vibration
      transformerGroup.position.y = Math.sin(frame * 100) * coreVibration * 0.05;
      transformerGroup.scale.set(
        1 + Math.sin(frame * 100) * coreVibration * 0.005,
        1 + Math.cos(frame * 100) * coreVibration * 0.005,
        1 + Math.sin(frame * 100) * coreVibration * 0.005
      );

      // Magnetic Field Animation
      fieldGroup.children.forEach((ring, i) => {
        const mesh = ring as THREE.Mesh;
        mesh.scale.setScalar(1 + Math.sin(frame * 2 + i) * 0.1 * magneticFlux);
        (mesh.material as THREE.MeshBasicMaterial).opacity = (0.2 + Math.sin(frame * 2 + i) * 0.1) * magneticFlux;
      });

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
      tankMat.dispose();
      radiatorMat.dispose();
      bushingMat.dispose();
      ringMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
