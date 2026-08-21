import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortConveyorIdlerState } from './three-types';

interface ThreeSceneProps {
  state: PortConveyorIdlerState;
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

    // Idler Model
    const idlerGroup = new THREE.Group();
    scene.add(idlerGroup);

    // Main Roller Body (Cutaway)
    const rollerGeom = new THREE.CylinderGeometry(3, 3, 12, 32, 1, true, 0, Math.PI * 1.5);
    const rollerMat = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      side: THREE.DoubleSide,
      shininess: 100,
    });
    const roller = new THREE.Mesh(rollerGeom, rollerMat);
    roller.rotation.z = Math.PI / 2;
    idlerGroup.add(roller);

    // Shaft
    const shaftGeom = new THREE.CylinderGeometry(0.5, 0.5, 16, 32);
    const shaftMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    idlerGroup.add(shaft);

    // Bearings
    const bearingGeom = new THREE.TorusGeometry(1, 0.4, 16, 32);
    const bearingMat = new THREE.MeshPhongMaterial({ color: 0xbdc3c7 });
    
    const leftBearing = new THREE.Mesh(bearingGeom, bearingMat);
    leftBearing.position.x = -5;
    leftBearing.rotation.y = Math.PI / 2;
    idlerGroup.add(leftBearing);

    const rightBearing = new THREE.Mesh(bearingGeom, bearingMat);
    rightBearing.position.x = 5;
    rightBearing.rotation.y = Math.PI / 2;
    idlerGroup.add(rightBearing);

    // Fault Glow (Heatmap)
    const faultGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const faultMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
    });
    const faultGlow = new THREE.Mesh(faultGeom, faultMat);
    faultGlow.position.x = -5;
    idlerGroup.add(faultGlow);

    // Grid
    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x002222);
    grid.position.y = -6;
    scene.add(grid);

    // Animation Loop
    let rotationAngle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      const { rotationSpeed, bearingHealth } = stateRef.current;

      // Rotation
      rotationAngle += (rotationSpeed / 60) * 0.1;
      roller.rotation.y = rotationAngle;
      leftBearing.rotation.z = rotationAngle;
      rightBearing.rotation.z = rotationAngle;

      // Fault Visualization
      const faultLevel = 1 - bearingHealth / 100;
      faultMat.opacity = Math.sin(Date.now() * 0.01) * 0.3 * faultLevel + 0.2 * faultLevel;
      faultGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);

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
      rollerMat.dispose();
      shaftMat.dispose();
      bearingMat.dispose();
      faultMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
