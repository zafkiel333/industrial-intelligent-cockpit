import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortGroupSimulationProps } from './three-types';

export const ThreeScene: React.FC<PortGroupSimulationProps> = ({ waterLevel, lockState }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ waterLevel, lockState });

  // Update ref so animation loop can read latest without re-running useEffect
  useEffect(() => {
    propsRef.current = { waterLevel, lockState };
  }, [waterLevel, lockState]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Cleanup any existing canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // River bed
    const bedGeo = new THREE.BoxGeometry(30, 2, 10);
    const bedMat = new THREE.MeshPhongMaterial({ color: '#1e293b' });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = -1;
    scene.add(bed);

    // Water
    const waterGeo = new THREE.BoxGeometry(30, 1, 10);
    const waterMat = new THREE.MeshPhongMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.6 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);

    // Lock Gates
    const gateGeo = new THREE.BoxGeometry(1, 6, 10);
    const gateMat = new THREE.MeshPhongMaterial({ color: '#64748b' });
    const gate1 = new THREE.Mesh(gateGeo, gateMat);
    gate1.position.set(-5, 2, 0);
    scene.add(gate1);
    
    const gate2 = new THREE.Mesh(gateGeo, gateMat);
    gate2.position.set(5, 2, 0);
    scene.add(gate2);

    // Ship
    const shipGeo = new THREE.BoxGeometry(4, 2, 2);
    const shipMat = new THREE.MeshPhongMaterial({ color: '#f59e0b' });
    const ship = new THREE.Mesh(shipGeo, shipMat);
    scene.add(ship);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;

      const currentProps = propsRef.current;

      // Animate water level
      const targetWaterY = currentProps.waterLevel / 10; // 0 to 10 -> 0 to 1
      water.scale.y = THREE.MathUtils.lerp(water.scale.y, targetWaterY + 0.1, 0.05);
      water.position.y = (water.scale.y - 1) / 2;

      // Animate gates
      const targetGateY = currentProps.lockState === 'open' ? -4 : 2;
      gate1.position.y = THREE.MathUtils.lerp(gate1.position.y, targetGateY, 0.05);
      gate2.position.y = THREE.MathUtils.lerp(gate2.position.y, targetGateY, 0.05);

      // Animate ship
      ship.position.y = water.position.y + water.scale.y / 2 + 1;
      ship.position.x = Math.sin(time * 0.5) * 8; // move back and forth

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
  }, []); // Empty dependency array as requested

  return <div ref={mountRef} className="w-full h-full" />;
};
