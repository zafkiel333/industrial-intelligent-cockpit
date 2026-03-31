import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ShipWaterMakerState } from './three-types';

interface ThreeSceneProps {
  state: ShipWaterMakerState;
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
    camera.position.set(15, 10, 15);

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
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Pump Model
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Pump Body
    const bodyGeom = new THREE.BoxGeometry(8, 4, 4);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    pumpGroup.add(body);

    // Plungers (Reciprocating)
    const plungerGroup = new THREE.Group();
    pumpGroup.add(plungerGroup);

    const plungerGeom = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
    const plungerMat = new THREE.MeshPhongMaterial({ color: 0xbdc3c7, shininess: 100 });
    
    const plungers: THREE.Mesh[] = [];
    for (let i = -2; i <= 2; i += 2) {
      const plunger = new THREE.Mesh(plungerGeom, plungerMat);
      plunger.rotation.x = Math.PI / 2;
      plunger.position.set(i, 0, 2);
      plungerGroup.add(plunger);
      plungers.push(plunger);
    }

    // High Pressure Manifold
    const manifoldGeom = new THREE.CylinderGeometry(0.8, 0.8, 8, 32);
    const manifold = new THREE.Mesh(manifoldGeom, bodyMat);
    manifold.rotation.z = Math.PI / 2;
    manifold.position.set(0, 0, 4);
    pumpGroup.add(manifold);

    // Grid
    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x002222);
    grid.position.y = -4;
    scene.add(grid);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      const { pumpRpm, vibrationLevel } = stateRef.current;

      // Reciprocating Motion
      const speed = (pumpRpm / 60) * 0.5;
      plungers.forEach((p, i) => {
        p.position.z = 2 + Math.sin(frame * speed * 10 + i * Math.PI / 2) * 1.5;
      });

      // Vibration
      pumpGroup.position.y = Math.sin(frame * 100) * vibrationLevel * 0.1;
      pumpGroup.position.x = Math.cos(frame * 95) * vibrationLevel * 0.1;

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
      bodyMat.dispose();
      plungerMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
