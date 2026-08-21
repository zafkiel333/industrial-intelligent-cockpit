import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LimitSwitchState } from './three-types';

interface ThreeSceneProps {
  state: LimitSwitchState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<LimitSwitchState>(state);

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
    camera.position.set(10, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Ship Deck (Base)
    const deckGeo = new THREE.BoxGeometry(10, 0.5, 6);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = -2;
    scene.add(deck);

    // Davit Arm (Pivot point at base)
    const davitGroup = new THREE.Group();
    davitGroup.position.set(-2, -1.75, 0);
    scene.add(davitGroup);

    const armGeo = new THREE.CylinderGeometry(0.3, 0.4, 8, 16);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6 }); // Yellow
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.y = 4;
    davitGroup.add(arm);

    const armTopGeo = new THREE.BoxGeometry(2, 0.5, 0.5);
    const armTop = new THREE.Mesh(armTopGeo, armMat);
    armTop.position.set(1, 8, 0);
    davitGroup.add(armTop);

    // Lifeboat
    const boatGeo = new THREE.CapsuleGeometry(1, 3, 4, 16);
    const boatMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3 }); // Orange
    const boat = new THREE.Mesh(boatGeo, boatMat);
    boat.rotation.z = Math.PI / 2;
    scene.add(boat);

    // Winch Wire (Line)
    const wireMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    const wireGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,-1,0)]);
    const wire = new THREE.Line(wireGeo, wireMat);
    scene.add(wire);

    // Limit Switch Assembly (Mounted on deck near davit base)
    const switchGroup = new THREE.Group();
    switchGroup.position.set(-1, -1.5, 0);
    scene.add(switchGroup);

    const switchBodyGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4);
    const switchBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const switchBody = new THREE.Mesh(switchBodyGeo, switchBodyMat);
    switchGroup.add(switchBody);

    // Switch Lever (Roller arm)
    const leverGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const lever = new THREE.Mesh(leverGeo, leverMat);
    lever.position.set(0.2, 0.3, 0);
    lever.rotation.z = Math.PI / 4;
    switchGroup.add(lever);

    // Striker Plate (Mounted on Davit Arm)
    const strikerGeo = new THREE.BoxGeometry(0.2, 0.4, 0.6);
    const strikerMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red
    const striker = new THREE.Mesh(strikerGeo, strikerMat);
    striker.position.set(0.5, 0.5, 0);
    davitGroup.add(striker);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Calculate Davit Angle based on position (0 = stowed/up, 100 = deployed/down)
      // Stowed angle ~ 15 deg (0.26 rad), Deployed angle ~ 75 deg (1.3 rad)
      const targetAngle = 0.26 + (currentState.davitPosition / 100) * 1.04;
      davitGroup.rotation.z = -targetAngle; // Rotate outwards

      // Update Lifeboat position (hanging from arm top)
      const armTopWorldPos = new THREE.Vector3();
      armTop.getWorldPosition(armTopWorldPos);
      
      // Boat lowers further as davit deploys
      const dropDepth = (currentState.davitPosition / 100) * 5;
      boat.position.set(armTopWorldPos.x, armTopWorldPos.y - 1 - dropDepth, armTopWorldPos.z);

      // Update Wire
      wireGeo.setFromPoints([armTopWorldPos, new THREE.Vector3(boat.position.x, boat.position.y + 0.5, boat.position.z)]);

      // Limit Switch Interaction
      // Check distance between striker and lever
      const strikerWorldPos = new THREE.Vector3();
      striker.getWorldPosition(strikerWorldPos);
      const leverWorldPos = new THREE.Vector3();
      lever.getWorldPosition(leverWorldPos);

      const dist = strikerWorldPos.distanceTo(leverWorldPos);
      
      if (currentState.limitSwitchEngaged) {
        // Lever pushed down
        lever.rotation.z = Math.PI / 2;
        switchBodyMat.emissive.setHex(0xef4444); // Red glow when engaged
        switchBodyMat.emissiveIntensity = 0.5;
      } else {
        // Lever normal
        lever.rotation.z = Math.PI / 4;
        switchBodyMat.emissiveIntensity = 0;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.1;

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
