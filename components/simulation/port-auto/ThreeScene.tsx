import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortAutoSimulationProps } from './three-types';

export const ThreeScene: React.FC<PortAutoSimulationProps> = ({ agvCount, craneActive }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ agvCount, craneActive });

  useEffect(() => {
    propsRef.current = { agvCount, craneActive };
  }, [agvCount, craneActive]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x8b5cf6, 0.8);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    // Ground
    const gridHelper = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    scene.add(gridHelper);

    // Crane
    const craneGroup = new THREE.Group();
    const craneBase = new THREE.Mesh(new THREE.BoxGeometry(2, 10, 2), new THREE.MeshPhongMaterial({ color: '#f59e0b' }));
    craneBase.position.set(-10, 5, 0);
    craneGroup.add(craneBase);
    const craneArm = new THREE.Mesh(new THREE.BoxGeometry(15, 1, 1), new THREE.MeshPhongMaterial({ color: '#f59e0b' }));
    craneArm.position.set(-5, 10, 0);
    craneGroup.add(craneArm);
    const craneHook = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), new THREE.MeshPhongMaterial({ color: '#64748b' }));
    craneHook.position.set(0, 8.5, 0);
    craneGroup.add(craneHook);
    scene.add(craneGroup);

    // Containers (Yard)
    const yardGroup = new THREE.Group();
    const containerGeo = new THREE.BoxGeometry(3, 1.5, 1.5);
    const containerMat = new THREE.MeshPhongMaterial({ color: '#3b82f6' });
    for(let i=0; i<3; i++) {
      for(let j=0; j<4; j++) {
        const container = new THREE.Mesh(containerGeo, containerMat);
        container.position.set(5 + i*4, 0.75 + j*1.6, 0);
        yardGroup.add(container);
      }
    }
    scene.add(yardGroup);

    // AGVs
    const agvGeo = new THREE.BoxGeometry(2, 0.5, 1);
    const agvMat = new THREE.MeshPhongMaterial({ color: '#10b981' });
    const agvs: THREE.Mesh[] = [];

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;

      const currentProps = propsRef.current;

      // Manage AGVs based on count
      while (agvs.length < currentProps.agvCount) {
        const agv = new THREE.Mesh(agvGeo, agvMat);
        agv.position.set(Math.random() * 20 - 10, 0.25, Math.random() * 20 - 10);
        scene.add(agv);
        agvs.push(agv);
      }
      while (agvs.length > currentProps.agvCount) {
        const agv = agvs.pop();
        if (agv) scene.remove(agv);
      }

      // Move AGVs
      agvs.forEach((agv, i) => {
        agv.position.x += Math.sin(time + i) * 0.1;
        agv.position.z += Math.cos(time + i) * 0.1;
        agv.rotation.y = Math.atan2(Math.sin(time + i), Math.cos(time + i));
      });

      // Animate Crane
      if (currentProps.craneActive) {
        craneHook.position.x = -5 + Math.sin(time) * 5;
        craneHook.position.y = 8.5 + Math.cos(time * 2) * 1.5;
      }

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
