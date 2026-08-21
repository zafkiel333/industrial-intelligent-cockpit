import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ShipSeparatorState } from './three-types';

interface ThreeSceneProps {
  state: ShipSeparatorState;
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
    camera.position.set(15, 15, 15);

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

    // Separator Model
    const separatorGroup = new THREE.Group();
    scene.add(separatorGroup);

    // Outer Housing (Transparent)
    const housingGeom = new THREE.CylinderGeometry(5, 5, 12, 32);
    const housingMat = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const housing = new THREE.Mesh(housingGeom, housingMat);
    separatorGroup.add(housing);

    // Rotating Bowl
    const bowlGroup = new THREE.Group();
    separatorGroup.add(bowlGroup);

    const bowlGeom = new THREE.CylinderGeometry(4, 3, 8, 32);
    const bowlMat = new THREE.MeshPhongMaterial({
      color: 0x34495e,
      shininess: 100,
    });
    const bowl = new THREE.Mesh(bowlGeom, bowlMat);
    bowlGroup.add(bowl);

    // Discs inside bowl (Simplified)
    const discGeom = new THREE.CylinderGeometry(3.8, 3.8, 0.1, 32);
    const discMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    for (let i = -3; i < 3; i += 0.5) {
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.position.y = i;
      bowlGroup.add(disc);
    }

    // Unbalance Vector Visualization
    const vectorGeom = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const vectorMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const vector = new THREE.Mesh(vectorGeom, vectorMat);
    vector.rotation.z = Math.PI / 2;
    vector.position.y = 5;
    bowlGroup.add(vector);

    // Grid
    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x002222);
    grid.position.y = -6;
    scene.add(grid);

    // Animation Loop
    let rotationAngle = 0;
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      const { rpm, unbalanceX, unbalanceY, vibrationIntensity } = stateRef.current;

      // Rotation
      rotationAngle += (rpm / 60) * 0.1;
      bowlGroup.rotation.y = rotationAngle;

      // Unbalance Vector Update
      vector.position.x = unbalanceX * 2;
      vector.position.z = unbalanceY * 2;
      vector.scale.y = Math.sqrt(unbalanceX**2 + unbalanceY**2) * 5 + 0.1;

      // Vibration Effect
      separatorGroup.position.x = Math.sin(frame * 50) * vibrationIntensity * 0.2;
      separatorGroup.position.z = Math.cos(frame * 45) * vibrationIntensity * 0.2;

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
      housingMat.dispose();
      bowlMat.dispose();
      discMat.dispose();
      vectorMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
