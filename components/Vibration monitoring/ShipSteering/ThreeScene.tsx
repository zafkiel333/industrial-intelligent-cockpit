import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ShipSteeringState } from './three-types';

interface ThreeSceneProps {
  state: ShipSteeringState;
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

    // Steering Gear Model
    const steeringGroup = new THREE.Group();
    scene.add(steeringGroup);

    // Rudder Stock (Vertical Axis)
    const stockGeom = new THREE.CylinderGeometry(1, 1, 15, 32);
    const stockMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const stock = new THREE.Mesh(stockGeom, stockMat);
    steeringGroup.add(stock);

    // Tiller (Horizontal Arm)
    const tillerGeom = new THREE.BoxGeometry(12, 1, 2);
    const tillerMat = new THREE.MeshPhongMaterial({ color: 0x34495e });
    const tiller = new THREE.Mesh(tillerGeom, tillerMat);
    tiller.position.y = 0;
    steeringGroup.add(tiller);

    // Hydraulic Rams (Simplified)
    const ramGroup = new THREE.Group();
    steeringGroup.add(ramGroup);

    const cylinderGeom = new THREE.CylinderGeometry(1.2, 1.2, 8, 32);
    const cylinderMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    
    const pistonGeom = new THREE.CylinderGeometry(0.8, 0.8, 8, 32);
    const pistonMat = new THREE.MeshPhongMaterial({ color: 0xbdc3c7, shininess: 100 });

    // Left Ram
    const leftCylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
    leftCylinder.rotation.z = Math.PI / 2;
    leftCylinder.position.set(-8, 0, 4);
    ramGroup.add(leftCylinder);

    const leftPiston = new THREE.Mesh(pistonGeom, pistonMat);
    leftPiston.rotation.z = Math.PI / 2;
    leftPiston.position.set(-4, 0, 4);
    ramGroup.add(leftPiston);

    // Right Ram
    const rightCylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
    rightCylinder.rotation.z = Math.PI / 2;
    rightCylinder.position.set(8, 0, -4);
    ramGroup.add(rightCylinder);

    const rightPiston = new THREE.Mesh(pistonGeom, pistonMat);
    rightPiston.rotation.z = Math.PI / 2;
    rightPiston.position.set(4, 0, -4);
    ramGroup.add(rightPiston);

    // Hydraulic Fluid Lines (Glowing Curves)
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-8, 0, 4),
      new THREE.Vector3(-10, 5, 0),
      new THREE.Vector3(-5, 8, -5)
    );
    const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
    const tube = new THREE.Mesh(tubeGeom, tubeMat);
    scene.add(tube);

    // Grid
    const grid = new THREE.GridHelper(60, 20, 0x00ffff, 0x002222);
    grid.position.y = -8;
    scene.add(grid);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      const { rudderAngle, hydraulicPressure, impactForce } = stateRef.current;

      // Rudder Rotation
      const targetRotation = (rudderAngle * Math.PI) / 180;
      steeringGroup.rotation.y = THREE.MathUtils.lerp(steeringGroup.rotation.y, targetRotation, 0.1);

      // Piston Movement (Inverse to rotation)
      const pistonOffset = Math.sin(steeringGroup.rotation.y) * 4;
      leftPiston.position.x = -4 + pistonOffset;
      rightPiston.position.x = 4 + pistonOffset;

      // Vibration (Impact)
      const vibration = Math.sin(frame * 100) * impactForce * 0.1;
      steeringGroup.position.x = vibration;
      steeringGroup.position.z = vibration;

      // Fluid Glow
      tubeMat.opacity = 0.3 + Math.sin(frame * 10) * 0.2 * (hydraulicPressure / 20);

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
      stockMat.dispose();
      tillerMat.dispose();
      cylinderMat.dispose();
      pistonMat.dispose();
      tubeMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
