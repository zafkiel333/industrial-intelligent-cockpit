import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LubeState } from './three-types';

interface ThreeSceneProps {
  state: LubeState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<LubeState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Rotary Mechanism
    const mechanismGroup = new THREE.Group();

    // Main Gear
    const mainGearGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const mainGearMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const mainGear = new THREE.Mesh(mainGearGeo, mainGearMat);
    mechanismGroup.add(mainGear);

    // Pinion Gear
    const pinionGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
    const pinionMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const pinion = new THREE.Mesh(pinionGeo, pinionMat);
    pinion.position.set(4, 0, 0);
    mechanismGroup.add(pinion);

    // Drill Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = -4;
    mechanismGroup.add(shaft);

    scene.add(mechanismGroup);

    // Lubrication System
    const lubeGroup = new THREE.Group();
    
    // Oil Tank
    const tankGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-5, 3, -3);
    lubeGroup.add(tank);

    // Oil Level Indicator (Inside tank)
    const oilGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.8, 16);
    const oilMat = new THREE.MeshStandardMaterial({ color: 0xeab308, transparent: true, opacity: 0.8 });
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.position.set(-5, 3, -3);
    lubeGroup.add(oil);

    // Pipe
    const pipeGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, 1.5, -3),
        new THREE.Vector3(-5, 0.5, 0),
        new THREE.Vector3(-3, 0.5, 0)
      ]),
      20, 0.1, 8, false
    );
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    lubeGroup.add(pipe);

    // Oil Drops (Particles)
    const dropCount = 50;
    const dropGeo = new THREE.BufferGeometry();
    const dropPos = new Float32Array(dropCount * 3);
    for (let i = 0; i < dropCount * 3; i++) {
      dropPos[i] = 0;
    }
    dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
    const dropMat = new THREE.PointsMaterial({ color: 0xeab308, size: 0.2, transparent: true, opacity: 0.8 });
    const drops = new THREE.Points(dropGeo, dropMat);
    scene.add(drops);

    scene.add(lubeGroup);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotation
      const speed = (currentState.rotationSpeed / 100) * 0.1;
      mainGear.rotation.y += speed;
      shaft.rotation.y += speed;
      pinion.rotation.y -= speed * 3; // Gear ratio

      // Oil Level
      const oilHeight = (currentState.oilLevel / 100) * 2.8;
      oil.scale.y = Math.max(0.01, currentState.oilLevel / 100);
      oil.position.y = 3 - (2.8 - oilHeight) / 2;

      // Lubrication Animation
      if (currentState.isLubricating && currentState.oilLevel > 0) {
        drops.visible = true;
        const positions = dropGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < dropCount; i++) {
          let y = positions[i * 3 + 1];
          if (y < -1 || y === 0) {
            // Reset drop at pipe exit
            positions[i * 3] = -3 + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          } else {
            // Fall
            positions[i * 3 + 1] -= 0.05 + Math.random() * 0.05;
          }
        }
        dropGeo.attributes.position.needsUpdate = true;
      } else {
        drops.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
